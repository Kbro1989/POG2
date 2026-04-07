import { YaoState, EmotionalState } from './models.js';

export interface SkillResonance {
    id: number;
    name: string;
    category: 'Combat' | 'Gathering' | 'Artisan' | 'Support' | 'Elite' | 'Dark';
    yaoAffinity: YaoState;
    emotionAffinity: EmotionalState;
}

export const SKILL_RESONANCE_MAP: Record<number, SkillResonance> = {
    0: { id: 0, name: 'Attack', category: 'Combat', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Agitated },
    1: { id: 1, name: 'Defence', category: 'Combat', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    2: { id: 2, name: 'Strength', category: 'Combat', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Excited },
    3: { id: 3, name: 'Constitution', category: 'Combat', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    4: { id: 4, name: 'Ranged', category: 'Combat', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    5: { id: 5, name: 'Prayer', category: 'Support', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Quiet },
    6: { id: 6, name: 'Magic', category: 'Combat', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Curious },
    7: { id: 7, name: 'Cooking', category: 'Artisan', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    8: { id: 8, name: 'Woodcutting', category: 'Gathering', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    9: { id: 9, name: 'Fletching', category: 'Artisan', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    10: { id: 10, name: 'Fishing', category: 'Gathering', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    11: { id: 11, name: 'Firemaking', category: 'Support', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Excited },
    12: { id: 12, name: 'Crafting', category: 'Artisan', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    13: { id: 13, name: 'Smithing', category: 'Artisan', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    14: { id: 14, name: 'Mining', category: 'Gathering', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    15: { id: 15, name: 'Herblore', category: 'Support', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    16: { id: 16, name: 'Agility', category: 'Support', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Inspired },
    17: { id: 17, name: 'Thieving', category: 'Dark', yaoAffinity: YaoState.OldYin, emotionAffinity: EmotionalState.Curious },
    18: { id: 18, name: 'Slayer', category: 'Support', yaoAffinity: YaoState.OldYang, emotionAffinity: EmotionalState.Agitated },
    19: { id: 19, name: 'Farming', category: 'Gathering', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    20: { id: 20, name: 'Runecrafting', category: 'Support', yaoAffinity: YaoState.OldYin, emotionAffinity: EmotionalState.Pensive },
    21: { id: 21, name: 'Hunter', category: 'Gathering', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    22: { id: 22, name: 'Construction', category: 'Artisan', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Steady },
    23: { id: 23, name: 'Summoning', category: 'Support', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Quiet },
    24: { id: 24, name: 'Dungeoneering', category: 'Support', yaoAffinity: YaoState.OldYin, emotionAffinity: EmotionalState.Surprised },
    25: { id: 25, name: 'Divination', category: 'Gathering', yaoAffinity: YaoState.YoungYin, emotionAffinity: EmotionalState.Zen },
    26: { id: 26, name: 'Invention', category: 'Elite', yaoAffinity: YaoState.YoungYang, emotionAffinity: EmotionalState.Inspired },
    27: { id: 27, name: 'Archaeology', category: 'Gathering', yaoAffinity: YaoState.OldYin, emotionAffinity: EmotionalState.Curious },
    28: { id: 28, name: 'Necromancy', category: 'Dark', yaoAffinity: YaoState.OldYin, emotionAffinity: EmotionalState.Melancholy },
};

/**
 * Helper to get resonance by skill name (case-insensitive)
 */
export function getSkillResonanceByName(name: string): SkillResonance | undefined {
    return Object.values(SKILL_RESONANCE_MAP).find(s => s.name.toLowerCase() === name.toLowerCase());
}
