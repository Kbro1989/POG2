import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { isOk } from '../core/models.js';
import { SovereignIgnoreManager } from '../utils/SovereignIgnoreManager.js';
import { createLogger } from "../utils/logger.js";
const logger = createLogger('ContextBuilder');
/**
 * ContextBuilder - Smart multi-file context assembly.
 */
export class ContextBuilder {
    vectorDB;
    projectRoot;
    projectId;
    modelExecutor;
    rootStack;
    aiContextPath;
    pinnedFiles = new Set();
    constructor(vectorDB, projectRoot, projectId, modelExecutor, rootStack = [], aiContextPath) {
        this.vectorDB = vectorDB;
        this.projectRoot = projectRoot;
        this.projectId = projectId;
        this.modelExecutor = modelExecutor;
        this.rootStack = rootStack;
        this.aiContextPath = aiContextPath;
        logger.debug({ vectorDB: !!this.vectorDB, executor: !!this.modelExecutor, roots: this.rootStack.length }, 'ContextBuilder initialized');
    }
    pinFile(filePath) {
        this.pinnedFiles.add(resolve(filePath));
    }
    unpinFile(filePath) {
        this.pinnedFiles.delete(resolve(filePath));
    }
    async buildContext(filePath) {
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
    extractImports(content, filePath) {
        const pattern = /import\s+.*from\s+['"](.+?)['"]/g;
        const imports = [];
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
    async queryLessons(prompt, domainNamespace) {
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
        }
        catch (err) {
            logger.warn({ err }, 'Failed to query lessons from VectorDB');
        }
        return [];
    }
    resolvePath(imp, from) {
        const exts = ['.ts', '.js', '/index.ts', '/index.js'];
        const base = resolve(dirname(from), imp);
        for (const ext of exts) {
            const p = base.endsWith(ext) ? base : base + ext;
            if (existsSync(p))
                return p;
        }
        return null;
    }
    formatForPrompt(context) {
        const parts = [];
        const append = (relPath, label) => {
            try {
                const abs = resolve(relPath);
                if (!existsSync(abs))
                    return;
                const content = readFileSync(abs, 'utf8');
                parts.push(`--- FILE: ${relPath} (${label}) ---`);
                parts.push('```typescript');
                parts.push(content);
                parts.push('```\n');
            }
            catch { /* ignore invalid paths */ }
        };
        if (context.primary)
            append(context.primary, 'PRIMARY');
        context.imports?.forEach((i) => append(i, 'IMPORT'));
        context.sameDirectory?.forEach((s) => append(s, 'LOCAL'));
        context.related?.forEach((r) => append(r, 'PINNED'));
        return parts.join('\n');
    }
    async getGoldenTemplates(prompt) {
        // Retrieve established design patterns from the resources substrate
        const templatePath = resolve('resources/cloudflare-templates');
        if (!existsSync(templatePath))
            return [];
        return readdirSync(templatePath).map(f => join(templatePath, f));
    }
    getArchitectureAlignment(prompt, manifest) {
        // Enforce alignment with the Sovereign Organism architectural rules
        return [manifest?.primaryGoal || 'SovereignDesign'];
    }
    healthCheck() {
        return { online: true, details: 'ContextBuilder multi-file substrate active.' };
    }
}
