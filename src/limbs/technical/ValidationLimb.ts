import { type Result, ok, EmotionalState } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { ChromanumberEngine } from '../../engines/ChromanumberEngine.js';

const logger = createLogger('ValidationLimb');

/**
 * ValidationLimb - Structural & Affective Audit Gate
 * Performs zero-trust verification of synthesized assets.
 * Evaluates Structural (mesh), Logical (script), and Affective (resonance) integrity.
 */
export class ValidationLimb {
    private chromanumber: ChromanumberEngine;

    constructor(chromanumber: ChromanumberEngine) {
        this.chromanumber = chromanumber;
    }

    /**
     * validate - Core verification entry point.
     * @param mesh - Topological data
     * @param script - Logical instructions (opcodes/CS2)
     * @param resonance - Inferred emotional state
     * @param intent - Original synthesis goal (e.g. "Aggressive Boss")
     */
    public async validate(
        mesh: any, 
        script: any, 
        resonance: EmotionalState, 
        intent: string
    ): Promise<Result<{ structural: boolean, logical: boolean, affective: boolean }>> {
        logger.info({ intent, resonance }, 'Initiating multi-layered validation audit.');

        // 1. Structural Gate: Does the mesh hold?
        const structural = this.validateStructure(mesh);

        // 2. Logical Gate: Does the script/motion make sense?
        const logical = this.validateLogic(script);

        // 3. Affective Gate: Does the emotion match the intent?
        const affective = this.validateAffect(resonance, intent);

        const allOk = structural && logical && affective;
        
        if (!allOk) {
            logger.warn({ structural, logical, affective }, 'Validation gate REJECTED due to mismatch.');
        } else {
            logger.info('Validation gate PASSED successfully.');
        }

        return ok({ structural, logical, affective });
    }

    /**
     * validateStructure - Geometric Sanitization
     */
    private validateStructure(mesh: any): boolean {
        if (!mesh) return false;
        // Check for non-zero geometry and basic topology
        const hasPoints = mesh.vertices && mesh.vertices.length > 0;
        const hasFaces = mesh.indices && mesh.indices.length > 0;
        
        // Threshold check: Minimum complexity for a "valid" POG2 asset
        const complexityOk = (mesh.vertices?.length || 0) > 4; // At least a tetrahedron
        
        return hasPoints && hasFaces && complexityOk;
    }

    /**
     * validateLogic - Behavioural Sanitization
     */
    private validateLogic(script: any): boolean {
        if (!script) return true; // Optional component
        
        // Basic sanity check: Has instructions?
        const hasOpcodes = Array.isArray(script.opcodes) || typeof script.instructions === 'object';
        
        return hasOpcodes;
    }

    /**
     * validateAffect - Emotional Alignment Audit
     * Ensures the "soul" of the entity matches the "intent" of the synthesis.
     */
    private validateAffect(resonance: EmotionalState, intent: string): boolean {
        const lowerIntent = intent.toLowerCase();
        
        // Intensity check
        const isAggressiveIntent = lowerIntent.includes('boss') || lowerIntent.includes('combat') || lowerIntent.includes('attack');
        const isAggressiveResonance = resonance === EmotionalState.Agitated || resonance === EmotionalState.Decisive || resonance === EmotionalState.Excited;
        
        if (isAggressiveIntent && !isAggressiveResonance) {
            logger.warn({ resonance, intent }, 'Affective Mismatch: Passive resonance for aggressive intent.');
            return false;
        }

        // Stability check
        const isPassiveIntent = lowerIntent.includes('scenery') || lowerIntent.includes('decoration') || lowerIntent.includes('static');
        const isPassiveResonance = resonance === EmotionalState.Zen || resonance === EmotionalState.Steady || resonance === EmotionalState.Quiet;

        if (isPassiveIntent && !isPassiveResonance) {
             logger.warn({ resonance, intent }, 'Affective Mismatch: High-energy resonance for static intent.');
             return false;
        }

        return true;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // Zero-trust self-audit
        const testMesh = { vertices: [1,2,3,4,5], indices: [0,1,2] };
        const result = await this.validate(testMesh, null, EmotionalState.Zen, 'static_scenery');
        const ok = result.ok && result.value.structural && result.value.affective;
        return { 
            online: ok, 
            details: `Validation: ${ok ? 'ONLINE' : 'DEGRADED'} (Structural & Affective gates verified)` 
        };
    }
}
