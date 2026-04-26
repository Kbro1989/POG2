import { createLogger } from '../../utils/logger.js';
import { GameState, SovereignAvatar, Coord } from '../../core/models.js';
import { DiscoveryLimb } from '../spatial/DiscoveryLimb.js';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('ObjectiveLimb');

export interface SovereignObjective {
    id: string;
    type: 'SKILL' | 'QUEST' | 'DISCOVERY' | 'ACHIEVEMENT';
    name: string;
    description: string;
    priority: number; // 0 (Highest) to 100 (Lowest)
    targetCoord?: Coord;
    isCompleted: boolean;
}

/**
 * ObjectiveLimb - The "Task Master" of POG2.
 * 
 * Manages the high-level goals for discovery and completion.
 */
export class ObjectiveLimb {
    private static instance: ObjectiveLimb;
    private objectives: SovereignObjective[] = [];
    private discovery: DiscoveryLimb = new DiscoveryLimb();

    private constructor() {
        this.initializeObjectives();
    }

    public static getInstance(): ObjectiveLimb {
        if (!ObjectiveLimb.instance) {
            ObjectiveLimb.instance = new ObjectiveLimb();
        }
        return ObjectiveLimb.instance;
    }

    private initializeObjectives() {
        // 1. Basic Skill Milestones
        const skills = ['Attack', 'Strength', 'Defense', 'Ranged', 'Prayer', 'Magic'];
        skills.forEach(skill => {
            this.objectives.push({
                id: `skill_${skill.toLowerCase()}_5`,
                type: 'SKILL',
                name: `Initiate ${skill}`,
                description: `Reach Level 5 in ${skill}.`,
                priority: 20,
                isCompleted: false
            });
        });

        // 2. Discovery Milestones (Landmarks)
        const landmarks = [
            { name: 'Lumbridge Castle', x: 3221, y: 3218 },
            { name: 'Draynor Manor', x: 3108, y: 3352 },
            { name: 'Falador Square', x: 2964, y: 3378 },
            { name: 'Varrock Center', x: 3212, y: 3422 },
            { name: 'Edgeville Bank', x: 3093, y: 3491 }
        ];

        landmarks.forEach(l => {
            this.objectives.push({
                id: `discovery_${l.name.toLowerCase().replace(/\s+/g, '_')}`,
                type: 'DISCOVERY',
                name: `Discover ${l.name}`,
                description: `Visit the heart of ${l.name}.`,
                priority: 10,
                targetCoord: { x: l.x, y: l.y, plane: 0 },
                isCompleted: false
            });
        });

        // 3. Quest Entry (Authentic)
        this.objectives.push({
            id: 'quest_cooks_assistant',
            type: 'QUEST',
            name: "Cook's Assistant",
            description: "Help the Lumbridge cook find ingredients.",
            priority: 5,
            targetCoord: { x: 3206, y: 3214, plane: 0 },
            isCompleted: false
        });
    }

    /**
     * getActiveObjectives - Returns uncompleted objectives sorted by priority.
     */
    public getActiveObjectives(avatar: SovereignAvatar): SovereignObjective[] {
        // Filter out completed objectives
        this.syncState(avatar);
        return this.objectives
            .filter(o => !o.isCompleted)
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * syncState - Updates completion status based on avatar state.
     */
    private syncState(avatar: SovereignAvatar) {
        this.objectives.forEach(o => {
            if (o.isCompleted) return;

            if (o.type === 'SKILL') {
                const skillName = o.name.split(' ')[1];
                // Resolve skill ID (simplified mapping)
                const skillMap: Record<string, number> = { 'Attack': 1, 'Strength': 2, 'Defense': 5, 'Ranged': 3, 'Prayer': 7, 'Magic': 4 };
                const id = skillMap[skillName!];
                if (id && avatar.skills[id] && avatar.skills[id].level >= 5) {
                    this.completeObjective(o.id);
                }
            }

            if (o.type === 'DISCOVERY' && o.targetCoord) {
                const dist = Math.abs(avatar.x - o.targetCoord.x) + Math.abs(avatar.y - o.targetCoord.y);
                if (dist < 10) {
                    this.completeObjective(o.id);
                }
            }
            
            if (o.type === 'QUEST') {
                if (avatar.quests && avatar.quests.quests && (avatar.quests.quests as any)[o.id] === 'COMPLETED') {
                    this.completeObjective(o.id);
                }
            }
        });
    }

    private completeObjective(id: string) {
        const obj = this.objectives.find(o => o.id === id);
        if (obj) {
            obj.isCompleted = true;
            logger.info({ objective: obj.name }, '🌟 Objective Completed!');
            // Trigger achievement reward if applicable
        }
    }

    /**
     * selectBestObjective - Returns the highest priority reachable objective.
     */
    public selectBestObjective(avatar: SovereignAvatar): SovereignObjective | null {
        const active = this.getActiveObjectives(avatar);
        if (active.length === 0) return null;

        // For now, just return the highest priority (lowest number)
        return active[0]!;
    }
}
