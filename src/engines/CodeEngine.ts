import { readFileSync, writeFileSync, existsSync } from 'fs';
import pino from 'pino';
import { ModelClient } from '../clients/ModelClient.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { extractCodeBlock } from '../utils/CodeExtractor.js';
import { SOVEREIGN_SYSTEM_PROMPT } from '../prompts/SystemPrompts.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput, ArchitectureManifest } from '../core/models.js';
import { YaoState } from '../core/models.js';
import { SmartEdit, type SmartEditParams as SEParams, type SmartEditResult } from '../utils/SmartEdit.js';
import { ValidationSystem } from './ValidationSystem.js';
import { ArchitecturalValidator } from './ArchitecturalValidator.js';

const logger = pino({ name: 'CodeEngine', base: { hostname: 'POG2' } });

export interface ReviewParams {
    filePath: string;
    modelOverride?: string;
    strict: boolean;
}

export interface ExplainParams {
    filePath: string;
    lineRange?: [number, number];
    modelOverride?: string;
}

export interface FixParams {
    filePath: string;
    modelOverride?: string;
    dryRun: boolean;
}

export interface RefactorParams {
    filePath: string;
    modelOverride?: string;
    additionalRules: string[];
}

export interface SemanticDiffParams {
    fileA: string;
    fileB: string;
    modelOverride?: string;
}

export interface SmartEditEngineParams {
    filePath: string;
    oldString: string;
    newString: string;
    modelOverride?: string;
}

/**
 * CodeEngine â€” Code analysis and transformation.
 * Review, explain, fix, and refactor with ternary confidence scoring.
 */
export class CodeEngine {
    private readonly client: ModelClient;
    private readonly validation: ValidationSystem;
    private readonly manifest: ArchitectureManifest = {
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

    constructor(
        private readonly config: SovereignConfig,
        private readonly router: TernaryRouter
    ) {
        this.client = new ModelClient(config, router);
        this.validation = new ValidationSystem([
            new ArchitecturalValidator(this.manifest)
        ]);
    }

    async review(params: ReviewParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
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
        } else if (yao === YaoState.OldYin) {
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
            return result as Result<EngineOutput>;
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

    async explain(params: ExplainParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
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
            return result as Result<EngineOutput>;
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

    async fix(params: FixParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const route = await this.router.route('YinYang', 'fix');
        const model = params.modelOverride ?? route.model;

        const prompt = `Fix ALL TypeScript errors, lint violations, and code quality issues in this file.

Rules:
1. Fix every error â€” no leaving partial fixes
2. Maintain all existing functionality
3. Do not introduce mocks or stubs
4. Add missing return types where TypeScript requires them
5. Remove all 'any' types where a real type can be inferred

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
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const fixed = extractCodeBlock(result.value.response) ?? result.value.response;

        if (!params.dryRun) {
            try {
                writeFileSync(params.filePath, fixed, 'utf8');
                logger.info({ file: params.filePath }, 'Fixes applied to disk');

                // ARCHITECTURAL VALIDATION
                const valid = await this.validation.validateAll(fixed, { fileName: params.filePath });
                if (!valid.ok) {
                    return { ok: false, error: new Error(`Fix interrupted by architectural violation: ${valid.error?.reason}`) };
                }
            } catch (err) {
                return { ok: false, error: err as Error };
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

    async refactor(params: RefactorParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const route = await this.router.route('Yang', 'refactor');
        const model = params.modelOverride ?? route.model;

        const extraRules = params.additionalRules.length > 0
            ? `\nADDITIONAL RULES:\n${params.additionalRules.map(r => `- ${r}`).join('\n')}`
            : '';

        const prompt = `Refactor this file to meet sovereign architectural standards.

SOVEREIGN LAWS:
1. NO MOCKS or faked data â€” only real implementations
2. NO TODOs, stubs, or placeholder logic
3. Use readonly for all immutable properties
4. Replace 'any' with specific types or 'unknown'
5. All functions must have explicit return types
6. Prefer composition over inheritance
7. Use Result<T> for all fallible operations${extraRules}

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
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const refactored = extractCodeBlock(result.value.response) ?? result.value.response;

        try {
            writeFileSync(params.filePath, refactored, 'utf8');

            // ARCHITECTURAL VALIDATION
            const valid = await this.validation.validateAll(refactored, { fileName: params.filePath });
            if (!valid.ok) {
                return { ok: false, error: new Error(`Refactor rejected: ${valid.error?.reason}`) };
            }
        } catch (err) {
            return { ok: false, error: err as Error };
        }

        return {
            ok: true,
            value: {
                output: `Refactored and written to ${params.filePath}`,
                data: { model, file: params.filePath, yaoState: route.yaoState }
            }
        };
    }

    async semanticDiff(params: SemanticDiffParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.fileA)) return { ok: false, error: new Error(`File not found: ${params.fileA}`) };
        if (!existsSync(params.fileB)) return { ok: false, error: new Error(`File not found: ${params.fileB}`) };
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
            return result as Result<EngineOutput>;
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

    async smartEdit(params: SmartEditEngineParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');

        const result: SmartEditResult = await SmartEdit.calculateReplacement(content, {
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
            writeFileSync(params.filePath, finalContent, 'utf8');
            logger.info({ file: params.filePath, strategy: result.strategy }, 'SmartEdit applied');
        } catch (err) {
            return { ok: false, error: err as Error };
        }

        return {
            ok: true,
            value: {
                output: `Successfully applied SmartEdit (${result.strategy} strategy) to ${params.filePath}. Found ${result.occurrences} occurrence(s).`,
                data: { strategy: result.strategy, occurrences: result.occurrences }
            }
        };
    }
    public healthCheck(): { online: boolean; details: string } {
        const clientOk = !!this.client;
        const routerOk = !!this.router;
        return {
            online: clientOk && routerOk,
            details: `Analytic Substrate: Client(${clientOk}), Router(${routerOk})`
        };
    }
}
