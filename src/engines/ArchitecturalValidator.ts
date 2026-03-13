import { type ValidationResult, type Validator, ArchitectureManifest } from '../core/models.js';

/**
 * ArchitecturalValidator - Enforces core architectural constraints.
 */
export class ArchitecturalValidator implements Validator {
    readonly name = 'ArchitecturalValidator';

    constructor(private readonly manifest: ArchitectureManifest) { }

    async validate(output: string, context?: { fileName?: string }): Promise<ValidationResult> {
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

    private extractImports(content: string): string[] {
        const pattern = /import\s+.*from\s+['"](.*)['"]/g;
        const imports: string[] = [];
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1]) imports.push(match[1]);
        }
        return imports;
    }

    private isIllegalDependency(imp: string, currentFile?: string): boolean {
        if (!currentFile) return false;
        // Simple layer check
        const layerMatch = currentFile.match(/src\/([^/]+)/);
        if (!layerMatch) return false;
        const currentLayer = layerMatch[1]!.toLowerCase();

        const allowed = this.manifest.dependencyRules[currentLayer] || [];

        // Detect target layer
        const targetMatch = imp.match(/(\.\.\/|src\/)([^/]+)\//);
        if (!targetMatch) return false;
        const targetLayer = targetMatch[2]!.toLowerCase();

        if (targetLayer !== currentLayer && !allowed.includes(targetLayer)) {
            return true;
        }
        return false;
    }

    private violatesPrimaryGoal(output: string): boolean {
        if (this.manifest.primaryGoal.includes('NO MOCKS')) {
            const forbidden = [/jest\.fn/, /vi\.fn/, /sinon\.stub/, /mock\(/];
            return forbidden.some(p => p.test(output));
        }
        return false;
    }
}
