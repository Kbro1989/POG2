import { readFileSync, writeFileSync, existsSync } from 'fs';
import { ModelClient } from '../clients/ModelClient.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { extractCodeBlock } from '../utils/CodeExtractor.js';
import { SOVEREIGN_SYSTEM_PROMPT } from '../prompts/SystemPrompts.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput } from '../core/models.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('CompletionEngine');

export interface CursorParams {
    filePath: string;
    line: number;
    column: number;
    count: number;
    modelOverride?: string;
}

export interface FillMissingParams {
    filePath: string;
    dryRun: boolean;
    modelOverride?: string;
}

export interface ContinueFileParams {
    filePath: string;
    targetLines: number;
    modelOverride?: string;
}

/**
 * CompletionEngine â€” Code completion at cursor positions, fill-in, and file continuation.
 * Uses a context window of surrounding code for maximum accuracy.
 */
export class CompletionEngine {
    private readonly client: ModelClient;

    constructor(
        private readonly config: SovereignConfig,
        private readonly router: TernaryRouter
    ) {
        this.client = new ModelClient(config, router);
    }

    async atCursor(params: CursorParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const lines = content.split('\n');

        // Binary absolute: line must be within bounds
        if (params.line < 1 || params.line > lines.length) {
            return { ok: false, error: new Error(`Line ${params.line} out of range (file has ${lines.length} lines)`) };
        }

        // Build prefix/suffix context window (Â±50 lines)
        const contextStart = Math.max(0, params.line - 51);
        const contextEnd = Math.min(lines.length, params.line + 49);
        const prefix = lines.slice(contextStart, params.line - 1).join('\n');
        const currentLine = lines[params.line - 1] ?? '';
        const suffix = lines.slice(params.line, contextEnd).join('\n');

        const cursorMark = currentLine.substring(0, params.column) + '<CURSOR>' + currentLine.substring(params.column);

        const route = await this.router.route('Yin');
        const model = params.modelOverride ?? route.model;

        const prompt = `Complete the code at the <CURSOR> position. Generate ${params.count} completion candidate(s).

Context before cursor:
\`\`\`
${prefix}
${cursorMark}
\`\`\`

Context after cursor:
\`\`\`
${suffix}
\`\`\`

Rules:
- Each completion should be a self-contained, syntactically valid insertion at the cursor
- No placeholder text, no stubs
- Completions must be consistent with the surrounding code style and types

Respond with completions numbered 1-${params.count}, each wrapped in a code block:`;

        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.2
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        logger.info({ file: params.filePath, line: params.line, col: params.column }, 'Cursor completion generated');

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { model, line: params.line, column: params.column }
            }
        };
    }

    async fillMissing(params: FillMissingParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');

        // Detect missing implementations
        const patterns = [
            { regex: /\/\/\s*TODO[:\s]/gi, label: 'TODO comment' },
            { regex: /throw new Error\(['"](?:not implemented|TODO)['"]\)/gi, label: 'not-implemented stub' },
            { regex: /\{\s*\}/g, label: 'empty function body' }
        ];

        const found = patterns.filter(p => p.regex.test(content));

        if (found.length === 0) {
            return {
                ok: true,
                value: {
                    output: 'No missing implementations found â€” file is complete.',
                    data: { file: params.filePath, issues: 0 }
                }
            };
        }

        const route = await this.router.route('YinYang');
        const model = params.modelOverride ?? route.model;

        const issueList = found.map(f => `- ${f.label}`).join('\n');
        logger.info({ file: params.filePath, issues: found.length }, 'Filling missing implementations');

        const prompt = `Fill in ALL missing implementations in this file.

Detected issues:
${issueList}

Rules:
1. Implement every TODO, stub, and empty function body with REAL logic
2. Maintain all existing signatures and types exactly
3. No mocks, no fake returns â€” real implementations only
4. Return the COMPLETE file with all implementations filled

FILE: ${params.filePath}
\`\`\`
${content}
\`\`\`

Output the complete filled file:`;

        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const filled = extractCodeBlock(result.value.response) ?? result.value.response;

        if (!params.dryRun) {
            try {
                writeFileSync(params.filePath, filled, 'utf8');
            } catch (err) {
                return { ok: false, error: err as Error };
            }
        }

        return {
            ok: true,
            value: {
                output: params.dryRun ? filled : `${found.length} implementation(s) filled in ${params.filePath}`,
                data: { model, issuesFixed: found.length, dryRun: params.dryRun }
            }
        };
    }

    async continueFile(params: ContinueFileParams): Promise<Result<EngineOutput>> {
        if (!existsSync(params.filePath)) return { ok: false, error: new Error(`File not found: ${params.filePath}`) };
        const content = readFileSync(params.filePath, 'utf8');
        const currentLines = content.split('\n').length;

        const route = await this.router.route('YinYang');
        const model = params.modelOverride ?? route.model;

        const prompt = `Continue this file from where it ends. Add approximately ${params.targetLines} more lines of production-ready code.

Rules:
1. Maintain exact same code style, naming conventions, and patterns
2. The continuation must be logically coherent with what came before
3. No stubs, no TODOs â€” only real, runnable code
4. If the file appears complete, add utility methods or extend the existing interface

CURRENT FILE (${currentLines} lines): ${params.filePath}
\`\`\`
${content}
\`\`\`

Continue from the end of the file â€” output ONLY the new code to append (not the full file):`;

        const result = await this.client.call({
            model,
            prompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.25
        });

        if (!result.ok) {
            this.router.recordFailure(model);
            return result as Result<EngineOutput>;
        }
        this.router.recordSuccess(model);

        const continuation = extractCodeBlock(result.value.response) ?? result.value.response;

        try {
            const separator = content.endsWith('\n') ? '' : '\n';
            writeFileSync(params.filePath, content + separator + continuation, 'utf8');
        } catch (err) {
            return { ok: false, error: err as Error };
        }

        const addedLines = continuation.split('\n').length;
        return {
            ok: true,
            value: {
                output: `Continuation added: ${addedLines} lines written to ${params.filePath}`,
                data: { model, linesAdded: addedLines, file: params.filePath }
            }
        };
    }
    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'CompletionEngine reactive substrate active.' };
    }
}

