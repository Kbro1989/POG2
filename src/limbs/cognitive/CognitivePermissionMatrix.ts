/**
 * CognitivePermissionMatrix.ts
 *
 * Maps the current Hexagram state (numeric ID + YaoState) to a set of
 * permitted limbs. This is the biological gating layer — which limbs
 * are *allowed* to fire at any given moment in the organism's metabolism.
 *
 * Architecture:
 *   HexagramManager.getActiveLimbSet() calls CognitivePermissionMatrix.getAllowedLimbs()
 *   OrchestrateEngine.executeTool() checks if tool.backingLimb is in the active set.
 *
 * Philosophy:
 *   - Brainstem limbs are ALWAYS active (the organism never stops breathing).
 *   - Metabolic limbs activate by YaoState.
 *   - Hexagram-specific limbs activate by numeric ID (I Ching archetype).
 *   - Chaos (OldMixed) suppresses all generative and learning activity.
 */

import { YaoState } from '../../core/models.js';

export interface LimbPermission {
    /** The class name or canonical identifier of the limb. */
    limb: string;
    /** Which Yao states permit this limb to fire. */
    allowedYaoStates: YaoState[];
    /** If set, only these hexagram IDs additionally permit this limb. */
    requiredHexagrams?: number[];
    /** If set, this limb is SUPPRESSED in these hexagram IDs. */
    blockedHexagrams?: number[];
}

// ─────────────────────────────────────────────────────────────
// All valid YaoState values for convenience
// ─────────────────────────────────────────────────────────────
const ALL_STATES: YaoState[] = [
    YaoState.YoungYang, YaoState.OldYang,
    YaoState.YoungYin, YaoState.OldYin,
    YaoState.OldMixed, YaoState.YoungMixed,
    YaoState.SovereignAvatar, YaoState.SovereignEngine
];

const GENERATIVE_STATES: YaoState[] = [
    YaoState.YoungYang, YaoState.OldYang, YaoState.YoungMixed,
    YaoState.SovereignAvatar, YaoState.SovereignEngine
];

const RECEPTIVE_STATES: YaoState[] = [
    YaoState.YoungYin, YaoState.OldYin
];

const NON_CHAOS_STATES: YaoState[] = [
    YaoState.YoungYang, YaoState.OldYang,
    YaoState.YoungYin, YaoState.OldYin,
    YaoState.YoungMixed, YaoState.SovereignAvatar, YaoState.SovereignEngine
];

export class CognitivePermissionMatrix {
    /**
     * The full 27-limb permission registry.
     * Ordered: Brainstem → Sensory → Motor/Creative → Analytical → Memory → Clinical → Metabolic
     */
    private static readonly DEFAULT_PERMISSIONS: LimbPermission[] = [

        // ── BRAINSTEM — always active ──────────────────────────────────
        { limb: 'OrchestrateEngine',           allowedYaoStates: ALL_STATES },
        { limb: 'TernaryRouter',               allowedYaoStates: ALL_STATES },
        { limb: 'CanonicalClock',              allowedYaoStates: ALL_STATES },
        { limb: 'HexagramManager',             allowedYaoStates: ALL_STATES },
        { limb: 'CognitiveImmunologyEmergency', allowedYaoStates: ALL_STATES },
        { limb: 'ShadowEngine',                allowedYaoStates: ALL_STATES },
        { limb: 'MetabolicEngine',             allowedYaoStates: ALL_STATES },
        { limb: 'EpistemicTransitionKernel',   allowedYaoStates: ALL_STATES },
        { limb: 'PulseMonitor',                allowedYaoStates: ALL_STATES },

        // ── SENSORY — active in all non-chaos states ──────────────────
        { limb: 'VisionEngine',                allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SpatialVisionEngine',         allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'WebSensoryLimb',              allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'PuppeteerEye',                allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'ChromaLimb',                  allowedYaoStates: NON_CHAOS_STATES },

        // ── MOTOR / SHELL — generative states only ───────────────────
        { limb: 'ShellEngine',                 allowedYaoStates: GENERATIVE_STATES },
        { limb: 'ShellLibrary',                allowedYaoStates: GENERATIVE_STATES },
        { limb: 'VSCodeEngine',                allowedYaoStates: GENERATIVE_STATES },
        { limb: 'CodeEngine',                  allowedYaoStates: GENERATIVE_STATES },
        { limb: 'GenerateEngine',              allowedYaoStates: GENERATIVE_STATES },
        { limb: 'RSCLimb',                     allowedYaoStates: GENERATIVE_STATES },

        // ── CREATIVE — Yang + Sovereign only (requires flow state) ────
        { limb: 'NeuralForgeLimb',             allowedYaoStates: [YaoState.YoungYang, YaoState.SovereignEngine] },
        { limb: 'VoiceLimb',                   allowedYaoStates: [YaoState.YoungYang, YaoState.SovereignEngine] },
        { limb: 'SoundtrackLimb',              allowedYaoStates: [YaoState.YoungYang, YaoState.SovereignEngine] },
        { limb: 'VideoAssemblerLimb',          allowedYaoStates: [YaoState.YoungYang, YaoState.OldYang, YaoState.SovereignEngine] },
        { limb: 'WebAppForgeLimb',             allowedYaoStates: GENERATIVE_STATES },
        { limb: 'StoryboardLimbV2',            allowedYaoStates: GENERATIVE_STATES },

        // ── PEDAGOGY / LEARNING — blocked in chaos ─────────────────
        { limb: 'PedagogyLimb',               allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'GutenbergLimb',              allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'CacheLearningLimb',          allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SovereignIngestionEngine',   allowedYaoStates: NON_CHAOS_STATES },

        // ── FORENSIC / ANALYTICAL — active even in chaos ──────────
        { limb: 'CacheForensicsLimb',         allowedYaoStates: ALL_STATES },
        { limb: 'WorldForensicsLimb',         allowedYaoStates: ALL_STATES },
        { limb: 'DiscoveryEngine',            allowedYaoStates: ALL_STATES },
        { limb: 'rsmvExtractor',              allowedYaoStates: ALL_STATES },
        { limb: 'NodeTester',                 allowedYaoStates: ALL_STATES },

        // ── SPATIAL / GAMEPLAY — active in all non-chaos states ───
        { limb: 'GhostSplatEngine',           allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'GameplaySovereigntyLimb',    allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SpatialSovereigntyLimb',     allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'MechanicalSovereigntyLimb',  allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'EntityLimb',                 allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'EnvironmentLimb',            allowedYaoStates: NON_CHAOS_STATES },

        // ── MEMORY — receptive/Yin states activate consolidation ──
        { limb: 'MemoryConsolidationEngine',  allowedYaoStates: RECEPTIVE_STATES },
        { limb: 'RelicLimb',                  allowedYaoStates: RECEPTIVE_STATES },
        { limb: 'VectorDB',                   allowedYaoStates: ALL_STATES },       // Always available for reads
        { limb: 'TrainingCollector',          allowedYaoStates: NON_CHAOS_STATES },

        // ── CLINICAL / SOVEREIGN ──────────────────────────────────
        { limb: 'BioIntelligenceLimb',        allowedYaoStates: ALL_STATES },
        { limb: 'MetaCognitionEngine',        allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SyntropyEngine',             allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'MemeticEngine',              allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SelfHealingEngine',          allowedYaoStates: ALL_STATES },

        // ── METAPHYSICAL — sovereign + active states only ─────────
        { limb: 'GhostLimb',                  allowedYaoStates: ALL_STATES },       // Ghost fallback always open
        { limb: 'QuantumLimb',                allowedYaoStates: [YaoState.YoungYang, YaoState.YoungMixed, YaoState.SovereignAvatar] },
        { limb: 'OmegaLimb',                  allowedYaoStates: [YaoState.SovereignAvatar, YaoState.SovereignEngine] },

        // ── PIPELINE / ORCHESTRATION ──────────────────────────────
        { limb: 'PipelineController',         allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'MediaForgeLimb',             allowedYaoStates: GENERATIVE_STATES },
        { limb: 'AILimb',                     allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'ControlPlaneLimb',           allowedYaoStates: ALL_STATES },

        // ── NETWORK / CLOUD ───────────────────────────────────────
        { limb: 'WebSearchEngine',            allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'MCPEngine',                  allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'SwitchboardLimb',            allowedYaoStates: NON_CHAOS_STATES },
        { limb: 'VolumeSovereigntyLimb',      allowedYaoStates: NON_CHAOS_STATES },

        // ── HEXAGRAM-SPECIFIC ACTIVATIONS ─────────────────────────
        // Hexagram 27 (Nourishment) — cache feeding: ingestion + pedagogy
        { limb: 'SovereignIngestionEngine',   allowedYaoStates: ALL_STATES, requiredHexagrams: [27] },
        { limb: 'CacheLearningLimb',          allowedYaoStates: ALL_STATES, requiredHexagrams: [27] },

        // Hexagram 46 (Pushing Upward) — VectorDB elevation + rolodex
        { limb: 'VectorDB',                   allowedYaoStates: ALL_STATES, requiredHexagrams: [46] },

        // Hexagram 20 (Contemplation) — spatial observation only
        { limb: 'GhostSplatEngine',           allowedYaoStates: ALL_STATES, requiredHexagrams: [20] },

        // Hexagram 52 (Keep Still) — freeze: only diagnostics allowed
        { limb: 'CodeEngine',                 allowedYaoStates: NON_CHAOS_STATES, blockedHexagrams: [52] },
        { limb: 'GenerateEngine',             allowedYaoStates: NON_CHAOS_STATES, blockedHexagrams: [52] },
        { limb: 'NeuralForgeLimb',            allowedYaoStates: ALL_STATES, blockedHexagrams: [52] },
    ];

    /**
     * Returns the list of limb names permitted to execute right now.
     *
     * @param hexagramId  Current hexagram numeric ID (1-64)
     * @param yaoState    Current dominant YaoState
     */
    public getAllowedLimbs(hexagramId: number, yaoState: YaoState): string[] {
        const allowed = new Set<string>();

        for (const perm of CognitivePermissionMatrix.DEFAULT_PERMISSIONS) {
            // Must pass Yao state check
            if (!perm.allowedYaoStates.includes(yaoState)) continue;

            // Must not be blocked by current hexagram
            if (perm.blockedHexagrams?.includes(hexagramId)) continue;

            // If hexagram-required, must match
            if (perm.requiredHexagrams && !perm.requiredHexagrams.includes(hexagramId)) continue;

            allowed.add(perm.limb);
        }

        return Array.from(allowed);
    }
}
