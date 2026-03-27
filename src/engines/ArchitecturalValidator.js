/**
 * ArchitecturalValidator - Enforces core architectural constraints.
 */
export class ArchitecturalValidator {
    manifest;
    name = 'ArchitecturalValidator';
    constructor(manifest) {
        this.manifest = manifest;
    }
    async validate(output, context) {
        // 1. Illegal Dependency Check
        const imports = this.extractImports(output);
        for (const imp of imports) {
            if (this.isIllegalDependency(imp, context?.fileName)) {
                return {
                    ok: false,
                    error: {
                        reason: `Illegal dependency "${imp}" in ${context?.fileName || 'unknown'}.`,
                        suggestion: `Check the Architecture Manifest for allowed dependencies.`
                    }
                };
            }
        }
        // 2. Primary Goal Alignment (e.g. NO MOCKS)
        if (this.violatesPrimaryGoal(output)) {
            return {
                ok: false,
                error: {
                    reason: `Violation of primary goal: ${this.manifest.primaryGoal}`,
                    suggestion: `Remove mocks or faked logic and implement real Sovereign code.`
                }
            };
        }
        return { ok: true, value: true };
    }
    extractImports(content) {
        const pattern = /import\s+.*from\s+['"](.*)['"]/g;
        const imports = [];
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1])
                imports.push(match[1]);
        }
        return imports;
    }
    isIllegalDependency(imp, currentFile) {
        if (!currentFile)
            return false;
        // Simple layer check
        const layerMatch = currentFile.match(/src\/([^/]+)/);
        if (!layerMatch)
            return false;
        const currentLayer = layerMatch[1].toLowerCase();
        const allowed = this.manifest.dependencyRules[currentLayer] || [];
        // Detect target layer
        const targetMatch = imp.match(/(\.\.\/|src\/)([^/]+)\//);
        if (!targetMatch)
            return false;
        const targetLayer = targetMatch[2].toLowerCase();
        if (targetLayer !== currentLayer && !allowed.includes(targetLayer)) {
            return true;
        }
        return false;
    }
    violatesPrimaryGoal(output) {
        if (this.manifest.primaryGoal.includes('NO MOCKS')) {
            const forbidden = [/jest\.fn/, /vi\.fn/, /sinon\.stub/, /mock\(/];
            return forbidden.some(p => p.test(output));
        }
        return false;
    }
    /**
     * Phase 29: Function-Deletion Guard.
     * Extracts all exported symbols (functions, classes, consts, types, enums, interfaces)
     * from the original code and verifies they ALL survive in the modified version.
     * The system must NEVER heal by deletion.
     */
    validatePreservation(original, modified) {
        const originalSymbols = this.extractExportedSymbols(original);
        const modifiedSymbols = this.extractExportedSymbols(modified);
        const deleted = [];
        for (const sym of originalSymbols) {
            if (!modifiedSymbols.has(sym)) {
                deleted.push(sym);
            }
        }
        if (deleted.length > 0) {
            return {
                ok: false,
                error: {
                    reason: `Function-Deletion Guard: ${deleted.length} exported symbol(s) were removed: [${deleted.join(', ')}]. The system must NEVER heal by deletion.`,
                    suggestion: `Restore the deleted symbols and fix them in-place instead. Young/Old snapshot will be used for rollback.`
                }
            };
        }
        return { ok: true, value: true };
    }
    /**
     * Extracts all exported symbol names from TypeScript source code.
     * Covers: export function, export class, export const, export let,
     *         export type, export interface, export enum, export default,
     *         and re-exports like export { X }.
     */
    extractExportedSymbols(content) {
        const symbols = new Set();
        // export function/class/const/let/type/interface/enum NAME
        const declarationPattern = /export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g;
        let match;
        while ((match = declarationPattern.exec(content)) !== null) {
            if (match[1])
                symbols.add(match[1]);
        }
        // export default function/class NAME
        const defaultPattern = /export\s+default\s+(?:async\s+)?(?:function|class)\s+(\w+)/g;
        while ((match = defaultPattern.exec(content)) !== null) {
            if (match[1])
                symbols.add(match[1]);
        }
        // export { A, B, C } — named re-exports
        const bracePattern = /export\s*\{([^}]+)\}/g;
        while ((match = bracePattern.exec(content)) !== null) {
            if (match[1]) {
                const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]?.trim()).filter(Boolean);
                names.forEach(n => { if (n)
                    symbols.add(n); });
            }
        }
        return symbols;
    }
    healthCheck() {
        return { online: true, details: 'ArchitecturalValidator clinical enforcement substrate active. Function-deletion guard armed.' };
    }
}
