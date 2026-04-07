import { createLogger } from '../../utils/logger.js';
import type { Result } from '../../core/models.js';
import { ok, err } from '../../core/models.js';

const logger = createLogger('HiScoreLimb');

export interface SkillStats {
    level: number;
    xp: number;
    rank?: number;
}

export interface StatsSnapshot {
    name: string;
    combatlevel: number;
    totalskill: number;
    totalxp: number;
    quests: {
        complete: number,
        started: number,
        notStarted: number
    };
    skills: Record<string, SkillStats>;
    timestamp: number;
}

const SKILL_ID_MAP: Record<number, string> = {
    0: "attack", 1: "defence", 2: "strength", 3: "constitution", 4: "ranged", 5: "prayer", 6: "magic", 7: "cooking",
    8: "woodcutting", 9: "fletching", 10: "fishing", 11: "firemaking", 12: "crafting", 13: "smithing", 14: "mining",
    15: "herblore", 16: "agility", 17: "thieving", 18: "slayer", 19: "farming", 20: "runecrafting", 21: "hunter",
    22: "construction", 23: "summoning", 24: "dungeoneering", 25: "divination", 26: "invention", 27: "archaeology", 28: "necromancy"
};

/**
 * HiScoreLimb - Interfaces with RuneMetrics API to retrieve player stats.
 * Used as a more resilient alternative to legacy HiScore CSVs.
 */
export class HiScoreLimb {
    private baseUrl = 'https://apps.runescape.com/runemetrics/profile/profile?activities=0&user=';

    constructor() {}

    /**
     * fetchStats - Pulls real-time stats for a given player name.
     */
    public async fetchStats(name: string): Promise<Result<StatsSnapshot>> {
        logger.info({ name }, 'Fetching player RuneMetrics profile...');
        try {
            const url = `${this.baseUrl}${encodeURIComponent(name)}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                return err(new Error(`RUNEMETRICS_FETCH_FAILED: ${response.status} ${response.statusText}`));
            }

            const data = await response.json();

            if (data.error) {
                return err(new Error(`RUNEMETRICS_PROFILE_PRIVATE: ${data.error}`));
            }

            const snapshot = this.parseRuneMetrics(data);
            
            logger.info({ name: snapshot.name }, 'RuneMetrics snapshot captured.');
            return ok(snapshot);
        } catch (error: any) {
            logger.error({ name, error }, 'Failed to fetch player profile.');
            return err(new Error(`RUNEMETRICS_NETWORK_ERROR: ${error.message}`));
        }
    }

    /**
     * parseRuneMetrics - Converts RuneMetrics JSON to a structured object.
     */
    private parseRuneMetrics(data: any): StatsSnapshot {
        const skills: Record<string, SkillStats> = {};

        if (data.skillvalues) {
            data.skillvalues.forEach((sv: any) => {
                const name = SKILL_ID_MAP[sv.id] || `unknown_${sv.id}`;
                skills[name] = {
                    level: sv.level,
                    xp: Math.floor(sv.xp / 10), // RuneMetrics XP is scaled by 10
                    rank: sv.rank
                };
            });
        }

        return {
            name: data.name,
            combatlevel: data.combatlevel,
            totalskill: data.totalskill,
            totalxp: data.totalxp,
            quests: {
                complete: data.questscomplete,
                started: data.questsstarted,
                notStarted: data.questsnotstarted
            },
            skills,
            timestamp: Date.now()
        };
    }
}
