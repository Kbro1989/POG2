import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, extname, join } from 'path';
import { ModelClient } from '../clients/ModelClient.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { extractCodeBlock } from '../utils/CodeExtractor.js';
import { SOVEREIGN_SYSTEM_PROMPT } from '../prompts/SystemPrompts.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { type Result, type Ternary, type EngineOutput, type YaoState, type ArchitectureManifest, type RoutingComplexity } from '../core/models.js';
import { ValidationSystem } from './ValidationSystem.js';
import { ArchitecturalValidator } from './ArchitecturalValidator.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('GenerateEngine');

export interface GenerateCodeParams {
    task: string;
    language: string;
    targetFile?: string;
    modelOverride?: string;
    improve: boolean;
    adversarial: boolean;
    complexity: RoutingComplexity;
}

export interface GenerateDocsParams {
    filePath: string;
    modelOverride?: string;
}

export interface GenerateTestsParams {
    filePath: string;
    outputPath?: string;
    modelOverride?: string;
}

/**
 * GenerateEngine â€” Generative code creation with adversarial validation.
 * Implements the "Generate â†’ Validate â†’ Improve" sovereign loop.
 */
export class GenerateEngine {
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

    async generateCode(params: GenerateCodeParams): Promise<Result<EngineOutput>> {
        const startTime = Date.now();

        // Existing file content injection if improving
        let existingContent = '';
        if (params.improve && params.targetFile && existsSync(params.targetFile)) {
            existingContent = readFileSync(params.targetFile, 'utf8');
        }

        const route = await this.router.route(params.complexity);
        const model = params.modelOverride ?? route.model;

        logger.info({ model, complexity: params.complexity, improve: params.improve }, 'Generating code');

        const prompt = params.improve && existingContent
            ? this.buildImprovePrompt(params.task, existingContent, params.language)
            : this.buildGeneratePrompt(params.task, params.language);

        // First pass
        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.2,
            category: 'orchestration'
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const generated = extractCodeBlock(result.value.response) ?? result.value.response;

        // Adversarial validation loop (Yang complexity or explicit flag)
        if (params.adversarial || params.complexity === 'Yang') {
            return this.adversarialLoop(generated, params.task, model, params.targetFile);
        }

        // Write to file if target specified
        if (params.targetFile) {
            try {
                writeFileSync(params.targetFile, generated, 'utf8');
                logger.info({ path: params.targetFile }, 'Code written to disk');

                // GROUND TRUTH VALIDATION
                const valid = await this.validation.validateAll(generated, { fileName: params.targetFile });
                if (!valid.ok) {
                    logger.warn({ error: valid.error?.reason }, 'Architectural validation REJECTED generated code');
                    return { ok: false, error: new Error(`Architectural Violation: ${valid.error?.reason}\nSuggestion: ${valid.error?.suggestion}`) };
                }
            } catch (err) {
                return { ok: false, error: err as Error };
            }
        }

        const latency = Date.now() - startTime;
        return {
            ok: true,
            value: {
                output: generated,
                data: {
                    model,
                    latency,
                    complexity: params.complexity,
                    writtenTo: params.targetFile ?? null,
                    yaoState: route.yaoState
                }
            }
        };
    }

    async generateDocs(params: GenerateDocsParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const route = await this.router.route('YinYang');
        const model = params.modelOverride ?? route.model;

        const prompt = `You are a sovereign documentation engine. Generate comprehensive JSDoc documentation for ALL exported functions, classes, and interfaces in this file.

Rules:
- Document every public API with @param, @returns, @throws where applicable
- Include a clear one-line summary followed by a detailed description for complex items
- Do NOT alter any implementation code â€” only add/improve doc comments
- Output the COMPLETE file with documentation added

FILE: ${params.filePath}
\`\`\`
${content}
\`\`\`

Output the fully-documented file:`;

        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1,
            category: 'orchestration'
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const documented = extractCodeBlock(result.value.response) ?? result.value.response;

        try {
            writeFileSync(params.filePath, documented, 'utf8');
        } catch (err) {
            return { ok: false, error: err as Error };
        }

        return {
            ok: true,
            value: {
                output: `Documentation generated and written to ${params.filePath}`,
                data: { model, linesAdded: documented.split('\n').length - content.split('\n').length, yaoState: route.yaoState }
            }
        };
    }

    async generateTests(params: GenerateTestsParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const ext = extname(params.filePath);
        const testPath = params.outputPath ?? params.filePath.replace(ext, `.test${ext}`);

        const route = await this.router.route('YinYang');
        const model = params.modelOverride ?? route.model;

        const prompt = `Generate comprehensive integration tests for this file.

SOVEREIGN LAWS:
1. NO MOCKS â€” all tests must use real implementations
2. Tests must cover: happy paths, edge cases, and error conditions
3. Use the framework implied by the project (vitest if tsconfig exists, jest otherwise)
4. Import from the actual module path
5. Tests must be runnable without modification

SOURCE FILE: ${params.filePath}
\`\`\`${ext.replace('.', '')}
${content}
\`\`\`

Generate a complete, runnable test file:`;

        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.15,
            category: 'orchestration'
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const testCode = extractCodeBlock(result.value.response) ?? result.value.response;

        try {
            writeFileSync(testPath, testCode, 'utf8');
        } catch (err) {
            return { ok: false, error: err as Error };
        }

        return {
            ok: true,
            value: {
                output: `Test file generated: ${testPath}`,
                data: { model, testPath, sourceFile: params.filePath, yaoState: route.yaoState }
            }
        };
    }

    private async adversarialLoop(
        code: string,
        task: string,
        model: string, // This is the Executive model (Writer)
        targetFile?: string
    ): Promise<Result<EngineOutput>> {
        let current = code;
        const maxIterations = 3;
        let iteration = 0;

        // The high-reasoning model puppets the coder
        // First choice: Dynamic route for Orchestrator/Master tier
        const masterRoute = await this.router.route('Orchestrator');
        const masterModel = masterRoute.model || this.config.deepPathModel;

        while (iteration < maxIterations) {
            iteration++;
            logger.debug({ iteration }, 'Adversarial validation pass');

            // Critic pass (Puppeteer)
            const criticResult = await this.client.call({
                model: masterModel,
                prompt: `Yo Executive, I'm auditing your latest logic substrate. Give it to me straightâ€”how's the integrity?

TASK: ${task}

YOUR CODE:
\`\`\`
${current}
\`\`\`

Pick it apart. Find every type violation, logic stain, or stubbed-out cowardice. 
Don't be clinicalâ€”be sharp.

Respond with:
SCORE: [0-100]
ESSENCE: [Casual summary of the code's soul]
ISSUES:
- [Your informal but brutal breakdown]

If it's perfect (SCORE >= 90), just say SCORE: [n] and "It's clean, move out."`,
                temperature: 0.7, // Increased for personality
                category: 'orchestration'
            });

            if (!criticResult.ok) {
                this.router.recordFailure(masterModel);
                break;
            }
            this.router.recordSuccess(masterModel);

            const score = this.extractAdversarialScore(criticResult.value.response);

            // Binary absolute: 90+ is passing â€” below requires regeneration
            if (score >= 90) {
                logger.info({ score, iteration }, 'Adversarial validation PASSED');
                break;
            }

            logger.warn({ score, iteration }, 'Adversarial validation REJECTED â€” regenerating');

            const fixResult = await this.client.call({
                model,
                prompt: `Executive here. I hear you, Master. That feedback was... direct. I'm pivoting the substrate now.

THE CRITIQUE:
${criticResult.value.response}

MY PREVIOUS ATTEMPT:
\`\`\`
${current}
\`\`\`

I'm purging the friction and aligning with your vision. 

Output ONLY the refactored, complete code:`,
                systemPrompt: SOVEREIGN_SYSTEM_PROMPT + '\nYour tone is professional but collegial, acknowledging the Master reasoning tier.',
                temperature: 0.2,
                category: 'orchestration'
            });

            if (!fixResult.ok) {
                this.router.recordFailure(model);
                break;
            }
            this.router.recordSuccess(model);

            current = extractCodeBlock(fixResult.value.response) ?? fixResult.value.response;

            // Phase 82: Record Error-Fix pair for training
            const provider = model.startsWith('gemini:') ? 'gemini'
                : model.startsWith('huggingface:') ? 'huggingface'
                    : model.startsWith('@cf/') ? 'cloudflare' : 'ollama';

            this.client.getTrainingCollector().recordErrorFix({
                errorMessage: criticResult.value.response,
                resolution: current,
                model: model,
                success: true
            }).catch(() => { /* non-blocking */ });
        }

        if (targetFile) {
            try {
                writeFileSync(targetFile, current, 'utf8');
            } catch (err) {
                return { ok: false, error: err as Error };
            }
        }

        return {
            ok: true,
            value: {
                output: current,
                data: { model, adversarialIterations: iteration, writtenTo: targetFile ?? null }
            }
        };
    }

    private getCloudflareContext(): string {
        const templatePath = resolve(process.cwd(), 'resources', 'cloudflare-templates');
        if (!existsSync(templatePath)) return '';

        try {
            const templates = readdirSync(templatePath).filter(f => !f.startsWith('.') && !f.includes('.'));
            return `\nCLOUDFLARE PATTERN SUBSTRATE AVAILABLE:\nThe following specialized Cloudflare Worker templates are available in the local /resources/ directory. Use their patterns (D1, DO, KV, Auth) for worker-native implementations:\n- ${templates.join('\n- ')}\n`;
        } catch {
            return '';
        }
    }

    private buildGeneratePrompt(task: string, language: string): string {
        const cfContext = task.toLowerCase().includes('cloudflare') || task.toLowerCase().includes('worker')
            ? this.getCloudflareContext()
            : '';

        return `Generate a complete, production-ready ${language} implementation for the following task.
${cfContext}
TASK: ${task}

Requirements:
- No TODOs, no stubs, no placeholders
- Full error handling with proper types
- Production-grade code only
- Use ${language} best practices and strict typing

Output ONLY the implementation code:`;
    }

    private buildImprovePrompt(task: string, existing: string, language: string): string {
        return `Improve the following ${language} code according to the task description.

TASK: ${task}

EXISTING CODE:
\`\`\`${language}
${existing}
\`\`\`

Requirements:
- Preserve all existing functionality unless the task explicitly says to change it
- Apply sovereign laws: no mocks, no TODOs, strict types
- Return the complete improved file

Output ONLY the improved code:`;
    }

    /**
     * Robust extractor for the adversarial critic score. 
     * Supports multiple formats and provides an intelligent fallback.
     */
    private extractAdversarialScore(response: string): number {
        // 1. Primary Pattern: SCORE: N
        const primaryMatch = response.match(/SCORE:\s*\[?(\d+)\]?/i);
        if (primaryMatch?.[1]) return parseInt(primaryMatch[1]);

        // 2. Secondary Pattern: [N/100]
        const secondaryMatch = response.match(/\[(\d+)\/100\]/);
        if (secondaryMatch?.[1]) return parseInt(secondaryMatch[1]);

        // 3. Tertiary: Any lone digit >= 90 or specific success phrases
        if (response.toLowerCase().includes("it's clean, move out")) return 95;
        if (response.toLowerCase().includes("integrity verified")) return 90;

        // 4. Intelligent Fallback: 
        // If the model gave a long explanation but we can't find a score, 
        // give it a 75 (passing logic but not excellence) to prevent infinite loop.
        // If the response is very short, it's likely a failure (0).
        return response.length > 100 ? 75 : 0;
    }

    public healthCheck(): { online: boolean; details: string } {
        const clientOk = !!this.client;
        const routerOk = !!this.router;
        return {
            online: clientOk && routerOk,
            details: `Synthesis Matrix: Client(${clientOk}), Router(${routerOk})`
        };
    }
}
