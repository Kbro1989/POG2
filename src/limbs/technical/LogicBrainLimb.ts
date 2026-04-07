import { createLogger } from '../../utils/logger.js';
import { type Result, ok, err } from '../../core/models.js';
import fs from 'fs';
import path from 'path';

const logger = createLogger('LogicBrainLimb');

const PEDAGOGY_LOGIC_DIR = 'D:\\sovereign\\memory\\pedagogy\\logic';

/**
 * LogicBrainLimb - The "Higher Logic" substrate of the Sovereign Organism.
 * Synthesizes manifests (Quest, Skill, Achievement) into a unified decision cortex.
 */
export class LogicBrainLimb {
    private static instance: LogicBrainLimb | undefined;
    private manifests: Record<string, any> = {};

    public static getInstance(): LogicBrainLimb {
        if (!this.instance) {
            this.instance = new LogicBrainLimb();
        }
        return this.instance;
    }

    private constructor() {
        this.loadManifests();
    }

    private loadManifests() {
        const files = [
            'achievement_manifest.json',
            'equipment_requirements.json',
            'necromancy_logic.json',
            'quest_manifest.json',
            'skill_manifest.json',
            'training_strategies.json'
        ];

        files.forEach(file => {
            const fullPath = path.join(PEDAGOGY_LOGIC_DIR, file);
            if (fs.existsSync(fullPath)) {
                try {
                    const name = file.replace('.json', '');
                    this.manifests[name] = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    logger.info({ name }, 'Logic manifest ingested.');
                } catch (e) {
                    logger.error({ file, e }, 'Failed to parse logic manifest.');
                }
            } else {
                logger.warn({ file }, 'Logic manifest missing from pedagogy.');
            }
        });
    }

    /**
     * getSkillRequirement - Resolves the XP and milestone for a given level.
     */
    public getSkillRequirement(skill: string, level: number): any {
        const skillManifest = this.manifests['skill_manifest'];
        if (!skillManifest) return null;

        const xp = skillManifest.xp_table[level.toString()] || null;
        const category = Object.keys(skillManifest.categories).find(cat => 
            skillManifest.categories[cat].includes(skill)
        );

        return { xp, category, cap: skillManifest.caps[level.toString()]?.includes(skill) };
    }

    /**
     * getQuestStatus - Resolves human-readable labels for quest states.
     */
    public getQuestStatus(state: string): any {
        const questManifest = this.manifests['quest_manifest'];
        return questManifest?.states[state] || null;
    }

    /**
     * getTrainingStrategy - Retrieves the AI behavioral strategy for a domain.
     */
    public getTrainingStrategy(domain: string): any {
        const strategies = this.manifests['training_strategies'];
        return strategies?.strategies[domain] || null;
    }

    public async healthCheck(): Promise<{ online: boolean; maps: string[] }> {
        return {
            online: Object.keys(this.manifests).length > 0,
            maps: Object.keys(this.manifests)
        };
    }
}
