import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { ModelClient } from '../clients/ModelClient.js';
import { extractCodeBlock } from '../utils/CodeExtractor.js';
import { SOVEREIGN_SYSTEM_PROMPT } from '../prompts/SystemPrompts.js';
import { YaoState } from '../core/models.js';
import { SmartEdit } from '../utils/SmartEdit.js';
import { ValidationSystem } from './ValidationSystem.js';
import { ArchitecturalValidator } from './ArchitecturalValidator.js';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";
const logger = createLogger('CodeEngine');
/** Strategies that block all code modifications */
const EDIT_BLOCKING_STRATEGIES = ['FREEZE', 'ROLLBACK', 'PAUSE', 'DEEP_DORMANCY'];
/**
 * CodeEngine â€” Code analysis and transformation.
 * Review, explain, fix, and refactor with ternary confidence scoring.
 */
export class CodeEngine {
    config;
    router;
    client;
    validation;
    manifest = {
        primaryGoal: 'NO MOCKS, TSC TIGHT, Sovereign Substrate Integrity',
        dependencyRules: {
            'core': ['utils', 'types', 'prompts', 'config'],
            'engines': ['core', 'utils', 'types', 'prompts', 'config', 'clients', 'routing'],
            'routing': ['core', 'utils', 'types', 'config'],
            'clients': ['core', 'utils', 'types', 'config'],
            'ui': ['core', 'types', 'routing'],
            'cli': ['core', 'engines', 'routing', 'ui', 'config']
        },
        domainModel: {}
    };
    constructor(config, router) {
        this.config = config;
        this.router = router;
        this.client = new ModelClient(config, router);
        this.validation = new ValidationSystem([
            new ArchitecturalValidator(this.manifest)
        ]);
    }
    // ═══════════════════════════════════════════════════════════════
    // Phase 29: Young/Old Snapshot Infrastructure
    // Young = stable before state. Old = proposed after state.
    // All edits are gated through Hexagram strategy + deletion guard.
    // ═══════════════════════════════════════════════════════════════
    getSnapshotDir() {
        const dir = join(getSovereignRoot(), 'snapshots', 'edits');
        if (!existsSync(dir))
            mkdirSync(dir, { recursive: true });
        return dir;
    }
    snapshotYoung(filePath, content) {
        const ts = Date.now();
        const name = basename(filePath).replace(/\.[^.]+$/, '');
        const snapPath = join(this.getSnapshotDir(), `${ts}_${name}.young.ts`);
        writeFileSync(snapPath, content, 'utf8');
        logger.info({ snapPath, filePath }, '📸 Young state snapshot saved (before edit).');
        return snapPath;
    }
    snapshotOld(filePath, content) {
        const ts = Date.now();
        const name = basename(filePath).replace(/\.[^.]+$/, '');
        const snapPath = join(this.getSnapshotDir(), `${ts}_${name}.old.ts`);
        writeFileSync(snapPath, content, 'utf8');
        logger.info({ snapPath, filePath }, '📸 Old state snapshot saved (after edit).');
        return snapPath;
    }
    /**
     * Hexagram Edit Gate: consults the current hexagram strategy.
     * Returns null if edit is permitted, or an error Result if blocked.
     */
    checkHexagramGate(action, filePath) {
        const hexagram = this.router.getHexagram();
        const interpretation = hexagram.getInterpretation();
        const strategy = interpretation.strategy.split(':')[0]?.trim() || '';
        if (EDIT_BLOCKING_STRATEGIES.includes(strategy)) {
            logger.warn({ strategy, action, filePath }, '🚫 Hexagram gate BLOCKED edit. Strategy forbids modification.');
            return {
                ok: false,
                error: new Error(`Hexagram Gate: ${strategy} strategy active (${interpretation.name}). Code modifications are suspended. Wait for state transition.`)
            };
        }
        return null;
    }
    /**
     * Phase 29: Safe write with Young/Old snapshots + function-deletion guard.
     * If the modified code deletes any exported symbol, the Young snapshot is restored.
     */
    safeWriteWithGuard(filePath, originalContent, modifiedContent) {
        // 1. Snapshot Young (before)
        const youngPath = this.snapshotYoung(filePath, originalContent);
        // 2. Function-Deletion Guard
        const archValidator = new ArchitecturalValidator(this.manifest);
        const preservation = archValidator.validatePreservation(originalContent, modifiedContent);
        if (!preservation.ok) {
            logger.error({ filePath, error: preservation.error?.reason }, '🛡️ Function-Deletion Guard BLOCKED write. Restoring Young state.');
            // Restore original — the Young snapshot is the safety net
            writeFileSync(filePath, originalContent, 'utf8');
            return { ok: false, error: new Error(preservation.error?.reason || 'Function deletion detected') };
        }
        // 3. Write the modified content
        writeFileSync(filePath, modifiedContent, 'utf8');
        // 4. Snapshot Old (after)
        this.snapshotOld(filePath, modifiedContent);
        logger.info({ filePath, youngPath }, '✅ Safe write complete. Young/Old snapshots preserved.');
        return { ok: true, value: undefined };
    }
    async review(params) {
        if (!existsSync(params.filePath))
            return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        // 1. Organic Routing
        const route = await this.router.route('YinYang', 'review');
        const model = params.modelOverride ?? route.model;
        // 2. Cognitive Modulation (The Ghost in the Machine)
        const hexagram = this.router.getHexagram();
        const interpretation = hexagram.getInterpretation();
        const yao = hexagram.getYaoState();
        let adversarialDirectives = '';
        if (yao === YaoState.OldYang) {
            adversarialDirectives = '\nðŸš§ ADVERSARIAL ALERT: Substrate flux detected. Perform a HYPER-METICULOUS review. Suspect all implicit types.';
        }
        else if (yao === YaoState.OldYin) {
            adversarialDirectives = '\nðŸŒŠ ENTROPIC ALERT: System decay detected. Focus on dead-code elimination and minimalist pruning.';
        }
        const strictRules = params.strict
            ? `\nSTRICT MODE ACTIVE â€” enforce ALL of the following:\n- No 'any' types\n- All functions have return types\n- No console.log in production\n- No empty catch blocks\n- No unused variables`
            : '';
        const cognitiveBias = `\nCOGNITIVE STRATEGY: ${interpretation.strategy}\nYAO_STATE: ${yao}${adversarialDirectives}`;
        const prompt = `Perform a thorough adversarial code review of this file.
${cognitiveBias}

Scoring system (ternary):
  Yang   (80-100): Production-ready â€” minor suggestions only
  YinYang (50-79): Needs work â€” real issues present
  Yin     (0-49):  Critical â€” blocking problems
${strictRules}

FILE: ${params.filePath}
\`\`\`
${content}
\`\`\`

Respond in this exact format:
SCORE: [0-100]
TIER: [Yang|YinYang|Yin]
SUMMARY: [one-line verdict]

ISSUES:
1. [SEVERITY: Critical|High|Medium|Low] [Line X] Description
2. ...

RECOMMENDATIONS:
- Specific actionable improvements`;
        const result = await this.client.resilientCall({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1,
            category: 'coding'
        });
        if (!result.ok) {
            this.router.recordFailure(model);
            return result;
        }
        this.router.recordSuccess(model);
        logger.info({ file: params.filePath, model }, 'Code review complete');
        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { model, file: params.filePath, strict: params.strict, yaoState: route.yaoState }
            }
        };
    }
    async explain(params) {
        if (!existsSync(params.filePath))
            return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        let content = readFileSync(params.filePath, 'utf8');
        if (params.lineRange) {
            const lines = content.split('\n');
            const [start, end] = params.lineRange;
            content = lines.slice(start - 1, end).join('\n');
        }
        const route = await this.router.route('Yin');
        const model = params.modelOverride ?? route.model;
        const sectionNote = params.lineRange
            ? ` (lines ${params.lineRange[0]}â€“${params.lineRange[1]})`
            : '';
        const prompt = `Provide a deep, structured explanation of this code${sectionNote}.

Cover:
1. What it does (high-level purpose)
2. Why it works this way (architectural reasoning)
3. Key data flows and side effects
4. Non-obvious patterns or gotchas
5. Dependencies and what breaks if they change

CODE FROM ${params.filePath}:
\`\`\`
${content}
\`\`\`

Be precise and technical. Assume the reader is an expert developer.`;
        const result = await this.client.resilientCall({
            model,
            prompt,
            temperature: 0.3,
            category: 'coding'
        });
        if (!result.ok) {
            this.router.recordFailure(model);
            return result;
        }
        this.router.recordSuccess(model);
        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { model, file: params.filePath, yaoState: route.yaoState }
            }
        };
    }
    async fix(params) {
        if (!existsSync(params.filePath))
            return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        // Phase 29: Hexagram Gate — block edits during FREEZE/ROLLBACK
        const gate = this.checkHexagramGate('fix', params.filePath);
        if (gate)
            return gate;
        const route = await this.router.route('YinYang', 'fix');
        const model = params.modelOverride ?? route.model;
        const hexagram = this.router.getHexagram();
        const interpretation = hexagram.getInterpretation();
        const yao = hexagram.getYaoState();
        const cognitiveBias = `\nCOGNITIVE STRATEGY: ${interpretation.strategy}\nYAO_STATE: ${yao}`;
        const prompt = `Fix ALL TypeScript errors, lint violations, and code quality issues in this file.
${cognitiveBias}

Rules:
1. Fix every error — no leaving partial fixes
2. Maintain all existing functionality — DO NOT remove any functions, classes, or exports
3. Do not introduce mocks or stubs
4. Add missing return types where TypeScript requires them
5. Remove all 'any' types where a real type can be inferred
6. NEVER delete a function to fix an error — fix the function itself

FILE: ${params.filePath}
\`\`\`
${content}
\`\`\`

Output the COMPLETE fixed file:`;
        const result = await this.client.resilientCall({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1,
            category: 'coding'
        });
        if (!result.ok) {
            this.router.recordFailure(model);
            return result;
        }
        this.router.recordSuccess(model);
        const fixed = extractCodeBlock(result.value.response) ?? result.value.response;
        if (!params.dryRun) {
            try {
                // Phase 29: Safe write with Young/Old snapshots + function-deletion guard
                const writeResult = this.safeWriteWithGuard(params.filePath, content, fixed);
                if (!writeResult.ok) {
                    return { ok: false, error: writeResult.error };
                }
                // ARCHITECTURAL VALIDATION (post-write)
                const valid = await this.validation.validateAll(fixed, { fileName: params.filePath });
                if (!valid.ok) {
                    // Restore Young state on architectural violation
                    writeFileSync(params.filePath, content, 'utf8');
                    return { ok: false, error: new Error(`Fix interrupted by architectural violation: ${valid.error?.reason}. Young state restored.`) };
                }
            }
            catch (err) {
                return { ok: false, error: err };
            }
        }
        return {
            ok: true,
            value: {
                output: params.dryRun ? fixed : `Fixes applied to ${params.filePath}`,
                data: { model, dryRun: params.dryRun, yaoState: route.yaoState }
            }
        };
    }
    async refactor(params) {
        if (!existsSync(params.filePath))
            return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        // Phase 29: Hexagram Gate
        const gate = this.checkHexagramGate('refactor', params.filePath);
        if (gate)
            return gate;
        const route = await this.router.route('Yang', 'refactor');
        const model = params.modelOverride ?? route.model;
        const extraRules = params.additionalRules.length > 0
            ? `\nADDITIONAL RULES:\n${params.additionalRules.map(r => `- ${r}`).join('\n')}`
            : '';
        const hexagram = this.router.getHexagram();
        const interpretation = hexagram.getInterpretation();
        const yao = hexagram.getYaoState();
        const cognitiveBias = `\nCOGNITIVE STRATEGY: ${interpretation.strategy}\nYAO_STATE: ${yao}`;
        const prompt = `Refactor this file to meet sovereign architectural standards.
${cognitiveBias}

SOVEREIGN LAWS:
1. NO MOCKS or faked data — only real implementations
2. NO TODOs, stubs, or placeholder logic
3. Use readonly for all immutable properties
4. Replace 'any' with specific types or 'unknown'
5. All functions must have explicit return types
6. Prefer composition over inheritance
7. Use Result<T> for all fallible operations
8. NEVER remove/delete existing functions — refactor them in-place${extraRules}

FILE: ${params.filePath}
\`\`\`
${content}
\`\`\`

Output the COMPLETE refactored file:`;
        const result = await this.client.resilientCall({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.15,
            category: 'coding'
        });
        if (!result.ok) {
            this.router.recordFailure(model);
            return result;
        }
        this.router.recordSuccess(model);
        const refactored = extractCodeBlock(result.value.response) ?? result.value.response;
        try {
            // Phase 29: Safe write with Young/Old snapshots + function-deletion guard
            const writeResult = this.safeWriteWithGuard(params.filePath, content, refactored);
            if (!writeResult.ok) {
                return { ok: false, error: writeResult.error };
            }
            // ARCHITECTURAL VALIDATION (post-write)
            const valid = await this.validation.validateAll(refactored, { fileName: params.filePath });
            if (!valid.ok) {
                writeFileSync(params.filePath, content, 'utf8');
                return { ok: false, error: new Error(`Refactor rejected: ${valid.error?.reason}. Young state restored.`) };
            }
        }
        catch (err) {
            return { ok: false, error: err };
        }
        return {
            ok: true,
            value: {
                output: `Refactored and written to ${params.filePath}`,
                data: { model, file: params.filePath, yaoState: route.yaoState }
            }
        };
    }
    async semanticDiff(params) {
        if (!existsSync(params.fileA))
            return { ok: false, error: new Error(`File not found: ${params.fileA}`) };
        if (!existsSync(params.fileB))
            return { ok: false, error: new Error(`File not found: ${params.fileB}`) };
        const contentA = readFileSync(params.fileA, 'utf8');
        const contentB = readFileSync(params.fileB, 'utf8');
        const route = await this.router.route('Yin');
        const model = params.modelOverride ?? route.model;
        const prompt = `Provide a semantic diff between these two files. Explain changes in natural language.

Cover:
- What was added, removed, or modified
- Why the changes were likely made (inferred intent)
- Impact on behavior and interface contracts
- Any breaking changes or compatibility notes
- Overall assessment: improvement / regression / lateral change

FILE A: ${params.fileA}
\`\`\`
${contentA}
\`\`\`

FILE B: ${params.fileB}
\`\`\`
${contentB}
\`\`\`

Provide a structured semantic analysis:`;
        const result = await this.client.call({ model, prompt, temperature: 0.2, category: 'coding' });
        if (!result.ok) {
            this.router.recordFailure(model);
            return result;
        }
        this.router.recordSuccess(model);
        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { model, fileA: params.fileA, fileB: params.fileB }
            }
        };
    }
    async smartEdit(params) {
        if (!existsSync(params.filePath))
            return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        // Phase 29: Hexagram Gate
        const gate = this.checkHexagramGate('smartEdit', params.filePath);
        if (gate)
            return gate;
        const result = await SmartEdit.calculateReplacement(content, {
            file_path: params.filePath,
            old_string: params.oldString,
            new_string: params.newString
        });
        if (result.occurrences === 0) {
            return {
                ok: false,
                error: new Error(`Could not find a match for the specified 'oldString' in ${params.filePath}. Use 'edit_code' for a full rewrite if indentation is too complex.`)
            };
        }
        const finalContent = SmartEdit.restoreTrailingNewline(content, result.newContent);
        try {
            // Phase 29: Safe write with Young/Old snapshots + function-deletion guard
            const writeResult = this.safeWriteWithGuard(params.filePath, content, finalContent);
            if (!writeResult.ok) {
                return { ok: false, error: writeResult.error };
            }
            logger.info({ file: params.filePath, strategy: result.strategy }, 'SmartEdit applied with Young/Old snapshots.');
        }
        catch (err) {
            return { ok: false, error: err };
        }
        return {
            ok: true,
            value: {
                output: `Successfully applied SmartEdit (${result.strategy} strategy) to ${params.filePath}. Found ${result.occurrences} occurrence(s).`,
                data: { strategy: result.strategy, occurrences: result.occurrences }
            }
        };
    }
    healthCheck() {
        const clientOk = !!this.client;
        const routerOk = !!this.router;
        return {
            online: clientOk && routerOk,
            details: `Analytic Substrate: Client(${clientOk}), Router(${routerOk})`
        };
    }
}
