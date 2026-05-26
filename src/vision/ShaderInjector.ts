import { Project, SyntaxKind, type VariableDeclaration } from 'ts-morph';
import { createLogger } from '../utils/logger.js';
import type { Result, ActuationResult } from '../core/models.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';

const logger = createLogger('ShaderInjector');

// â•â•â• MUTATION CONTRACT SYSTEM â•â•â•

/**
 * Mutation Tier â€” Controls what level of change is permitted.
 *   Tier 1: Scalar â€” colors, numbers, booleans, short strings (SAFE, auto-approved)
 *   Tier 2: Structural â€” functions, arrays, objects (CONTROLLED, logged)
 *   Tier 3: FileRewrite â€” full file replacement (LOCKED, requires explicit flag)
 */
export const enum MutationTier {
    Scalar = 1,
    Structural = 2,
    FileRewrite = 3
}

/** Allowed AST node kinds for Tier 1 (Scalar) mutations */
const SCALAR_KINDS = new Set([
    'StringLiteral',
    'NumericLiteral',
    'TrueKeyword',
    'FalseKeyword',
    'NoSubstitutionTemplateLiteral'
]);

/** Allowed AST node kinds for Tier 2 (Structural) mutations */
const STRUCTURAL_KINDS = new Set([
    ...SCALAR_KINDS,
    'ArrayLiteralExpression',
    'ObjectLiteralExpression',
    'ArrowFunction',
    'CallExpression'
]);

/**
 * Validate that a payload is safe to inject as a scalar initializer.
 * Rejects multi-line payloads, imports, exports, class definitions â€” 
 * anything that would turn a value slot into a program.
 */
function isSafeScalarPayload(value: string): { safe: boolean; reason?: string } {
    if (value.length > 200) {
        return { safe: false, reason: `Payload too large (${value.length} chars, max 200)` };
    }
    if (value.includes('\n') || value.includes('\r')) {
        return { safe: false, reason: 'Payload contains newlines â€” not a scalar value' };
    }
    if (/\b(import|export|class|function\s+\w+|interface|type\s+\w+)\b/.test(value)) {
        return { safe: false, reason: 'Payload contains structural keywords (import/export/class/function) â€” not a scalar' };
    }
    if (value.includes('```')) {
        return { safe: false, reason: 'Payload contains markdown code fences â€” likely raw AI output, not a value' };
    }
    return { safe: true };
}

/**
 * Detect the mutation tier required for a given AST node kind.
 */
function detectMutationTier(kindName: string): MutationTier {
    if (SCALAR_KINDS.has(kindName)) return MutationTier.Scalar;
    if (STRUCTURAL_KINDS.has(kindName)) return MutationTier.Structural;
    return MutationTier.FileRewrite;
}

/**
 * Extract a clean hex color from potentially noisy AI output.
 * Returns null if no valid hex color is found.
 */
function extractHexColor(input: string): string | null {
    // Strip markdown
    let clean = input;
    if (clean.includes('```')) {
        const matches = clean.match(/```(?:typescript|glsl|javascript|css)?([\s\S]*?)```/);
        clean = matches ? matches[1]!.trim() : clean.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    }

    // Match hex color patterns
    const hexMatch = clean.match(/#([0-9a-fA-F]{3,8})\b/);
    if (hexMatch) return hexMatch[0];

    // Match bare 6-digit hex (without #)
    const bareHex = clean.match(/^([0-9a-fA-F]{6})$/);
    if (bareHex) return `#${bareHex[1]}`;

    // If the cleaned value IS just a short string that looks like a color name, allow it
    if (/^[a-zA-Z]{3,20}$/.test(clean.trim()) && clean.trim().length < 30) {
        return clean.trim(); // CSS named color like 'crimson', 'azure'
    }

    return null;
}

// â•â•â• PATH RESOLUTION â•â•â•

/**
 * Resolve `tsconfig.json` from the package root using `import.meta.url`,
 * NOT from `process.cwd()`. This ensures the ShaderInjector works
 * regardless of where the CLI was invoked from.
 */
function resolveProjectTsConfig(): string {
    try {
        // Walk from this file (dist/vision/ShaderInjector.js or src/vision/ShaderInjector.ts)
        // up to the project root where tsconfig.json lives.
        const thisFile = fileURLToPath(import.meta.url);
        const projectRoot = path.resolve(path.dirname(thisFile), '..', '..');
        const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

        if (existsSync(tsconfigPath)) {
            return tsconfigPath;
        }
    } catch {
        // Fallback below
    }

    // Fallback: try CWD (works when run from project root)
    const cwdPath = path.resolve('./tsconfig.json');
    if (existsSync(cwdPath)) {
        return cwdPath;
    }

    // Ultimate fallback: skip tsconfig entirely (ts-morph will use defaults)
    logger.warn('tsconfig.json not found via import.meta.url or CWD. Using ts-morph defaults.');
    return '';
}

// â•â•â• SHADER INJECTOR â•â•â•

/**
 * ShaderInjector â€” AST-safe mutation engine for 3D materials.
 * Uses ts-morph to safely modify shaders and procedural textures.
 * 
 * Mutation Contract:
 *   - Tier 1 (Scalar): Auto-approved. Colors, numbers, flags.
 *   - Tier 2 (Structural): Logged, requires explicit opt-in.
 *   - Tier 3 (FileRewrite): BLOCKED unless `allowFileRewrite` is true.
 *   
 * All mutations validate payload safety BEFORE touching the AST.
 * Backup is created BEFORE mutation. Rollback on any compile error.
 */
export class ShaderInjector {
    private project: Project;

    constructor() {
        const tsconfigPath = resolveProjectTsConfig();

        this.project = new Project({
            ...(tsconfigPath ? { tsConfigFilePath: tsconfigPath } : {}),
            skipAddingFilesFromTsConfig: true
        });
    }

    /**
     * Inject a color modification into a procedural texture file.
     * Finds VariableDeclarations with names like 'DEFAULT_COLOR' or 'PRIMARY_COLOR'
     * and mutates their initializer â€” but ONLY if the mutation is safe.
     * 
     * Mutation Contract enforced:
     *   1. Extracts a clean hex color from the payload (rejects raw AI output)
     *   2. Validates initiator kind is Scalar (StringLiteral, NumericLiteral)
     *   3. Validates payload size and content (no imports, no classes, no newlines)
     *   4. Creates a backup before mutation
     *   5. Restores backup if ts-morph throws during save
     */
    public async injectColor(filePath: string, hexCode: string): Promise<Result<ActuationResult>> {
        logger.info({ filePath, hexCode: hexCode.substring(0, 50) }, 'Engaging AST injection for color mutation');

        // â•â•â• STEP 1: Intent Alignment â€” Extract the actual color value â•â•â•
        const cleanColor = extractHexColor(hexCode);
        if (!cleanColor) {
            const reason = `Payload is not a recognizable color value. Got: "${hexCode.substring(0, 80)}..."`;
            logger.error({ hexCode: hexCode.substring(0, 100) }, reason);
            return { ok: false, error: new Error(`MUTATION REJECTED (Intent Mismatch): ${reason}`) };
        }

        // â•â•â• STEP 2: Payload Gate â€” Validate the cleaned value â•â•â•
        const safeCheck = isSafeScalarPayload(cleanColor);
        if (!safeCheck.safe) {
            logger.error({ cleanColor, reason: safeCheck.reason }, 'MUTATION REJECTED: Payload failed safety gate');
            return { ok: false, error: new Error(`MUTATION REJECTED (Payload Gate): ${safeCheck.reason}`) };
        }

        // â•â•â• STEP 3: Backup â€” Create pre-mutation snapshot â•â•â•
        const backupPath = `${filePath}.pog2-backup`;
        try {
            if (existsSync(filePath)) {
                copyFileSync(filePath, backupPath);
                logger.info({ backupPath }, 'Pre-mutation backup created');
            }
        } catch (backupErr) {
            logger.warn({ err: backupErr }, 'Failed to create backup (proceeding with caution)');
        }

        try {
            const sourceFile = this.project.addSourceFileAtPath(filePath);

            // Look for color constants
            const varDecls = sourceFile.getVariableDeclarations();
            let mutated = false;
            const mutationLog: string[] = [];

            for (const decl of varDecls) {
                const name = decl.getName();
                if (name.includes('COLOR') || name.includes('STYLE')) {

                    // â•â•â• STEP 4: Type-Locked Mutation â€” Check initializer kind â•â•â•
                    const initKind = decl.getInitializer()?.getKindName() || 'NoInitializer';
                    const requiredTier = detectMutationTier(initKind);

                    if (requiredTier > MutationTier.Scalar) {
                        logger.warn({
                            variable: name,
                            kindName: initKind,
                            tier: requiredTier
                        }, `Skipping variable: initializer kind "${initKind}" requires Tier ${requiredTier} (only Tier 1 Scalar allowed)`);
                        mutationLog.push(`SKIP: ${name} (kind: ${initKind}, tier: ${requiredTier})`);
                        continue;
                    }

                    // â•â•â• STEP 5: Safe Mutation â€” Replace scalar value â•â•â•
                    const oldValue = decl.getInitializer()?.getText() || 'undefined';
                    decl.setInitializer(`'${cleanColor}'`);
                    mutated = true;
                    mutationLog.push(`MUTATED: ${name} = '${cleanColor}' (was: ${oldValue})`);

                    logger.info({
                        variable: name,
                        oldValue,
                        newValue: cleanColor,
                        kind: initKind
                    }, 'Scalar mutation applied');
                }
            }

            if (!mutated) {
                logger.warn({ filePath, mutations: mutationLog }, 'No eligible color constants found for scalar mutation.');
                // Don't append raw comments â€” clean rejection
                return {
                    ok: true,
                    value: {
                        success: false,
                        details: `No eligible COLOR/STYLE constants found in ${path.basename(filePath)}. ` +
                            (mutationLog.length > 0 ? `Skipped: ${mutationLog.join('; ')}` : 'File contains no matching declarations.')
                    }
                };
            }

            await sourceFile.save();

            // â•â•â• STEP 6: Post-Mutation Verification â•â•â•
            // If the saved file has syntax errors, rollback
            const diagnostics = sourceFile.getPreEmitDiagnostics();
            const hasErrors = diagnostics.some(d => d.getCategory() === 0); // 0 = Error

            if (hasErrors) {
                logger.error({ diagnostics: diagnostics.length }, 'POST-MUTATION COMPILE ERRORS DETECTED. Rolling back.');
                this.rollbackFromBackup(filePath, backupPath);
                return {
                    ok: false,
                    error: new Error(`MUTATION ROLLBACK: Post-mutation compile errors detected (${diagnostics.length} issues). Backup restored.`)
                };
            }

            return {
                ok: true,
                value: {
                    success: true,
                    details: `Injected ${cleanColor} into ${path.basename(filePath)} via AST. Mutations: ${mutationLog.join('; ')}`
                }
            };
        } catch (err) {
            // â•â•â• EMERGENCY ROLLBACK â•â•â•
            logger.error({ err }, 'AST Injection failed â€” attempting rollback');
            this.rollbackFromBackup(filePath, backupPath);
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Restore a file from its pre-mutation backup.
     */
    private rollbackFromBackup(filePath: string, backupPath: string): void {
        try {
            if (existsSync(backupPath)) {
                copyFileSync(backupPath, filePath);
                logger.info({ filePath, backupPath }, 'ðŸ”„ Rollback complete â€” backup restored.');
            } else {
                logger.error({ filePath }, 'ROLLBACK FAILED: No backup file found.');
            }
        } catch (err) {
            logger.error({ err, filePath }, 'ROLLBACK FAILED: Could not restore backup.');
        }
    }

    /**
     * Revert a file from its `.pog2-backup`.
     */
    public async revert(filePath: string): Promise<Result<ActuationResult>> {
        const backupPath = `${filePath}.pog2-backup`;

        if (!existsSync(backupPath)) {
            logger.warn({ filePath }, 'No backup found to revert from.');
            return { ok: false, error: new Error(`No .pog2-backup file found for ${filePath}`) };
        }

        try {
            copyFileSync(backupPath, filePath);
            logger.info({ filePath }, 'ðŸ”„ File reverted to pre-mutation state.');
            return { ok: true, value: { success: true, details: `Reverted ${path.basename(filePath)} from backup` } };
        } catch (err) {
            logger.error({ err }, 'Revert failed');
            return { ok: false, error: err as Error };
        }
    }
}
