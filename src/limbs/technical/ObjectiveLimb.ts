import { createLogger } from '../../utils/logger.js';
import { SovereignAvatar, Coord } from '../../core/models.js'; // Removed GameState as it was unused
import { DiscoveryLimb } from '../spatial/DiscoveryLimb.js';
// Removed unused imports: fs and path

const logger = createLogger('ObjectiveLimb');

export interface SovereignObjective {
    readonly id: string;
    readonly type: 'SKILL' | 'QUEST' | 'DISCOVERY' | 'ACHIEVEMENT';
    readonly name: string;
    readonly description: string;
    readonly priority: number; // 0 (Highest) to 100 (Lowest)
    readonly targetCoord?: Coord;
    isCompleted: boolean; // This property is mutable and updated
}

/**
 * ObjectiveLimb - The "Task Master" of POG2.
 *
 * Manages the high-level goals for discovery and completion.
 */
export class ObjectiveLimb {
    private static instance: ObjectiveLimb;
    private readonly objectives: SovereignObjective[] = [];
    // DiscoveryLimb is instantiated but not currently used within this file.
    // It is kept as per the rule "Maintain all existing functionality".
    private readonly discovery: DiscoveryLimb = new DiscoveryLimb();

    private constructor() {
        this.initializeObjectives();
    }

    public static getInstance(): ObjectiveLimb {
        if (!ObjectiveLimb.instance) {
            ObjectiveLimb.instance = new ObjectiveLimb();
        }
        return ObjectiveLimb.instance;
    }

    private initializeObjectives(): void {
        // 1. Basic Skill Milestones
        const skills: string[] = ['Attack', 'Strength', 'Defense', 'Ranged', 'Prayer', 'Magic'];
        skills.forEach((skill: string) => {
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
        interface Landmark {
            name: string;
            x: number;
            y: number;
        }
        const landmarks: Landmark[] = [
            { name: 'Lumbridge Castle', x: 3221, y: 3218 },
            { name: 'Draynor Manor', x: 3108, y: 3352 },
            { name: 'Falador Square', x: 2964, y: 3378 },
            { name: 'Varrock Center', x: 3212, y: 3422 },
            { name: 'Edgeville Bank', x: 3093, y: 3491 }
        ];

        landmarks.forEach((l: Landmark) => {
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
     * @param avatar The current state of the SovereignAvatar.
     * @returns An array of uncompleted SovereignObjective objects, sorted by priority.
     */
    public getActiveObjectives(avatar: SovereignAvatar): SovereignObjective[] {
        // Filter out completed objectives
        this.syncState(avatar);
        return this.objectives
            .filter((o: SovereignObjective) => !o.isCompleted)
            .sort((a: SovereignObjective, b: SovereignObjective) => a.priority - b.priority);
    }

    /**
     * syncState - Updates completion status based on avatar state.
     * @param avatar The current state of the SovereignAvatar.
     *
     * ASSUMPTIONS about SovereignAvatar structure (since models.js is not editable):
     * - avatar.x: number, avatar.y: number (for current position)
     * - avatar.skills: Array of objects, where each object has a 'level' property (e.g., { level: number, xp: number }).
     *   The index of the array corresponds to the skill ID from skillMap.
     * - avatar.quests: Optional object with a 'quests' property, which is a Record<string, string>
     *   mapping quest IDs to their status (e.g., { quests: { 'quest_cooks_assistant': 'COMPLETED' } }).
     */
    private syncState(avatar: SovereignAvatar): void {
        this.objectives.forEach((o: SovereignObjective) => {
            if (o.isCompleted) {
                return;
            }

            if (o.type === 'SKILL') {
                const parts = o.name.split(' ');
                // Ensure skillName is extracted safely
                const skillName = parts.length > 1 ? parts[1] : undefined;

                if (skillName) {
                    // Resolve skill ID (simplified mapping)
                    const skillMap: Record<string, number> = { 'Attack': 1, 'Strength': 2, 'Defense': 5, 'Ranged': 3, 'Prayer': 7, 'Magic': 4 };
                    const id = skillMap[skillName];

                    // Check if id is a valid key for avatar.skills object and if the skill object exists
                    if (typeof id === 'number' && avatar.skills && avatar.skills[id]) {
                        const skill = avatar.skills[id];
                        // Ensure skill object exists and has a level property
                        if (skill && typeof skill.level === 'number' && skill.level >= 5) {
                            this.completeObjective(o.id);
                        }
                    }
                }
            }

            if (o.type === 'DISCOVERY' && o.targetCoord) {
                const dist = Math.abs(avatar.x - o.targetCoord.x) + Math.abs(avatar.y - o.targetCoord.y);
                if (dist < 10) {
                    this.completeObjective(o.id);
                }
            }

            if (o.type === 'QUEST') {
                // Safely access avatar.quests.quests and check for completion status
                // Assuming avatar.quests.quests is Record<number, any> or Record<string, string>
                if (avatar.quests?.quests && typeof avatar.quests.quests === 'object' && (avatar.quests.quests as any)[o.id] === 'COMPLETED') {
                    this.completeObjective(o.id);
                }
            }
        });
    }

    private completeObjective(id: string): void {
        const obj = this.objectives.find((o: SovereignObjective) => o.id === id);
        if (obj) {
            obj.isCompleted = true;
            logger.info({ objective: obj.name }, '🌟 Objective Completed!');
            // Trigger achievement reward if applicable
        }
    }

    /**
     * selectBestObjective - Returns the highest priority reachable objective.
     * @param avatar The current state of the SovereignAvatar.
     * @returns The highest priority uncompleted SovereignObjective, or null if none are active.
     */
    public selectBestObjective(avatar: SovereignAvatar): SovereignObjective | null {
        const active: SovereignObjective[] = this.getActiveObjectives(avatar);
        if (active.length === 0) {
            return null;
        }

        // For now, just return the highest priority (lowest number)
        // active[0] is guaranteed to exist here due to the length check above.
        return active[0];
    }
}