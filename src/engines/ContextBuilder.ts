import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import pino from 'pino';
import { type FileContext, type CodeContext, type Lesson, type ModelExecutor, isOk, type Result } from '../core/models.js';
import { VectorDB } from '../utils/VectorDB.js';
import { SovereignIgnoreManager } from '../utils/SovereignIgnoreManager.js';

const logger = pino({ name: 'ContextBuilder', base: { hostname: 'POG2' } });

/**
 * ContextBuilder - Smart multi-file context assembly.
 */
export class ContextBuilder {
    private readonly pinnedFiles: Set<string> = new Set();

    constructor(
        private readonly vectorDB: VectorDB,
        private projectRoot: string,
        private readonly projectId: string,
        private readonly modelExecutor: ModelExecutor,
        private readonly rootStack: string[] = [],
        private readonly aiContextPath?: string
    ) {
        logger.debug({ vectorDB: !!this.vectorDB, executor: !!this.modelExecutor, roots: this.rootStack.length }, 'ContextBuilder initialized');
    }

    pinFile(filePath: string): void {
        this.pinnedFiles.add(resolve(filePath));
    }

    unpinFile(filePath: string): void {
        this.pinnedFiles.delete(resolve(filePath));
    }

    async buildContext(filePath: string): Promise<FileContext & CodeContext> {
        if (!existsSync(filePath)) {
            return { path: filePath, content: '', primary: '', related: [], imports: [], sameDirectory: [] };
        }

        const absPath = resolve(filePath);
        const content = readFileSync(absPath, 'utf8');
        const root = process.cwd();

        // 1. Extract imports
        const imports = this.extractImports(content, absPath);

        // 2. Same directory
        const sameDir = readdirSync(dirname(absPath))
            .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
            .map(f => join(dirname(absPath), f))
            .filter(p => p !== absPath && !SovereignIgnoreManager.isIgnored(this.projectRoot, p))
            .slice(0, 10);

        // 3. Semantically related â€” Currently restricted to pinned context.
        const related = Array.from(this.pinnedFiles).filter(p => p !== absPath);

        return {
            path: absPath,
            content,
            primary: relative(root, absPath),
            related: related.map(p => relative(root, p)),
            imports: imports.map(p => relative(root, p)),
            sameDirectory: sameDir.map(p => relative(root, p))
        };
    }

    private extractImports(content: string, filePath: string): string[] {
        const pattern = /import\s+.*from\s+['"](.+?)['"]/g;
        const imports: string[] = [];
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const impPath = match[1];
            if (impPath?.startsWith('.')) {
                const resolved = this.resolvePath(impPath, filePath);
                if (resolved && !SovereignIgnoreManager.isIgnored(this.projectRoot, resolved)) {
                    imports.push(resolved);
                }
            }
        }
        return imports;
    }

    async queryLessons(prompt: string, domainNamespace?: string): Promise<Lesson[]> {
        if (!this.modelExecutor || typeof this.modelExecutor.embed !== 'function') {
            return [];
        }

        try {
            const embeddingResult = await this.modelExecutor.embed(prompt);
            if (isOk(embeddingResult) && this.vectorDB) {
                const arr = new Float32Array(embeddingResult.value);
                const similar = await this.vectorDB?.searchSimilar(arr, 20, this.projectId, domainNamespace);
                if (isOk(similar)) {
                    return similar.value;
                }
            }
        } catch (err) {
            logger.warn({ err }, 'Failed to query lessons from VectorDB');
        }
        return [];
    }

    private resolvePath(imp: string, from: string): string | null {
        const exts = ['.ts', '.js', '/index.ts', '/index.js'];
        const base = resolve(dirname(from), imp);
        for (const ext of exts) {
            const p = base.endsWith(ext) ? base : base + ext;
            if (existsSync(p)) return p;
        }
        return null;
    }

    formatForPrompt(context: FileContext & CodeContext): string {
        const parts: string[] = [];
        const append = (relPath: string, label: string) => {
            try {
                const abs = resolve(relPath);
                if (!existsSync(abs)) return;
                const content = readFileSync(abs, 'utf8');
                parts.push(`--- FILE: ${relPath} (${label}) ---`);
                parts.push('```typescript');
                parts.push(content);
                parts.push('```\n');
            } catch { /* ignore invalid paths */ }
        };

        if (context.primary) append(context.primary, 'PRIMARY');
        context.imports?.forEach((i: string) => append(i, 'IMPORT'));
        context.sameDirectory?.forEach((s: string) => append(s, 'LOCAL'));
        context.related?.forEach((r: string) => append(r, 'PINNED'));

        return parts.join('\n');
    }

    async getGoldenTemplates(prompt: string): Promise<string[]> {
        // Placeholder implementation for sovereign template retrieval
        return [];
    }

    getArchitectureAlignment(prompt: string, manifest: any): string[] {
        // Placeholder check for architectural adherence
        return ['SovereignSubstrate'];
    }
}
