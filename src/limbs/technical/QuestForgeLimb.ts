import { HEXAGRAM_REGISTRY } from '../../core/HexagramDefinitions.js';
import { Result, ok, err } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { CacheForensicsLimb } from '../spatial/CacheForensicsLimb.js';
import { PedagogyLimb } from './PedagogyLimb.js';
import { StoryboardScene } from '../creative/StoryboardLimbV2.js';
import { QuestDefinition, QuestStage, QuestDialogue } from './QuestSynthesisLimb.js';
import { createLogger } from "../../utils/logger.js";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getSovereignRoot, getPipelineRootPath } from '../../utils/SovereignPathResolver.js';

const logger = createLogger('QuestForge');

// ═══════════════════════════════════════════════════════════════
// Grounding Interfaces — NXT-matched quality from cache substrate
// ═══════════════════════════════════════════════════════════════

export interface GroundedNPC {
    id: number;
    name: string;
    role: string;            // quest_giver, ally, antagonist, shopkeeper, guard
    modelRef?: number;       // Reference NPC ID from npcs.json for mesh/bone reuse
    spawnCoord: { x: number, y: number, plane: number };
    actions: string[];       // Talk-to, Attack, Pickpocket, etc.
    combatLevel?: number;
    dialogue?: QuestDialogue[];
}

export interface GroundedItem {
    id: number;
    name: string;
    examineText: string;
    modelRef?: number;       // Reference item ID from items.json for mesh reuse
    stackable: boolean;
    tradeable: boolean;
    questItem: boolean;
    equipSlot?: string;
}

export interface GroundedObject {
    id: number;
    name: string;
    type: 'scenery' | 'door' | 'gate' | 'ladder' | 'chest' | 'altar' | 'tree' | 'rock' | 'furnace';
    modelRef?: number;       // Reference object ID from objects.json
    coord: { x: number, y: number, plane: number };
    actions: string[];
    blocksMovement: boolean;
}

export interface SandboxRegion {
    mapsquareX: number;
    mapsquareZ: number;
    worldBounds: { xMin: number, xMax: number, zMin: number, zMax: number };
    collisionMatrix: Record<string, number>;  // "plane_x_y" -> bitmask
    npcs: GroundedNPC[];
    objects: GroundedObject[];
    heightmap: number[];     // 64x64 flat terrain heights
}

export interface VarbitAllocation {
    varbitId: number;
    name: string;
    purpose: string;         // quest_progress, stage_flag, item_obtained, etc.
    range: { min: number, max: number };
}

export interface QuestPackage {
    quest: QuestDefinition;
    sandbox: SandboxRegion;
    items: GroundedItem[];
    varbits: VarbitAllocation[];
    stateMachine: { fromStage: number, toStage: number, trigger: string, varbitValue: number }[];
    exportPath: string;
}

// ═══════════════════════════════════════════════════════════════
// Data Loaders — Authoritative cache pedagogy ingestion
// ═══════════════════════════════════════════════════════════════

interface CacheNPC { id: number; name: string; [key: string]: any; }
interface CacheItem { id: number; name: string; [key: string]: any; }
interface CacheObject { id: number; name: string; [key: string]: any; }
interface CacheQuest { id: number; name: string; category: number; skillRequirements: any[]; progressStates: any[]; [key: string]: any; }
interface MapZone { internal_name: string; name: string; bounds: any[]; [key: string]: any; }

class SubstrateLoader {
    private static cache: Map<string, any> = new Map();

    static load<T>(path: string): T | null {
        if (this.cache.has(path)) return this.cache.get(path) as T;
        if (!existsSync(path)) { logger.warn({ path }, 'Substrate file not found'); return null; }
        try {
            const data = JSON.parse(readFileSync(path, 'utf8'));
            this.cache.set(path, data);
            return data as T;
        } catch (e) {
            logger.error({ path, err: e }, 'Failed to load substrate');
            return null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// QuestForgeLimb — Production-Ready Quest Synthesis Engine
// ═══════════════════════════════════════════════════════════════

export class QuestForgeLimb {
    private readonly dumpPath: string;
    private readonly pedagogyPath: string;

    constructor(
        private readonly client: ModelClient,
        private readonly forensics: CacheForensicsLimb,
        private readonly pedagogy: PedagogyLimb
    ) {
        this.dumpPath = join(getSovereignRoot(), 'cache_pedagogy', 'json_dumps');
        this.pedagogyPath = join(getSovereignRoot(), 'memory', 'pedagogy');
    }

    // ─── Authoritative Data Access ───

    private loadNPCs(): CacheNPC[] {
        return SubstrateLoader.load<CacheNPC[]>(join(this.dumpPath, 'npcs.json')) || [];
    }

    private loadItems(): CacheItem[] {
        const raw = SubstrateLoader.load<any>(join(this.dumpPath, 'items.json'));
        return Array.isArray(raw) ? raw : [];
    }

    private loadObjects(): CacheObject[] {
        const raw = SubstrateLoader.load<any>(join(this.dumpPath, 'objects.json'));
        return Array.isArray(raw) ? raw : [];
    }

    private loadQuests(): { quests: CacheQuest[] } {
        return SubstrateLoader.load<any>(join(this.dumpPath, 'quests.json')) || { quests: [] };
    }

    private loadMapZones(): Record<string, MapZone> {
        return SubstrateLoader.load<any>(join(this.pedagogyPath, 'mapzones_registry.json')) || {};
    }

    private loadVarbits(): any {
        return SubstrateLoader.load<any>(join(this.pedagogyPath, 'varbits_registry.json')) || {};
    }

    // ─── Sandbox Allocation ───
    // Finds an unused mapsquare outside all known populated mapzones

    private allocateSandbox(): SandboxRegion {
        const zones = this.loadMapZones();
        const usedSquares = new Set<string>();

        // Collect all occupied mapsquares from mapzone bounds
        for (const zone of Object.values(zones)) {
            if (!zone.bounds) continue;
            for (const bound of zone.bounds) {
                const src = bound.src || bound;
                if (!src.xstart) continue;
                const msXStart = Math.floor(src.xstart / 64);
                const msXEnd = Math.floor(src.xend / 64);
                const msZStart = Math.floor(src.zstart / 64);
                const msZEnd = Math.floor(src.zend / 64);
                for (let mx = msXStart; mx <= msXEnd; mx++) {
                    for (let mz = msZStart; mz <= msZEnd; mz++) {
                        usedSquares.add(`${mx}_${mz}`);
                    }
                }
            }
        }

        // Search for an empty mapsquare in the "sandbox range" (high coordinates)
        // RS3 world is roughly 0-100 on each axis, instances are typically 150+
        let targetX = 90, targetZ = 90;
        for (let x = 90; x < 200; x++) {
            for (let z = 90; z < 200; z++) {
                if (!usedSquares.has(`${x}_${z}`)) {
                    targetX = x; targetZ = z;
                    break;
                }
            }
            if (targetX !== 90 || targetZ !== 90) break;
        }

        logger.info({ mapsquare: `${targetX}_${targetZ}` }, 'Allocated sandbox mapsquare');

        // Generate flat walkable terrain with border walls
        const collision: Record<string, number> = {};
        const heightmap: number[] = new Array(64 * 64).fill(0);

        for (let lx = 0; lx < 64; lx++) {
            for (let lz = 0; lz < 64; lz++) {
                const wx = targetX * 64 + lx;
                const wz = targetZ * 64 + lz;
                // Border walls (2-tile thick perimeter)
                const isBorder = lx < 2 || lx > 61 || lz < 2 || lz > 61;
                collision[`0_${wx}_${wz}`] = isBorder ? 1 : 0;
            }
        }

        return {
            mapsquareX: targetX,
            mapsquareZ: targetZ,
            worldBounds: {
                xMin: targetX * 64, xMax: targetX * 64 + 63,
                zMin: targetZ * 64, zMax: targetZ * 64 + 63
            },
            collisionMatrix: collision,
            npcs: [],
            objects: [],
            heightmap
        };
    }

    // ─── NPC Grounding ───
    // Selects real NPC meshes/bones from the cache to reuse for quest characters

    private groundNPCForRole(role: string, name: string, coord: { x: number, y: number, plane: number }): GroundedNPC {
        const allNPCs = this.loadNPCs();

        // Strategy: Find NPCs with matching role keywords for mesh reuse
        const roleKeywords: Record<string, string[]> = {
            quest_giver: ['Advisor', 'Elder', 'Sage', 'Wizard', 'Scholar', 'Priest'],
            ally: ['Guard', 'Knight', 'Soldier', 'Warrior', 'Companion'],
            antagonist: ['Dark', 'Shadow', 'Bandit', 'Demon', 'Boss'],
            shopkeeper: ['Shopkeeper', 'Merchant', 'Trader', 'Vendor'],
            guard: ['Guard', 'Sentry', 'Watchman', 'Patroller']
        };

        const keywords = roleKeywords[role] || roleKeywords.quest_giver!;
        const match = allNPCs.find(n => keywords.some(k => n.name.includes(k)));
        const modelRef = match?.id || 0; // Hans fallback

        return {
            id: 50000 + Math.floor(Math.random() * 10000), // Synthetic ID range
            name,
            role,
            modelRef,
            spawnCoord: coord,
            actions: role === 'antagonist' ? ['Attack', 'Examine'] : ['Talk-to', 'Examine'],
            combatLevel: role === 'antagonist' ? 80 : undefined
        };
    }

    // ─── Item Grounding ───

    private groundItem(name: string, isQuestItem: boolean): GroundedItem {
        const allItems = this.loadItems();
        // Find a real item with similar name for mesh reference
        const words = name.toLowerCase().split(' ');
        const match = allItems.find(i => words.some(w => i.name.toLowerCase().includes(w)));

        return {
            id: 60000 + Math.floor(Math.random() * 10000),
            name,
            examineText: `A ${name.toLowerCase()} needed for the quest.`,
            modelRef: match?.id,
            stackable: false,
            tradeable: !isQuestItem,
            questItem: isQuestItem
        };
    }

    // ─── Varbit Allocation ───

    private allocateVarbits(stageCount: number): VarbitAllocation[] {
        // Allocate from high unused varbit range (50000+)
        const baseVarbit = 50000 + Math.floor(Math.random() * 5000);
        const allocations: VarbitAllocation[] = [
            { varbitId: baseVarbit, name: 'quest_progress', purpose: 'Main quest stage tracker', range: { min: 0, max: stageCount } }
        ];

        for (let i = 1; i <= stageCount; i++) {
            allocations.push({
                varbitId: baseVarbit + i,
                name: `stage_${i}_complete`,
                purpose: `Stage ${i} completion flag`,
                range: { min: 0, max: 1 }
            });
        }

        return allocations;
    }

    // ─── Quest Difficulty Calibration ───
    // Uses existing quests as reference for balanced requirements/rewards

    private calibrateFromExisting(difficulty: string): { skills: any[], xpRewards: any[], questPoints: number } {
        const { quests } = this.loadQuests();
        const similar = quests.filter(q =>
            q.skillRequirements && q.skillRequirements.length > 0 &&
            q.progressStates && q.progressStates.length >= 2
        );

        if (similar.length === 0) {
            return { skills: [], xpRewards: [{ skill: 'Constitution', amount: 1000 }], questPoints: 1 };
        }

        // Average skill levels from similar-difficulty quests
        const avgLevel = Math.round(
            similar.flatMap(q => q.skillRequirements.map((s: any) => s.level))
                .reduce((a: number, b: number) => a + b, 0) / Math.max(1, similar.flatMap(q => q.skillRequirements).length)
        );

        const difficultyScale: Record<string, number> = {
            'Novice': 0.3, 'Intermediate': 0.6, 'Experienced': 0.8, 'Master': 1.0, 'Grandmaster': 1.2
        };
        const scale = difficultyScale[difficulty] || 0.6;
        const scaledLevel = Math.round(avgLevel * scale);
        const xpAmount = Math.round(1000 * scale * scale);

        return {
            skills: [{ skill: 'Attack', skillId: 0, level: scaledLevel }],
            xpRewards: [{ skill: 'Attack', amount: xpAmount }],
            questPoints: Math.max(1, Math.round(5 * scale))
        };
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN FORGE METHOD — Synthesize complete quest package
    // ═══════════════════════════════════════════════════════════

    public async forgeQuest(
        title: string,
        scenes: StoryboardScene[],
        difficulty: string = 'Intermediate'
    ): Promise<Result<QuestPackage>> {
        logger.info({ title, scenes: scenes.length, difficulty }, '⚒️ FORGING production quest package...');

        // 1. Allocate spatial sandbox
        const sandbox = this.allocateSandbox();
        const center = {
            x: sandbox.worldBounds.xMin + 32,
            y: sandbox.worldBounds.zMin + 32,
            plane: 0
        };

        // 2. Build quest stages from scenes with spatial grounding
        const stages: QuestStage[] = [];
        const questItems: GroundedItem[] = [];
        const stageOffset = 0;

        for (let i = 0; i < scenes.length; i += 3) {
            const batch = scenes.slice(i, i + 3);
            const stageIndex = stages.length + 1;

            // Place stage NPCs in a ring around center
            const angle = (stageIndex / Math.ceil(scenes.length / 3)) * 2 * Math.PI;
            const radius = 10 + stageIndex * 3;
            const stageCoord = {
                x: Math.round(center.x + Math.cos(angle) * radius),
                y: Math.round(center.y + Math.sin(angle) * radius),
                plane: 0
            };

            // Ground an NPC for this stage
            const npcRole = stageIndex === 1 ? 'quest_giver' : (stageIndex === stages.length ? 'antagonist' : 'ally');
            const npcName = batch[0]?.speaker || `${title} NPC ${stageIndex}`;
            const npc = this.groundNPCForRole(npcRole, npcName, stageCoord);

            // Build dialogue from scene text
            const dialogue: QuestDialogue[] = batch
                .filter(s => s.description)
                .map(s => ({
                    speaker: s.speaker || npcName,
                    text: s.description.slice(0, 200)
                }));
            npc.dialogue = dialogue;

            sandbox.npcs.push(npc);

            // Ground any items mentioned
            const itemNames = batch.filter(s => s.dataType === 'item' && s.modelId).map(s => s.description.split('.')[0]);
            const stageItems = itemNames.map(n => this.groundItem(n, true));
            questItems.push(...stageItems);

            // Open the collision around the NPC spawn point
            for (let dx = -2; dx <= 2; dx++) {
                for (let dz = -2; dz <= 2; dz++) {
                    sandbox.collisionMatrix[`0_${stageCoord.x + dx}_${stageCoord.y + dz}`] = 0;
                }
            }

            stages.push({
                index: stageIndex,
                title: `Stage ${stageIndex}: ${batch[0]?.description.split('.')[0] || 'Continue'}`,
                description: batch.map(s => s.description).join(' '),
                objectives: batch.map(s => s.description.slice(0, 100)),
                npcs: [npc.id],
                items: stageItems.map(i => i.id),
                location: stageCoord,
                dialogue
            });
        }

        // 3. Place environmental objects (entrance, exit, scenery)
        const entranceObj: GroundedObject = {
            id: 70000 + Math.floor(Math.random() * 5000),
            name: 'Quest Portal',
            type: 'scenery',
            modelRef: 10000, // Generic portal reference
            coord: { x: sandbox.worldBounds.xMin + 5, y: sandbox.worldBounds.zMin + 32, plane: 0 },
            actions: ['Enter', 'Examine'],
            blocksMovement: false
        };
        sandbox.objects.push(entranceObj);

        // 4. Calibrate difficulty from existing quest data
        const calibration = this.calibrateFromExisting(difficulty);

        // 5. Allocate varbits for quest state machine
        const varbits = this.allocateVarbits(stages.length);

        // 6. Build state machine transitions
        const stateMachine = stages.map((stage, i) => ({
            fromStage: i,
            toStage: i + 1,
            trigger: `complete_stage_${stage.index}`,
            varbitValue: i + 1
        }));

        // 7. Assemble the QuestDefinition (matching quests.json schema)
        const quest: QuestDefinition = {
            id: `quest_forge_${title.toLowerCase().replace(/\s+/g, '_')}`,
            name: title,
            description: scenes[0]?.description.slice(0, 200) || title,
            author: 'Sovereign Organism POG2 — QuestForge',
            difficulty: difficulty as any,
            length: scenes.length > 15 ? 'Long' : scenes.length > 8 ? 'Medium' : 'Short',
            category: 4746,   // Quests category from substrate
            subcategory: 4748,
            runeScore: calibration.questPoints * 2,
            spriteId: 30108,
            isF2P: false,
            isHidden: false,
            requirements: {
                skills: calibration.skills,
                quests: [],
                items: questItems.filter(i => i.questItem).map(i => i.id)
            },
            rewards: {
                xp: calibration.xpRewards,
                items: questItems.filter(i => !i.questItem).map(i => ({ id: i.id, amount: 1 })),
                questPoints: calibration.questPoints,
                rewardText: `Congratulations! You have completed ${title}.`
            },
            stages
        };

        // 8. Export the full package
        const exportPath = join(getPipelineRootPath(), 'quest-forge', title.replace(/\s+/g, '_').toLowerCase());
        if (!existsSync(exportPath)) mkdirSync(exportPath, { recursive: true });

        const pkg: QuestPackage = { quest, sandbox, items: questItems, varbits, stateMachine, exportPath };

        // Write all artifacts
        const dirs = ['spatial', 'entities', 'logic', 'rewards'];
        for (const d of dirs) {
            const dp = join(exportPath, d);
            if (!existsSync(dp)) mkdirSync(dp, { recursive: true });
        }

        writeFileSync(join(exportPath, 'quest_definition.json'), JSON.stringify(quest, null, 2));
        writeFileSync(join(exportPath, 'spatial', 'sandbox_collision.json'), JSON.stringify({
            mapsquare: `${sandbox.mapsquareX}_${sandbox.mapsquareZ}`,
            bounds: sandbox.worldBounds,
            collision_matrix: sandbox.collisionMatrix,
            heightmap: sandbox.heightmap
        }, null, 2));
        writeFileSync(join(exportPath, 'spatial', 'npc_spawns.json'), JSON.stringify(sandbox.npcs, null, 2));
        writeFileSync(join(exportPath, 'spatial', 'object_placements.json'), JSON.stringify(sandbox.objects, null, 2));
        writeFileSync(join(exportPath, 'entities', 'items.json'), JSON.stringify(questItems, null, 2));
        writeFileSync(join(exportPath, 'entities', 'npcs.json'), JSON.stringify(sandbox.npcs, null, 2));
        writeFileSync(join(exportPath, 'logic', 'varbits.json'), JSON.stringify(varbits, null, 2));
        writeFileSync(join(exportPath, 'logic', 'state_machine.json'), JSON.stringify(stateMachine, null, 2));
        writeFileSync(join(exportPath, 'logic', 'dialogue_tree.json'), JSON.stringify(
            sandbox.npcs.map(n => ({ npcId: n.id, name: n.name, dialogue: n.dialogue })), null, 2));
        writeFileSync(join(exportPath, 'rewards', 'xp_grants.json'), JSON.stringify(quest.rewards.xp, null, 2));
        writeFileSync(join(exportPath, 'rewards', 'item_grants.json'), JSON.stringify(quest.rewards.items, null, 2));

        logger.info({ exportPath, stages: stages.length, npcs: sandbox.npcs.length, items: questItems.length }, '✅ Quest package forged and exported.');

        return ok(pkg);
    }

    // ─── LLM-Enhanced Forge (uses AI for richer narrative grounding) ───

    public async forgeWithNarrative(
        title: string,
        scenes: StoryboardScene[],
        difficulty: string = 'Intermediate'
    ): Promise<Result<QuestPackage>> {
        // First forge the structural package
        const baseRes = await this.forgeQuest(title, scenes, difficulty);
        if (!baseRes.ok) return baseRes;

        const pkg = baseRes.value;

        // Enhance dialogue with LLM
        const hexagram = HEXAGRAM_REGISTRY['110110']; // Hexagram 58: The Joyous (Quest Narrative)
        const dialoguePrompt = `You are writing RS3-style quest dialogue for "${title}".

THINKING PASSER (HEXAGRAM BIAS):
- Archetype: ${hexagram.name} (${hexagram.description})
- Strategy Directive: ${hexagram.strategy}
- Visual Aesthetic: ${hexagram.aesthetics.visualFilter}
- Tone Constraint: Prosody (Chaos: ${hexagram.aesthetics.prosody.chaos}, Whimsy: ${hexagram.aesthetics.prosody.whimsy}, Dark: ${hexagram.aesthetics.prosody.darkTone})
Ensure the dialogue embodies this specific aesthetic and emotional weight.
NPCs: ${pkg.sandbox.npcs.map(n => n.name).join(', ')}
Stages: ${pkg.quest.stages.map(s => s.title).join(' -> ')}

Write 2-3 lines of dialogue per NPC per stage. Match RuneScape tone (dry humor, fourth-wall breaks, medieval fantasy).
JSON array format: [{ "npcName": "...", "stage": 1, "lines": ["line1", "line2"] }]`;

        const dialogueRes = await this.client.resilientCall({
            model: this.client.config.midPathModel,
            prompt: dialoguePrompt,
            format: 'json',
            tier: 'Executive'
        });

        if (dialogueRes.ok) {
            try {
                const enhanced = JSON.parse(dialogueRes.value.response);
                if (Array.isArray(enhanced)) {
                    for (const entry of enhanced) {
                        const npc = pkg.sandbox.npcs.find(n => n.name === entry.npcName);
                        if (npc && entry.lines) {
                            npc.dialogue = entry.lines.map((l: string) => ({ speaker: npc.name, text: l }));
                        }
                    }
                    // Re-export enhanced dialogue
                    writeFileSync(join(pkg.exportPath, 'logic', 'dialogue_tree.json'), JSON.stringify(
                        pkg.sandbox.npcs.map(n => ({ npcId: n.id, name: n.name, dialogue: n.dialogue })), null, 2));
                    logger.info('Enhanced dialogue written via LLM.');
                }
            } catch (e) {
                logger.warn({ err: e }, 'LLM dialogue enhancement failed, using structural dialogue.');
            }
        }

        return ok(pkg);
    }

    public healthCheck(): { online: boolean; details: string } {
        const hasNPCs = existsSync(join(this.dumpPath, 'npcs.json'));
        const hasQuests = existsSync(join(this.dumpPath, 'quests.json'));
        const hasMapzones = existsSync(join(this.pedagogyPath, 'mapzones_registry.json'));
        return {
            online: hasNPCs && hasQuests,
            details: `QuestForge: NPCs=${hasNPCs} Quests=${hasQuests} Mapzones=${hasMapzones}`
        };
    }
}

