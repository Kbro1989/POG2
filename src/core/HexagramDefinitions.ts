/**
 * HexagramDefinitions.ts
 * 
 * Complete semantic registry for all 64 I Ching Hexagrams.
 * Maps binary states (000000-111111) to Archetypes and Strategy Directives.
 * Each hexagram drives the Sovereign Organism's thinking layer before any
 * substrate operation — affecting temperature, novelty bias, and strategy.
 *
 * Convention: Binary key = line6 line5 line4 line3 line2 line1 (top-to-bottom)
 * as produced by HexagramManager.calculateHexagramId().
 */

import { EmotionalState, GenerativeAesthetics } from './models.js';

export interface HexagramDefinition {
    id: number;
    binary: string;
    name: string;
    description: string;
    judgment?: string;
    image?: string;
    strategy: string;
    lines?: string[];
    symbol?: string;
    emotion: EmotionalState;
    aesthetics: GenerativeAesthetics;
}

// Helper to reduce boilerplate while maintaining full type safety
function hex(id: number, binary: string, name: string, description: string, strategy: string, judgment: string, emotion: EmotionalState, vf: string, tv: number, sc: 'Grand' | 'Intimate' | 'Abstract', pal: string[], p: { chaos: number, whimsy: number, darkTone: number, coherence: number }): HexagramDefinition {
    return { id, binary, name, description, strategy, judgment, emotion, aesthetics: { visualFilter: vf, thermalVariance: tv, scale: sc, palette: pal, prosody: p } };
}

export const HEXAGRAM_REGISTRY: Record<string, HexagramDefinition> = {
    // ═══════════════════════════════════════════════════════════════
    // EXISTING 15 HEXAGRAMS (Preserved exactly)
    // ═══════════════════════════════════════════════════════════════
    '111111': {
        id: 1, binary: '111111', name: 'The Creative (Qian)',
        description: 'Pure Yang. Limitless potential and energy.',
        strategy: 'EXPANSION: Focus on generating new features and architectural growth.',
        judgment: 'The Creative works sublime success, furthering through perseverance.',
        emotion: EmotionalState.Inspired,
        aesthetics: { visualFilter: 'vibrant cinematic', thermalVariance: 0.9, scale: 'Grand', palette: ['#FFD700', '#FF4500', '#FFFFFF'], prosody: { chaos: 0.8, whimsy: 0.7, darkTone: 0.1, coherence: 0.9 } }
    },
    '000000': {
        id: 2, binary: '000000', name: 'The Receptive (Kun)',
        description: 'Pure Yin. Devotion and support.',
        strategy: 'STABILIZATION: Focus on refactoring, testing, and supporting existing code.',
        judgment: 'The Receptive brings about sublime success through the perseverance of a mare.',
        emotion: EmotionalState.Quiet,
        aesthetics: { visualFilter: 'minimalist soft', thermalVariance: 0.1, scale: 'Intimate', palette: ['#F5F5F5', '#808080', '#000000'], prosody: { chaos: 0.1, whimsy: 0.2, darkTone: 0.1, coherence: 1.0 } }
    },
    '100010': {
        id: 3, binary: '100010', name: 'Difficulty at the Beginning (Zhun)',
        description: 'Growth amidst chaos.',
        strategy: 'CAUTION: Proceed carefully with new implementations; prioritize setting up infrastructure.',
        judgment: 'Works supreme success. Do not act without a clear destination.',
        emotion: EmotionalState.Surprised,
        aesthetics: { visualFilter: 'foggy mysterious', thermalVariance: 0.5, scale: 'Abstract', palette: ['#A9A9A9', '#4B0082', '#000000'], prosody: { chaos: 0.6, whimsy: 0.4, darkTone: 0.5, coherence: 0.4 } }
    },
    '010001': {
        id: 4, binary: '010001', name: 'Youthful Folly (Meng)',
        description: 'Inexperience seeking a teacher.',
        strategy: 'LEARNING: Consult documentation or KIs before coding. Avoid assumptions.',
        judgment: 'It is not I who seek the young fool; the young fool seeks me.',
        emotion: EmotionalState.Curious,
        aesthetics: { visualFilter: 'charcoal sketch', thermalVariance: 0.3, scale: 'Intimate', palette: ['#F5F5DC', '#8B4513', '#000000'], prosody: { chaos: 0.3, whimsy: 0.8, darkTone: 0.2, coherence: 0.7 } }
    },
    '111010': {
        id: 5, binary: '111010', name: 'Waiting (Xu)',
        description: 'Confidence and patience.',
        strategy: 'PATIENCE: Optimization and careful planning. Do not rush the build.',
        judgment: 'With sincerity, brilliant success. Perseverance brings good fortune.',
        emotion: EmotionalState.Steady,
        aesthetics: { visualFilter: 'serene oceanic', thermalVariance: 0.2, scale: 'Grand', palette: ['#00BFFF', '#4682B4', '#FFFFFF'], prosody: { chaos: 0.1, whimsy: 0.3, darkTone: 0.1, coherence: 0.9 } }
    },
    '010111': {
        id: 6, binary: '010111', name: 'Conflict (Song)',
        description: 'Divergent views.',
        strategy: 'DEBUGGING: Resolve logic conflicts and type errors immediately.',
        judgment: 'You are sincere but obstructed. A cautious halt halfway brings good fortune.',
        emotion: EmotionalState.Agitated,
        aesthetics: { visualFilter: 'glitch distortion', thermalVariance: 0.8, scale: 'Abstract', palette: ['#FF0000', '#000000', '#00FF00'], prosody: { chaos: 0.9, whimsy: 0.2, darkTone: 0.6, coherence: 0.3 } }
    },
    '010000': {
        id: 7, binary: '010000', name: 'The Army (Shi)',
        description: 'Organized discipline.',
        strategy: 'STANDARDISATION: Enforce linting rules and strict architectural patterns.',
        judgment: 'The army needs perseverance and a strong leader. Good fortune without blame.',
        emotion: EmotionalState.Decisive,
        aesthetics: { visualFilter: 'brutalist sharp', thermalVariance: 0.1, scale: 'Grand', palette: ['#2F4F4F', '#708090', '#000000'], prosody: { chaos: 0.1, whimsy: 0.1, darkTone: 0.3, coherence: 1.0 } }
    },
    '000010': {
        id: 8, binary: '000010', name: 'Holding Together (Bi)',
        description: 'Union and solidarity.',
        strategy: 'INTEGRATION: Focus on connecting systems (Limbs/Router) together.',
        judgment: 'Holding together brings good fortune. Those who are uncertain gradually join.',
        emotion: EmotionalState.Steady,
        aesthetics: { visualFilter: 'warm harmonic', thermalVariance: 0.2, scale: 'Intimate', palette: ['#FFA07A', '#F0E68C', '#FFFFFF'], prosody: { chaos: 0.2, whimsy: 0.5, darkTone: 0.1, coherence: 0.9 } }
    },
    '101111': {
        id: 14, binary: '101111', name: 'Possession in Great Measure (Da You)',
        description: 'Supreme success through clarity.',
        strategy: 'MAXIMIZATION: Enhance existing features to their highest potential.',
        judgment: 'Supreme success. Fire in heaven: the image of great possession.',
        emotion: EmotionalState.Inspired,
        aesthetics: { visualFilter: 'golden hour', thermalVariance: 0.6, scale: 'Grand', palette: ['#FFD700', '#DAA520', '#FFFFFF'], prosody: { chaos: 0.4, whimsy: 0.6, darkTone: 0.1, coherence: 0.9 } }
    },
    '001000': {
        id: 15, binary: '001000', name: 'Modesty (Qian)',
        description: 'Reducing excess.',
        strategy: 'MINIMALISM: Reduce code complexity and remove unused artifacts.',
        judgment: 'Modesty creates success. The superior person carries things through.',
        emotion: EmotionalState.Quiet,
        aesthetics: { visualFilter: 'monochrome zen', thermalVariance: 0.05, scale: 'Intimate', palette: ['#FFFFFF', '#C0C0C0', '#000000'], prosody: { chaos: 0.0, whimsy: 0.1, darkTone: 0.1, coherence: 1.0 } }
    },
    '100100': {
        id: 51, binary: '100100', name: 'The Arousing (Zhen)',
        description: 'Shock and thunder.',
        strategy: 'REFACTOR: Radical changes or major version upgrades are favored.',
        judgment: 'Shock brings success. Shock comes — oh, oh! Laughing words — ha, ha!',
        emotion: EmotionalState.Decisive,
        aesthetics: { visualFilter: 'lightning static', thermalVariance: 1.0, scale: 'Abstract', palette: ['#00008B', '#00FFFF', '#FFFFFF'], prosody: { chaos: 1.0, whimsy: 0.3, darkTone: 0.4, coherence: 0.5 } }
    },
    '001001': {
        id: 52, binary: '001001', name: 'Keep Still (Gen)',
        description: 'Mountain. Stopping and resting.',
        strategy: 'FREEZE: Code freeze. Only critical bug fixes allowed.',
        judgment: 'Keeping still. When it is time to stop, then stop.',
        emotion: EmotionalState.Quiet,
        aesthetics: { visualFilter: 'stone landscape', thermalVariance: 0.0, scale: 'Grand', palette: ['#696969', '#808080', '#000000'], prosody: { chaos: 0.0, whimsy: 0.0, darkTone: 0.2, coherence: 1.0 } }
    },
    '110110': {
        id: 58, binary: '110110', name: 'The Joyous (Dui)',
        description: 'Lake. Communication and exchange.',
        strategy: 'UI/UX & PLAYABILITY: Focus on user interaction, CLI improvements, interactive REPLs, and sandbox testing.',
        judgment: 'The joyous: success. Perseverance is favorable.',
        emotion: EmotionalState.Inspired,
        aesthetics: { visualFilter: 'festive glowing', thermalVariance: 0.7, scale: 'Intimate', palette: ['#FF69B4', '#FFB6C1', '#FFFFFF'], prosody: { chaos: 0.5, whimsy: 0.9, darkTone: 0.1, coherence: 0.8 } }
    },
    '011010': {
        id: 29, binary: '011010', name: 'The Abysmal (Kan)',
        description: 'Water. Danger and repetition.',
        strategy: 'SECURITY: Review validation logic and error handling loops.',
        judgment: 'If you are sincere, you have success in your heart. Whatever you do succeeds.',
        emotion: EmotionalState.Agitated,
        aesthetics: { visualFilter: 'deep water noir', thermalVariance: 0.6, scale: 'Abstract', palette: ['#000080', '#191970', '#000000'], prosody: { chaos: 0.7, whimsy: 0.1, darkTone: 0.9, coherence: 0.6 } }
    },
    '101101': {
        id: 30, binary: '101101', name: 'The Clinging (Li)',
        description: 'Fire. Clarity and vision.',
        strategy: 'OBSERVABILITY: Improve logging, monitoring, and debugging output.',
        judgment: 'The clinging. Perseverance furthers. Care of the cow brings good fortune.',
        emotion: EmotionalState.Decisive,
        aesthetics: { visualFilter: 'firelight clear', thermalVariance: 0.9, scale: 'Grand', palette: ['#FF4500', '#FF8C00', '#FFFFFF'], prosody: { chaos: 0.6, whimsy: 0.4, darkTone: 0.2, coherence: 0.9 } }
    },

    // ═══════════════════════════════════════════════════════════════
    // REMAINING 49 HEXAGRAMS — Complete I Ching Coverage
    // ═══════════════════════════════════════════════════════════════
    '111011': hex(9, '111011', 'Small Taming (Xiao Chu)', 'Wind tames heaven gently.', 'INCREMENTAL_CONTROL: Apply small, iterative constraints to large systems. Linting, type-narrowing, guard clauses.', 'Dense clouds but no rain from our western border.', EmotionalState.Steady, 'misty layered', 0.3, 'Grand', ['#B0C4DE', '#87CEEB', '#FFFFFF'], { chaos: 0.2, whimsy: 0.4, darkTone: 0.1, coherence: 0.8 }),
    '110111': hex(10, '110111', 'Treading (Lü)', 'Walking on the tail of the tiger.', 'CAREFUL_PROGRESS: Move through risky changes with full test coverage. Step deliberately.', 'Treading upon the tail of the tiger. It does not bite.', EmotionalState.Curious, 'amber cautious', 0.5, 'Grand', ['#FFA500', '#8B0000', '#000000'], { chaos: 0.4, whimsy: 0.3, darkTone: 0.4, coherence: 0.7 }),
    '111000': hex(11, '111000', 'Peace (Tai)', 'Heaven below earth: harmony.', 'HARMONY: Systems are aligned. Push for full integration tests and deploy with confidence.', 'The small departs, the great approaches. Good fortune. Success.', EmotionalState.Zen, 'aurora borealis', 0.4, 'Grand', ['#00FF7F', '#48D1CC', '#FFFFFF'], { chaos: 0.2, whimsy: 0.5, darkTone: 0.0, coherence: 1.0 }),
    '000111': hex(12, '000111', 'Standstill (Pi)', 'Earth below heaven: stagnation.', 'PAUSE: Communication between layers has broken down. Audit interfaces and API contracts before proceeding.', 'Evil people do not further the perseverance of the superior.', EmotionalState.Frustrated, 'overcast grey', 0.1, 'Abstract', ['#808080', '#696969', '#000000'], { chaos: 0.3, whimsy: 0.1, darkTone: 0.6, coherence: 0.4 }),
    '111101': hex(13, '111101', 'Fellowship (Tong Ren)', 'Heaven with fire: fellowship.', 'TEAM_SYNC: Align all limbs and engines toward a shared objective. Unify naming, interfaces, config.', 'Fellowship with all under heaven. Success across the great water.', EmotionalState.Inspired, 'campfire warm', 0.5, 'Grand', ['#FF6347', '#FFA07A', '#FFFFFF'], { chaos: 0.3, whimsy: 0.6, darkTone: 0.1, coherence: 0.9 }),
    '000100': hex(16, '000100', 'Enthusiasm (Yu)', 'Thunder over earth: movement.', 'MOMENTUM: Leverage current energy to push through blockers. Launch features, deploy aggressively.', 'It furthers one to install helpers and to set armies marching.', EmotionalState.Excited, 'electric pulse', 0.8, 'Grand', ['#7B68EE', '#9370DB', '#FFFFFF'], { chaos: 0.6, whimsy: 0.7, darkTone: 0.1, coherence: 0.7 }),
    '100110': hex(17, '100110', 'Following (Sui)', 'Lake over thunder: joyful movement.', 'ALIGNMENT: Follow the data. Let substrate results guide the next action rather than assumptions.', 'Following has supreme success. Perseverance furthers. No blame.', EmotionalState.Steady, 'twilight gradient', 0.4, 'Intimate', ['#6A5ACD', '#DDA0DD', '#FFFFFF'], { chaos: 0.2, whimsy: 0.5, darkTone: 0.2, coherence: 0.8 }),
    '011001': hex(18, '011001', 'Work on Decayed (Gu)', 'Wind below mountain: corruption.', 'TECH_DEBT: Address rot at the foundation. Fix deprecated APIs, update dependencies, clean dead code.', 'Work on what has been spoiled has supreme success. Cross the great water.', EmotionalState.Decisive, 'weathered patina', 0.3, 'Intimate', ['#8B4513', '#D2691E', '#000000'], { chaos: 0.3, whimsy: 0.2, darkTone: 0.5, coherence: 0.7 }),
    '110000': hex(19, '110000', 'Approach (Lin)', 'Earth over lake: approach.', 'ONBOARDING: Systems are ready to receive new data or users. Focus on ingestion pipelines and substrate loading.', 'Approach has supreme success. Perseverance furthers.', EmotionalState.Curious, 'dawn horizon', 0.4, 'Grand', ['#FFE4B5', '#FF8C00', '#FFFFFF'], { chaos: 0.2, whimsy: 0.4, darkTone: 0.1, coherence: 0.9 }),
    '000011': hex(20, '000011', 'Contemplation (Guan)', 'Wind over earth: viewing.', 'OBSERVABILITY & SIMULATION: Observe full system state. Monitor spatial REPL Sandbox avatars and 600ms engine tick streams before injecting logic.', 'Contemplation. The wind blows over the earth.', EmotionalState.Pensive, 'satellite view', 0.2, 'Grand', ['#4169E1', '#B0C4DE', '#FFFFFF'], { chaos: 0.1, whimsy: 0.3, darkTone: 0.2, coherence: 0.9 }),
    '100101': hex(21, '100101', 'Biting Through (Shi He)', 'Fire and thunder: enforcement.', 'ENFORCEMENT: Apply strict validation. Reject malformed data, enforce schema contracts, break on assertion failures.', 'Biting through has success. It is favorable to let justice be administered.', EmotionalState.Decisive, 'laser precision', 0.7, 'Abstract', ['#DC143C', '#FFD700', '#000000'], { chaos: 0.5, whimsy: 0.2, darkTone: 0.4, coherence: 0.8 }),
    '101001': hex(22, '101001', 'Grace (Bi)', 'Fire at foot of mountain: beauty.', 'POLISH: Focus on aesthetics, documentation, and user-facing presentation. Make the output shine.', 'Grace has success. In small matters it is favorable to undertake something.', EmotionalState.Inspired, 'renaissance oil', 0.5, 'Intimate', ['#DAA520', '#CD853F', '#FFFFF0'], { chaos: 0.3, whimsy: 0.7, darkTone: 0.1, coherence: 0.9 }),
    '000001': hex(23, '000001', 'Splitting Apart (Bo)', 'Mountain over earth: erosion.', 'DECOMPOSE: Break monolithic components into smaller, testable units. Controlled demolition of legacy.', 'Splitting apart. It does not further one to go anywhere.', EmotionalState.Quiet, 'stripped minimal', 0.2, 'Abstract', ['#A0522D', '#DEB887', '#000000'], { chaos: 0.2, whimsy: 0.1, darkTone: 0.5, coherence: 0.6 }),
    '100000': hex(24, '100000', 'Return (Fu)', 'Thunder below earth: renewal.', 'REVISIT: Return to fundamentals. Re-read core models, re-verify base assumptions, restart with clarity.', 'Return. Success. Going out and coming in without error.', EmotionalState.Steady, 'first light', 0.3, 'Grand', ['#228B22', '#32CD32', '#FFFFFF'], { chaos: 0.2, whimsy: 0.3, darkTone: 0.1, coherence: 0.9 }),
    '100111': hex(25, '100111', 'Innocence (Wu Wang)', 'Heaven with thunder: the unexpected.', 'CLEAN_SLATE: Approach the problem without preconceptions. Reset caches, clear state, start fresh.', 'Innocence. Supreme success. Perseverance furthers.', EmotionalState.Curious, 'blank canvas', 0.4, 'Grand', ['#F0F8FF', '#E6E6FA', '#FFFFFF'], { chaos: 0.3, whimsy: 0.6, darkTone: 0.0, coherence: 0.9 }),
    '111001': hex(26, '111001', 'Great Taming (Da Chu)', 'Mountain over heaven: containment.', 'ARCHITECTURE: Contain and structure great power. Design the system boundaries before releasing energy.', 'Great taming. Perseverance furthers. Not eating at home brings good fortune.', EmotionalState.Decisive, 'cathedral interior', 0.3, 'Grand', ['#4B0082', '#9400D3', '#FFFFFF'], { chaos: 0.2, whimsy: 0.3, darkTone: 0.3, coherence: 1.0 }),
    '100001': hex(27, '100001', 'Nourishment (Yi)', 'Mountain over thunder: jaws.', 'SELF_CARE: Feed the substrate — ingest new data, update pedagogies, ensure the memory layer is well-nourished.', 'Nourishment. Perseverance brings good fortune. Pay heed to the providing of nourishment.', EmotionalState.Steady, 'organic growth', 0.3, 'Intimate', ['#556B2F', '#6B8E23', '#FFFFFF'], { chaos: 0.1, whimsy: 0.4, darkTone: 0.1, coherence: 0.9 }),
    '011110': hex(28, '011110', 'Great Preponderance (Da Guo)', 'Lake over wind: excess weight.', 'OVERCOMMIT_CHECK: The system is overloaded. Reduce active tasks, defer non-critical operations, shed weight.', 'The ridgepole sags. It furthers one to have somewhere to go.', EmotionalState.Agitated, 'stress fracture', 0.8, 'Abstract', ['#B22222', '#CD5C5C', '#000000'], { chaos: 0.7, whimsy: 0.2, darkTone: 0.7, coherence: 0.4 }),
    '001110': hex(31, '001110', 'Influence (Xian)', 'Lake over mountain: attraction.', 'COLLABORATION: Open channels between previously isolated components. Enable cross-limb communication.', 'Influence. Success. Perseverance furthers. To take a maiden to wife brings good fortune.', EmotionalState.Curious, 'magnetic field', 0.5, 'Intimate', ['#FF1493', '#C71585', '#FFFFFF'], { chaos: 0.4, whimsy: 0.6, darkTone: 0.1, coherence: 0.8 }),
    '011100': hex(32, '011100', 'Duration (Heng)', 'Thunder over wind: endurance.', 'PERSISTENCE: Stay the course. Long-running operations (training, rendering, ingestion) must complete. Do not interrupt.', 'Duration. Success. No blame. Perseverance furthers.', EmotionalState.Steady, 'ancient stone', 0.2, 'Grand', ['#2F4F4F', '#708090', '#FFFFFF'], { chaos: 0.1, whimsy: 0.2, darkTone: 0.2, coherence: 1.0 }),
    '001111': hex(33, '001111', 'Retreat (Dun)', 'Heaven over mountain: withdrawal.', 'ROLLBACK: Strategic retreat. Revert recent changes that caused regression. Preserve what works.', 'Retreat. Success. In what is small, perseverance furthers.', EmotionalState.Quiet, 'mountain mist', 0.2, 'Grand', ['#778899', '#B0C4DE', '#000000'], { chaos: 0.1, whimsy: 0.1, darkTone: 0.3, coherence: 0.9 }),
    '111100': hex(34, '111100', 'Great Power (Da Zhuang)', 'Thunder over heaven: great strength.', 'ACCELERATION: Full power. Run all pipelines in parallel. Deploy, render, and ingest simultaneously.', 'Great power. Perseverance furthers.', EmotionalState.Excited, 'supernova burst', 0.9, 'Grand', ['#FF4500', '#FF6347', '#FFFFFF'], { chaos: 0.7, whimsy: 0.5, darkTone: 0.2, coherence: 0.7 }),
    '000101': hex(35, '000101', 'Progress (Jin)', 'Fire over earth: sunrise.', 'FORWARD: Clear path ahead. Advance the pipeline to the next phase. Ship completed work.', 'The powerful prince is honored with horses in great number.', EmotionalState.Inspired, 'sunrise gold', 0.6, 'Grand', ['#FFD700', '#FFA500', '#FFFFFF'], { chaos: 0.3, whimsy: 0.5, darkTone: 0.0, coherence: 0.9 }),
    '101000': hex(36, '101000', 'Darkening of Light (Ming Yi)', 'Earth over fire: concealment.', 'STEALTH: Work quietly on internal improvements. Avoid exposing incomplete work. Build in shadow.', 'In adversity, it furthers one to be persevering. Darken your light.', EmotionalState.Melancholy, 'noir shadow', 0.3, 'Abstract', ['#191970', '#2F2F2F', '#000000'], { chaos: 0.3, whimsy: 0.1, darkTone: 0.9, coherence: 0.6 }),
    '101011': hex(37, '101011', 'The Family (Jia Ren)', 'Wind over fire: clan.', 'MODULARIZATION: Strengthen internal module boundaries. Each limb/engine must be self-contained with clear interfaces.', 'The family. Perseverance of the woman furthers. Set the family order.', EmotionalState.Steady, 'hearth glow', 0.4, 'Intimate', ['#FF8C00', '#F4A460', '#FFFFF0'], { chaos: 0.2, whimsy: 0.4, darkTone: 0.1, coherence: 0.9 }),
    '110101': hex(38, '110101', 'Opposition (Kui)', 'Fire over lake: contradiction.', 'ADVERSARIAL_TEST: Test edge cases. Feed adversarial inputs. Verify the system handles contradictions gracefully.', 'In small matters, good fortune. Fire moves upward, the lake downward.', EmotionalState.Agitated, 'split contrast', 0.7, 'Abstract', ['#FF0000', '#0000FF', '#FFFFFF'], { chaos: 0.7, whimsy: 0.3, darkTone: 0.4, coherence: 0.5 }),
    '001010': hex(39, '001010', 'Obstruction (Jian)', 'Water over mountain: difficulty.', 'WORKAROUND: Direct path is blocked. Find alternative approaches — different model, different data source, different algorithm.', 'The southwest furthers. The northeast does not further.', EmotionalState.Frustrated, 'storm clouds', 0.5, 'Abstract', ['#4B0082', '#696969', '#000000'], { chaos: 0.5, whimsy: 0.2, darkTone: 0.6, coherence: 0.5 }),
    '010100': hex(40, '010100', 'Deliverance (Jie)', 'Thunder over water: release.', 'UNBLOCK: The obstruction is cleared. Resume normal operations. Clear error queues and retry failed tasks.', 'Deliverance. The southwest furthers. If there is nothing to do, return brings good fortune.', EmotionalState.Curious, 'storm clearing', 0.6, 'Grand', ['#48D1CC', '#00CED1', '#FFFFFF'], { chaos: 0.4, whimsy: 0.5, darkTone: 0.2, coherence: 0.7 }),
    '110001': hex(41, '110001', 'Decrease (Sun)', 'Mountain over lake: reduction.', 'SIMPLIFICATION: Remove unnecessary complexity. Delete dead code, consolidate duplicate functions, flatten hierarchies.', 'Decrease combined with sincerity brings about supreme good fortune.', EmotionalState.Quiet, 'winter bare', 0.2, 'Intimate', ['#F5F5F5', '#DCDCDC', '#000000'], { chaos: 0.1, whimsy: 0.2, darkTone: 0.1, coherence: 1.0 }),
    '100011': hex(42, '100011', 'Increase (Yi)', 'Wind over thunder: amplification.', 'AMPLIFICATION: Scale successful patterns. If a limb works well, replicate its architecture for new domains.', 'Increase. It furthers one to undertake something. It furthers one to cross the great water.', EmotionalState.Excited, 'emerald growth', 0.6, 'Grand', ['#00FF00', '#228B22', '#FFFFFF'], { chaos: 0.4, whimsy: 0.5, darkTone: 0.0, coherence: 0.8 }),
    '111110': hex(43, '111110', 'Breakthrough (Guai)', 'Lake over heaven: resolution.', 'BREAKTHROUGH: Decisive push through final obstacles. Ship the release. Deploy with full commitment.', 'One must resolutely make the matter known at the court of the king.', EmotionalState.Decisive, 'lightning strike', 0.9, 'Grand', ['#FFD700', '#FF4500', '#00008B'], { chaos: 0.6, whimsy: 0.4, darkTone: 0.2, coherence: 0.8 }),
    '011111': hex(44, '011111', 'Coming to Meet (Gou)', 'Heaven over wind: encounter.', 'RECEPTION: New external input arriving. Prepare ingestion pipelines, validate incoming data, sanitize inputs.', 'Coming to meet. The maiden is powerful. One should not marry such a maiden.', EmotionalState.Surprised, 'portal shimmer', 0.5, 'Abstract', ['#9370DB', '#BA55D3', '#FFFFFF'], { chaos: 0.5, whimsy: 0.6, darkTone: 0.2, coherence: 0.6 }),
    '000110': hex(45, '000110', 'Gathering (Cui)', 'Lake over earth: congregation.', 'CONSOLIDATE: Merge scattered data into unified substrates. Combine learning DBs, aggregate metrics, unify logs.', 'Gathering together. Success. The king approaches his temple. Bring great offerings.', EmotionalState.Steady, 'harvest gold', 0.4, 'Grand', ['#B8860B', '#DAA520', '#FFFFF0'], { chaos: 0.2, whimsy: 0.3, darkTone: 0.1, coherence: 0.9 }),
    '011000': hex(46, '011000', 'Pushing Upward (Sheng)', 'Earth over wind: ascent.', 'ELEVATION: Promote experimental features to production. Migrate from test to stable substrate.', 'Pushing upward has supreme success. One must see the great person.', EmotionalState.Inspired, 'elevator rise', 0.5, 'Grand', ['#4169E1', '#6495ED', '#FFFFFF'], { chaos: 0.3, whimsy: 0.4, darkTone: 0.1, coherence: 0.8 }),
    '010110': hex(47, '010110', 'Oppression (Kun)', 'Lake over water: exhaustion.', 'RESOURCE_MANAGEMENT: System is resource-starved. Throttle requests, implement backpressure, defer heavy tasks.', 'Oppression. Success. Perseverance. The great one brings about good fortune. No blame.', EmotionalState.Frustrated, 'desert heat', 0.3, 'Abstract', ['#CD853F', '#8B4513', '#000000'], { chaos: 0.4, whimsy: 0.1, darkTone: 0.7, coherence: 0.5 }),
    '010010': hex(48, '010010', 'The Well (Jing)', 'Water over wind: depths.', 'DEEP_RETRIEVAL: Go deep into the substrate. Perform exhaustive vector searches. Query all DB layers for hidden knowledge.', 'The well. The town may be changed, but the well cannot be changed.', EmotionalState.Pensive, 'deep cavern', 0.3, 'Abstract', ['#006400', '#2E8B57', '#000000'], { chaos: 0.2, whimsy: 0.3, darkTone: 0.4, coherence: 0.8 }),
    '101110': hex(49, '101110', 'Revolution (Ge)', 'Lake over fire: transformation.', 'PARADIGM_SHIFT: Fundamental architecture change required. Swap engines, replace core algorithms, re-design data flow.', 'Revolution. On your own day you are believed. Supreme success.', EmotionalState.Decisive, 'molten core', 0.9, 'Grand', ['#FF4500', '#8B0000', '#FFD700'], { chaos: 0.8, whimsy: 0.3, darkTone: 0.3, coherence: 0.6 }),
    '011101': hex(50, '011101', 'The Cauldron (Ding)', 'Fire over wind: alchemical vessel.', 'TRANSFORMATION: Raw inputs are being refined into valuable outputs. The pipeline is working — feed it more data.', 'The cauldron. Supreme good fortune. Success.', EmotionalState.Inspired, 'alchemical glow', 0.7, 'Grand', ['#B8860B', '#FF8C00', '#FFFFFF'], { chaos: 0.4, whimsy: 0.5, darkTone: 0.1, coherence: 0.9 }),
    '001011': hex(53, '001011', 'Development (Jian)', 'Wind over mountain: gradual progress.', 'INCREMENTAL: Advance slowly but steadily. Each commit must build on the last with verified correctness.', 'Development. The maiden is given in marriage. Good fortune. Perseverance furthers.', EmotionalState.Steady, 'bamboo forest', 0.3, 'Grand', ['#228B22', '#90EE90', '#FFFFFF'], { chaos: 0.1, whimsy: 0.4, darkTone: 0.1, coherence: 0.9 }),
    '110100': hex(54, '110100', 'Marrying Maiden (Gui Mei)', 'Thunder over lake: secondary role.', 'INTEGRATION_TEST: New components must prove themselves before becoming primary. Run in shadow mode alongside existing systems.', 'Undertakings bring misfortune. Nothing that would further.', EmotionalState.Curious, 'twilight amber', 0.4, 'Intimate', ['#D2691E', '#BC8F8F', '#000000'], { chaos: 0.4, whimsy: 0.3, darkTone: 0.3, coherence: 0.6 }),
    '101100': hex(55, '101100', 'Abundance (Feng)', 'Thunder over fire: fullness.', 'SCALING: The system is at peak capacity. Scale horizontally, add worker threads, increase throughput.', 'Abundance has success. The king attains abundance. Be not sad. Be like the sun at midday.', EmotionalState.Excited, 'solar maximum', 0.8, 'Grand', ['#FFD700', '#FF6347', '#FFFFFF'], { chaos: 0.5, whimsy: 0.6, darkTone: 0.1, coherence: 0.8 }),
    '001101': hex(56, '001101', 'The Wanderer (Lü)', 'Fire over mountain: travel.', 'EXPLORATION: Venture into uncharted substrate territory. Probe new cache majors, test new model endpoints, map unknown data.', 'The wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.', EmotionalState.Curious, 'desert caravan', 0.5, 'Abstract', ['#DEB887', '#D2B48C', '#000000'], { chaos: 0.4, whimsy: 0.5, darkTone: 0.3, coherence: 0.6 }),
    '011011': hex(57, '011011', 'The Gentle (Xun)', 'Wind over wind: penetration.', 'GRADUAL_CHANGE: Apply subtle, persistent pressure. Small config changes that accumulate into large behavioral shifts.', 'The gentle. Success through small things. It furthers one to have somewhere to go.', EmotionalState.Zen, 'breeze ripple', 0.2, 'Intimate', ['#87CEEB', '#B0E0E6', '#FFFFFF'], { chaos: 0.1, whimsy: 0.4, darkTone: 0.0, coherence: 1.0 }),
    '010011': hex(59, '010011', 'Dispersion (Huan)', 'Wind over water: dissolution.', 'DISTRIBUTION: Scatter concentrated resources across multiple nodes. Distribute knowledge across all DB substrates.', 'Dispersion. Success. The king approaches his temple. It furthers one to cross the great water.', EmotionalState.Pensive, 'river delta', 0.4, 'Grand', ['#4682B4', '#87CEFA', '#FFFFFF'], { chaos: 0.3, whimsy: 0.4, darkTone: 0.2, coherence: 0.7 }),
    '110010': hex(60, '110010', 'Limitation (Jie)', 'Water over lake: boundaries.', 'CONSTRAINT & SPATIAL LIMITS: Enforce hard boundaries. Apply spatial collision logic, clip out-of-bounds coordinates, enforce maximum timeouts.', 'Limitation. Success. Galling limitation must not be persevered in.', EmotionalState.Decisive, 'ice crystal', 0.2, 'Intimate', ['#00BFFF', '#E0FFFF', '#000000'], { chaos: 0.1, whimsy: 0.2, darkTone: 0.2, coherence: 1.0 }),
    '110011': hex(61, '110011', 'Inner Truth (Zhong Fu)', 'Wind over lake: sincerity.', 'VALIDATION: Deep verification of system correctness. Run end-to-end tests, verify DB integrity, confirm output fidelity.', 'Inner truth. Pigs and fishes. Good fortune. It furthers one to cross the great water.', EmotionalState.Zen, 'crystal clarity', 0.3, 'Intimate', ['#E0FFFF', '#AFEEEE', '#FFFFFF'], { chaos: 0.1, whimsy: 0.3, darkTone: 0.0, coherence: 1.0 }),
    '001100': hex(62, '001100', 'Small Preponderance (Xiao Guo)', 'Thunder over mountain: small excess.', 'FINE_TUNING: Make small but important adjustments. Tweak thresholds, adjust weights, calibrate confidence scores.', 'Small preponderance. Success. Perseverance furthers.', EmotionalState.Steady, 'precision lens', 0.3, 'Intimate', ['#708090', '#C0C0C0', '#FFFFFF'], { chaos: 0.2, whimsy: 0.3, darkTone: 0.2, coherence: 0.9 }),
    '101010': hex(63, '101010', 'After Completion (Ji Ji)', 'Water over fire: order achieved.', 'MAINTENANCE: The system is complete and functioning. Focus on monitoring, health checks, and preventing regression.', 'After completion. Success in small matters. Perseverance furthers. Good fortune in the beginning, disorder at the end.', EmotionalState.Steady, 'sunset calm', 0.2, 'Grand', ['#FFA07A', '#FA8072', '#FFFFFF'], { chaos: 0.1, whimsy: 0.3, darkTone: 0.2, coherence: 1.0 }),
    '010101': hex(64, '010101', 'Before Completion (Wei Ji)', 'Fire over water: not yet crossed.', 'FINAL_SPRINT: Almost there but not yet done. Every detail matters. Verify every edge, test every path, then ship.', 'Before completion. Success. But if the little fox has nearly completed the crossing and gets his tail in the water, there is nothing that would further.', EmotionalState.Agitated, 'dawn edge', 0.6, 'Abstract', ['#FF6347', '#4682B4', '#000000'], { chaos: 0.5, whimsy: 0.3, darkTone: 0.4, coherence: 0.6 })
};

export const DEFAULT_HEXAGRAM = HEXAGRAM_REGISTRY['111111'];
