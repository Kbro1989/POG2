/**
 * HexagramDefinitions.ts
 * 
 * Semantic registry for the 64 I Ching Hexagrams.
 * Maps binary states (000000-111111) to Archetypes and Strategy Directives.
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

export const HEXAGRAM_REGISTRY: Record<string, HexagramDefinition> = {
    '111111': {
        id: 1,
        binary: '111111',
        name: 'The Creative (Qian)',
        description: 'Pure Yang. Limitless potential and energy.',
        strategy: 'EXPANSION: Focus on generating new features and architectural growth.',
        emotion: EmotionalState.Inspired,
        aesthetics: {
            visualFilter: 'vibrant cinematic',
            thermalVariance: 0.9,
            scale: 'Grand',
            palette: ['#FFD700', '#FF4500', '#FFFFFF'],
            prosody: { chaos: 0.8, whimsy: 0.7, darkTone: 0.1, coherence: 0.9 }
        }
    },
    '000000': {
        id: 2,
        binary: '000000',
        name: 'The Receptive (Kun)',
        description: 'Pure Yin. Devotion and support.',
        strategy: 'STABILIZATION: Focus on refactoring, testing, and supporting existing code.',
        emotion: EmotionalState.Quiet,
        aesthetics: {
            visualFilter: 'minimalist soft',
            thermalVariance: 0.1,
            scale: 'Intimate',
            palette: ['#F5F5F5', '#808080', '#000000'],
            prosody: { chaos: 0.1, whimsy: 0.2, darkTone: 0.1, coherence: 1.0 }
        }
    },
    '100010': {
        id: 3,
        binary: '100010',
        name: 'Difficulty at the Beginning (Zhun)',
        description: 'Growth amidst chaos.',
        strategy: 'CAUTION: Proceed carefully with new implementations; prioritize setting up infrastructure.',
        emotion: EmotionalState.Surprised,
        aesthetics: {
            visualFilter: 'foggy mysterious',
            thermalVariance: 0.5,
            scale: 'Abstract',
            palette: ['#A9A9A9', '#4B0082', '#000000'],
            prosody: { chaos: 0.6, whimsy: 0.4, darkTone: 0.5, coherence: 0.4 }
        }
    },
    '010001': {
        id: 4,
        binary: '010001',
        name: 'Youthful Folly (Meng)',
        description: 'Inexperience seeking a teacher.',
        strategy: 'LEARNING: Consult documentation or KIs before coding. Avoid assumptions.',
        emotion: EmotionalState.Curious,
        aesthetics: {
            visualFilter: 'charcoal sketch',
            thermalVariance: 0.3,
            scale: 'Intimate',
            palette: ['#F5F5DC', '#8B4513', '#000000'],
            prosody: { chaos: 0.3, whimsy: 0.8, darkTone: 0.2, coherence: 0.7 }
        }
    },
    '111010': {
        id: 5,
        binary: '111010',
        name: 'Waiting (Xu)',
        description: 'Confidence and patience.',
        strategy: 'PATIENCE: Optimization and careful planning. Do not rush the build.',
        emotion: EmotionalState.Steady,
        aesthetics: {
            visualFilter: 'serene oceanic',
            thermalVariance: 0.2,
            scale: 'Grand',
            palette: ['#00BFFF', '#4682B4', '#FFFFFF'],
            prosody: { chaos: 0.1, whimsy: 0.3, darkTone: 0.1, coherence: 0.9 }
        }
    },
    '010111': {
        id: 6,
        binary: '010111',
        name: 'Conflict (Song)',
        description: 'Divergent views.',
        strategy: 'DEBUGGING: Resolve logic conflicts and type errors immediately.',
        emotion: EmotionalState.Agitated,
        aesthetics: {
            visualFilter: 'glitch distortion',
            thermalVariance: 0.8,
            scale: 'Abstract',
            palette: ['#FF0000', '#000000', '#00FF00'],
            prosody: { chaos: 0.9, whimsy: 0.2, darkTone: 0.6, coherence: 0.3 }
        }
    },
    '010000': {
        id: 7,
        binary: '010000',
        name: 'The Army (Shi)',
        description: 'Organized discipline.',
        strategy: 'STANDARDISATION: Enforce linting rules and strict architectural patterns.',
        emotion: EmotionalState.Decisive,
        aesthetics: {
            visualFilter: 'brutalist sharp',
            thermalVariance: 0.1,
            scale: 'Grand',
            palette: ['#2F4F4F', '#708090', '#000000'],
            prosody: { chaos: 0.1, whimsy: 0.1, darkTone: 0.3, coherence: 1.0 }
        }
    },
    '000010': {
        id: 8,
        binary: '000010',
        name: 'Holding Together (Bi)',
        description: 'Union and solidarity.',
        strategy: 'INTEGRATION: Focus on connecting systems (Limbs/Router) together.',
        emotion: EmotionalState.Steady,
        aesthetics: {
            visualFilter: 'warm harmonic',
            thermalVariance: 0.2,
            scale: 'Intimate',
            palette: ['#FFA07A', '#F0E68C', '#FFFFFF'],
            prosody: { chaos: 0.2, whimsy: 0.5, darkTone: 0.1, coherence: 0.9 }
        }
    },
    '101111': {
        id: 14,
        binary: '101111',
        name: 'Possession in Great Measure (Da You)',
        description: 'Supreme success through clarity.',
        strategy: 'MAXIMIZATION: Enhance existing features to their highest potential.',
        emotion: EmotionalState.Inspired,
        aesthetics: {
            visualFilter: 'golden hour',
            thermalVariance: 0.6,
            scale: 'Grand',
            palette: ['#FFD700', '#DAA520', '#FFFFFF'],
            prosody: { chaos: 0.4, whimsy: 0.6, darkTone: 0.1, coherence: 0.9 }
        }
    },
    '001000': {
        id: 15,
        binary: '001000',
        name: 'Modesty (Qian)',
        description: 'Reducing excess.',
        strategy: 'MINIMALISM: Reduce code complexity and remove unused artifacts.',
        emotion: EmotionalState.Quiet,
        aesthetics: {
            visualFilter: 'monochrome zen',
            thermalVariance: 0.05,
            scale: 'Intimate',
            palette: ['#FFFFFF', '#C0C0C0', '#000000'],
            prosody: { chaos: 0.0, whimsy: 0.1, darkTone: 0.1, coherence: 1.0 }
        }
    },
    '100100': {
        id: 51,
        binary: '100100',
        name: 'The Arousing (Zhen)',
        description: 'Shock and thunder.',
        strategy: 'REFACTOR: Radical changes or major version upgrades are favored.',
        emotion: EmotionalState.Decisive,
        aesthetics: {
            visualFilter: 'lightning static',
            thermalVariance: 1.0,
            scale: 'Abstract',
            palette: ['#00008B', '#00FFFF', '#FFFFFF'],
            prosody: { chaos: 1.0, whimsy: 0.3, darkTone: 0.4, coherence: 0.5 }
        }
    },
    '001001': {
        id: 52,
        binary: '001001',
        name: 'Keep Still (Gen)',
        description: 'Mountain. Stopping and resting.',
        strategy: 'FREEZE: Code freeze. Only critical bug fixes allowed.',
        emotion: EmotionalState.Quiet,
        aesthetics: {
            visualFilter: 'stone landscape',
            thermalVariance: 0.0,
            scale: 'Grand',
            palette: ['#696969', '#808080', '#000000'],
            prosody: { chaos: 0.0, whimsy: 0.0, darkTone: 0.2, coherence: 1.0 }
        }
    },
    '110110': {
        id: 58,
        binary: '110110',
        name: 'The Joyous (Dui)',
        description: 'Lake. Communication and exchange.',
        strategy: 'UI/UX: Focus on user interaction, CLI improvements, and feedback loops.',
        emotion: EmotionalState.Inspired,
        aesthetics: {
            visualFilter: 'festive glowing',
            thermalVariance: 0.7,
            scale: 'Intimate',
            palette: ['#FF69B4', '#FFB6C1', '#FFFFFF'],
            prosody: { chaos: 0.5, whimsy: 0.9, darkTone: 0.1, coherence: 0.8 }
        }
    },
    '011010': {
        id: 29,
        binary: '011010',
        name: 'The Abysmal (Kan)',
        description: 'Water. Danger and repetition.',
        strategy: 'SECURITY: Review validation logic and error handling loops.',
        emotion: EmotionalState.Agitated,
        aesthetics: {
            visualFilter: 'deep water noir',
            thermalVariance: 0.6,
            scale: 'Abstract',
            palette: ['#000080', '#191970', '#000000'],
            prosody: { chaos: 0.7, whimsy: 0.1, darkTone: 0.9, coherence: 0.6 }
        }
    },
    '101101': {
        id: 30,
        binary: '101101',
        name: 'The Clinging (Li)',
        description: 'Fire. Clarity and vision.',
        strategy: 'OBSERVABILITY: Improve logging, monitoring, and debugging output.',
        emotion: EmotionalState.Decisive,
        aesthetics: {
            visualFilter: 'firelight clear',
            thermalVariance: 0.9,
            scale: 'Grand',
            palette: ['#FF4500', '#FF8C00', '#FFFFFF'],
            prosody: { chaos: 0.6, whimsy: 0.4, darkTone: 0.2, coherence: 0.9 }
        }
    }
};

export const DEFAULT_HEXAGRAM = HEXAGRAM_REGISTRY['111111'];
