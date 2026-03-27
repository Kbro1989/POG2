import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
/**
 * ArchitectureDigest - Preserves the "Big Picture" integrity.
 * Injects immutable architectural boundaries and domain constraints into prompts.
 */
export class ArchitectureDigest {
    projectRoot;
    manifest;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.manifest = this.loadManifest();
    }
    /**
     * Loads the architecture manifest from the project root.
     * If not found, uses safe defaults focused on sovereignty.
     */
    loadManifest() {
        const manifestPath = join(this.projectRoot, 'architecture_manifest.json');
        if (existsSync(manifestPath)) {
            try {
                return JSON.parse(readFileSync(manifestPath, 'utf8'));
            }
            catch (err) {
                // Grounding diagnostic for failed manifest load
                console.warn(`[METABOLIC WARNING] Failed to parse architectural manifest at ${manifestPath}. Reverting to defaults.`);
            }
        }
        return {
            domainModel: {
                'Core': { file: 'src/engines/OrchestrateEngine.ts', properties: ['run', 'executeTurn'] },
                'Substrate': { file: 'src/routing/TernaryRouter.ts', properties: ['route'] },
                'Context': { file: 'src/engines/ContextBuilder.ts', properties: ['buildContext', 'search'] },
                'Monitoring': { file: 'src/monitor/PulseMonitor.ts', properties: ['pulse', 'checkSubstrateHealth'] },
                'Sensory': { file: 'src/engines/SovereignEyeEngine.ts', properties: ['capture', 'analyze'] }
            },
            dependencyRules: {
                'engines': ['utils', 'types', 'config'],
                'routing': ['types', 'utils', 'config'],
                'clients': ['types', 'utils', 'config'],
                'monitor': ['routing', 'types', 'utils']
            },
            primaryGoal: 'ANTI-MINIMALIST / SOVEREIGN / LOCAL-FIRST / TSC-SECURE'
        };
    }
    /**
     * Injects the architectural digest into a prompt.
     */
    inject(prompt) {
        const digest = `
=== ARCHITECTURAL DIGEST (IMMUTABLE) ===
PRIMARY GOAL: ${this.manifest.primaryGoal}

DOMAIN MODEL:
${Object.entries(this.manifest.domainModel).map(([k, v]) => `- ${k}: ${v?.file || 'unknown'} (Core properties: ${(v?.properties || []).join(', ')})`).join('\n')}

DEPENDENCY RULES:
${Object.entries(this.manifest.dependencyRules).map(([k, v]) => `- ${k} can import from: ${v.join(', ')}`).join('\n')}

SOVEREIGN LAWS:
1. NO MOCKS: All code must be fully implemented against real APIs.
2. NO PLACEHOLDERS: TODO/FIXME/Stub patterns are forbidden.
3. TSC TIGHT: All code must pass strict TypeScript checks.
=== DO NOT DEVIATE ===
`;
        return `${digest}\n\n${prompt}`;
    }
    getManifest() {
        return this.manifest;
    }
}
