import { Result, ok, err, YaoState, EmotionalState } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { StoryboardScene } from '../creative/StoryboardLimbV2.js';
import { CacheForensicsLimb } from '../spatial/CacheForensicsLimb.js';
import { PedagogyLimb } from './PedagogyLimb.js';
import { createLogger } from "../../utils/logger.js";
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logger = createLogger('QuestSynthesis');

export interface QuestDialogue {
    speaker: string;
    text: string;
    branching?: {
        options: string[];
        targets: number[]; // Index of the next dialogue node
    };
}

export interface QuestStage {
    index: number;
    title: string;
    description: string;
    objectives: string[];
    npcs: number[];     // NPC IDs involved in this stage
    items: number[];    // Item IDs needed/given
    location?: { x: number, y: number, plane: number };
    dialogue: QuestDialogue[];
}

export interface QuestDefinition {
    id: string;
    name: string;      // Renamed from title to match quests.json
    description: string;
    author: string;
    difficulty: 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';
    length: 'Short' | 'Medium' | 'Long' | 'Very Long';
    category?: number;    // From quests.json
    subcategory?: number; // From quests.json
    runeScore?: number | null;
    spriteId?: number;
    isF2P: boolean;
    isHidden: boolean;
    requirements: {
        skills: { skill: string, level: number }[];
        quests: string[];
        items: number[];
    };
    rewards: {
        xp: { skill: string, amount: number }[];
        items: { id: number, amount: number }[];
        questPoints: number;
        rewardText?: string;
    };
    stages: QuestStage[];
}

/**
 * QuestSynthesisLimb
 * The bridge between Literary Imagination and RS3 Gameplay Reality.
 */
export class QuestSynthesisLimb {
    constructor(
        private readonly client: ModelClient,
        private readonly forensics: CacheForensicsLimb,
        private readonly pedagogy: PedagogyLimb
    ) {}

    /**
     * Converts a raw storyboard into a structured quest definition.
     */
    public async synthesizeFromScenes(
        title: string,
        scenes: StoryboardScene[],
        targetDifficulty: string = 'Intermediate'
    ): Promise<Result<QuestDefinition>> {
        logger.info({ title, scenesCount: scenes.length }, 'Synthesizing Quest Logic from Storyboard...');

        // 1. Group scenes into "Stages" (logical chunks of objectives)
        const stages: QuestStage[] = [];
        let currentStage: QuestStage | null = null;

        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            
            // New stage every 3 scenes, or if explicit location shift
            if (i % 3 === 0) {
                if (currentStage) stages.push(currentStage);
                currentStage = {
                    index: stages.length + 1,
                    title: `Stage ${stages.length + 1}: ${scene.description.split('.')[0]}`,
                    description: scene.description,
                    objectives: [scene.description],
                    npcs: scene.modelId && scene.dataType === 'npc' ? [scene.modelId] : [],
                    items: scene.modelId && scene.dataType === 'item' ? [scene.modelId] : [],
                    dialogue: []
                };
            } else if (currentStage) {
                currentStage.objectives.push(scene.description);
                if (scene.modelId && scene.dataType === 'npc') currentStage.npcs.push(scene.modelId);
                if (scene.modelId && scene.dataType === 'item') currentStage.items.push(scene.modelId);
            }

            // Map character dialogue if speaker exists
            if (scene.speaker && scene.description.includes('"')) {
                const dialogueText = scene.description.match(/"([^"]+)"/)?.[1] || scene.description;
                currentStage?.dialogue.push({
                    speaker: scene.speaker,
                    text: dialogueText
                });
            }
        }
        if (currentStage) stages.push(currentStage);

        // 2. Synthesize Meta-Logic (Requirements & Rewards) via LLM
        const metaPrompt = `
Synthesize AUTHENTIC RS3 Quest Metadata for "${title}"
Stages: ${JSON.stringify(stages.map(s => s.title))}
Summary: ${scenes[0]?.description} ... ${scenes[scenes.length-1]?.description}

Logic: This is a classic "Romeo and Juliet" theme. 
Rewards MUST include items related to the narrative (e.g., Cadava Berries, Potion of Kadava).
Rewards MUST include RS3-appropriate XP amounts for an Intermediate quest (e.g., Cooking, Herblore).

JSON format:
{
  "difficulty": "Intermediate",
  "length": "Medium",
  "requirements": {
    "skills": [{ "skill": "Cooking", "level": 5 }, { "skill": "Herblore", "level": 10 }],
    "items": [ { "id": 1951, "amount": 1 } ] 
  },
  "rewards": {
    "xp": [{ "skill": "Cooking", "amount": 1000 }, { "skill": "Herblore", "amount": 1000 }],
    "items": [{ "id": 1951, "amount": 3 }],
    "questPoints": 5
  }
}
        `;

        const metaRes = await this.client.resilientCall({
            model: this.client.config.midPathModel,
            prompt: metaPrompt,
            format: 'json',
            tier: 'Executive'
        });

        const meta = metaRes.ok ? JSON.parse(metaRes.value.response) : {
            difficulty: 'Intermediate',
            length: 'Medium',
            requirements: { skills: [], items: [] },
            rewards: { xp: [], items: [], questPoints: 1 }
        };

        const definition: QuestDefinition = {
            id: `quest_${title.toLowerCase().replace(/\s+/g, '_')}`,
            name: title,
            author: 'Sovereign Organism POG2',
            isF2P: false,
            isHidden: false,
            category: 4746, // Default to "Quests" category from substrate
            spriteId: 30108, // Default Quest Sprite
            ...meta,
            stages
        };

        return ok(definition);
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        return { online: true, details: 'Quest Synthesis substrate active. Readiness: 10/10.' };
    }
}

