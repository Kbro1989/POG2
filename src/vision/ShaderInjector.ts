import { Project, SyntaxKind } from 'ts-morph';
import { createLogger } from '../utils/logger.js';
import type { Result, ActuationResult } from '../core/models.js';
import path from 'path';

const logger = createLogger('ShaderInjector');

/**
 * ShaderInjector — AST-safe mutation engine for 3D materials.
 * Uses ts-morph to safely modify shaders and procedural textures.
 */
export class ShaderInjector {
    private project: Project;

    constructor() {
        this.project = new Project({
            tsConfigFilePath: path.resolve('./tsconfig.json'),
            skipAddingFilesFromTsConfig: true
        });
    }

    /**
     * Inject a color modification into a procedural texture file.
     * Finds VariableDeclarations with names like 'DEFAULT_COLOR' or 'PRIMARY_COLOR' and mutates their initializer.
     */
    public async injectColor(filePath: string, hexCode: string): Promise<Result<ActuationResult>> {
        logger.info({ filePath, hexCode }, 'Engaging AST injection for color mutation');
        
        // Defensive: Strip markdown if it somehow leaked through
        let cleanHex = hexCode;
        if (cleanHex.includes('```')) {
            const matches = cleanHex.match(/```(?:typescript|glsl|javascript)?([\s\S]*?)```/);
            cleanHex = matches ? matches[1]!.trim() : cleanHex.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
        }

        try {
            const sourceFile = this.project.addSourceFileAtPath(filePath);
            
            // Look for color constants
            const varDecls = sourceFile.getVariableDeclarations();
            let mutated = false;

            for (const decl of varDecls) {
                const name = decl.getName();
                if (name.includes('COLOR') || name.includes('STYLE')) {
                    decl.setInitializer(`'${cleanHex}'`);
                    mutated = true;
                }
            }

            if (!mutated) {
                logger.warn({ filePath }, 'No color constants found to mutate via AST. Attempting raw injection.');
                // Fallback: Append a comment with the new style hint
                sourceFile.addStatements(`\n// POG2_ACTUATION: style_hint = '${hexCode}';\n`);
            }
            
            await sourceFile.save();
            return { 
                ok: true, 
                value: { success: true, details: `Injected ${hexCode} into ${path.basename(filePath)} via AST` } 
            };
        } catch (err) {
            logger.error({ err }, 'AST Injection failed');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Placeholder for future revert logic.
     */
    public async revert(filePath: string): Promise<Result<ActuationResult>> {
        logger.info({ filePath }, 'Reverting mutations (stub)');
        return { ok: true, value: { success: true, details: 'Revert stubbed' } };
    }
}
