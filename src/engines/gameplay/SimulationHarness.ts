import * as fs from 'fs';
import { Coord, GameState, Result, YaoState, SkillId, EquipmentSlot, SovereignAvatar, Item } from '../../core/models.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { WorldGroundingLimb } from '../../limbs/world_grounding/WorldGroundingLimb.js';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { AIDispatcher } from '../../api/ai/Dispatcher.js';
import { WikiEnricher } from '../../utils/WikiEnricher.js';
import { EntityLimb } from '../../limbs/technical/EntityLimb.js';
import { createLogger } from '../../utils/logger.js';
import { NecromancyAbility, NecromancyGFX } from './NecromancyInterfaces.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';
import { ServerLogicRegistry, LogicalSignature } from './ServerLogicRegistry.js';
import { SpatialSovereigntyLimb } from '../../limbs/spatial/SpatialSovereigntyLimb.js';
import { DirectionalPathfinder } from '../../limbs/spatial/DirectionalPathfinder.js';
import { NpcAgent, NpcAgentConfig } from './NpcAgent.js';
import { InteractionGateway } from '../../limbs/logical/InteractionGateway.js';
import { GameplaySovereigntyLimb } from '../../limbs/spatial/GameplaySovereigntyLimb.js';
import { DBRowOracleLimb } from '../../limbs/spatial/DBRowOracleLimb.js';
import { WorldStateLimb } from '../../limbs/logical/WorldStateLimb.js';
import { AdminCommandProcessor } from '../../limbs/logical/world/AdminCommandProcessor.js';

export interface TickEvent {
    id: string;
    signature: 'COMBAT_HIT' | 'COMBAT_MISS' | 'SKILL_SUCCESS' | 'SKILL_FAIL' | 'ITEM_DROP' | 'EXPRESSION_TRIGGER';
    metadata: any;
    timestamp: number;
}

const logger = createLogger('SimulationHarness');

/**
 * ServerLogicMapper
 * Maps "Server-Only" and "Admin" game logic derived from the raw binary cache.
 * Fulfills the "Pull from cache using D: rsmv" requirement.
 */
export class ServerLogicMapper {
    private grounding: WorldGroundingLimb;
    private systemMapping: any[] = [];
    private behaviorCache: Map<number, string> = new Map();

    constructor(grounding: WorldGroundingLimb) {
        this.grounding = grounding;
        this.loadSystemMapping();
    }

    private loadSystemMapping() {
        try {
            const data = fs.readFileSync('D:/sovereign/atlas/system/cache_logic_mapping.json', 'utf8');
            const findings = JSON.parse(data);
            // Flattens the categorized findings for easy lookup
            this.systemMapping = Object.values(findings).flat();
            logger.info({ count: this.systemMapping.length }, 'Authoritative System Logic Mapping loaded.');
        } catch (e) {
            logger.warn('System logic mapping unavailable. Running in visceral mode.');
        }
    }

    /**
     * Maps an NPC's behavior from the cache's categorized logic findings.
     * Incorporates "Hybrid Grounding": Cache ID + Wiki Enrichment.
     */
    public async resolveNpcBehavior(npcId: number, tick: number): Promise<string | null> {
        if (this.behaviorCache.has(npcId)) return this.behaviorCache.get(npcId)!;

        // 1. Enforce Cache Authority (Reflexive Veto)
        const cacheMatch = this.systemMapping.find(m => m.major === 18 && m.context.includes(npcId.toString()));
        const isDummy = cacheMatch?.keyword === 'dummy';
        
        if (isDummy) {
            const res = `[SERVER_LOGIC] Entity ${npcId} is a CACHE_DUMMY. Internalizing reflexive silence.`;
            this.behaviorCache.set(npcId, res);
            return res;
        }

        // 2. Hybrid Grounding (Wiki Enrichment)
        const cacheContext = cacheMatch?.context || `NPC ${npcId}`;
        const wikiRes = await WikiEnricher.enrichNpc(cacheContext);
        const wikiName = wikiRes.ok ? wikiRes.value.name : 'Unknown Body';

        const spatialContext = this.grounding.resolveSpatialContext(`npc-${npcId}`);
        if (!spatialContext) return null;

        const result = `[SERVER_LOGIC] ${wikiName} (ID: ${npcId}) synchronized. Role: ${wikiRes.ok ? wikiRes.value.role : 'Visceral'}.`;
        this.behaviorCache.set(npcId, result);
        return result;
    }

    /**
     * Checks if an NPC is marked as a 'dummy' in the authoritative cache mapping.
     */
    public isDummy(npcId: number): boolean {
        return this.systemMapping.some(m => m.major === 18 && m.keyword === 'dummy' && m.context.includes(npcId.toString()));
    }
}

/**
 * Sovereign Simulation Harness
 * The central CNS node for the deterministic Dual-Tick pulse.
 */
export class SimulationHarness {
    private grounding: WorldGroundingLimb;
    private hexagram: HexagramManager;
    private dispatcher: AIDispatcher;
    private serverLogic: ServerLogicMapper;
    private entityLimb: EntityLimb;
    private switchboard: SwitchboardLimb;
    private interactionGateway: InteractionGateway;
    private dbRowOracle: DBRowOracleLimb;
    
    private lastDeepSync: number = 0;
    private isSyncing: boolean = false;

    // AI Models assigned per role (Pinned to local substrate)
    private readonly REFLEX_MODEL = 'vibethinker:1.5b'; // 600ms heartbeat
    private readonly TACTICAL_MODEL = 'deepseek-r1:8b';    // Combat Logic
    private readonly STRATEGIC_MODEL = 'kimi-k2.5:cloud';  // Strategic reasoning

    private lastChunkX: number = -1;
    private lastChunkZ: number = -1;

    // ── Movement Substrate ─────────────────────────────────────────────────────
    private pathfinder: DirectionalPathfinder | null = null;
    private walkGoal: Coord | null = null;
    private isPathfinding = false;

    // ── NPC Agent Registry ────────────────────────────────────────────────────
    private agentRegistry = new Map<number, NpcAgent>();

    constructor(grounding: WorldGroundingLimb, hexagram: HexagramManager, dispatcher: AIDispatcher, entityLimb: EntityLimb, switchboard: SwitchboardLimb) {
        this.grounding = grounding;
        this.hexagram = hexagram;
        this.dispatcher = dispatcher;
        this.entityLimb = entityLimb;
        this.switchboard = switchboard;
        this.serverLogic = new ServerLogicMapper(grounding);
        this.interactionGateway = new InteractionGateway();
        this.dbRowOracle = DBRowOracleLimb.getInstance();
        this.dbRowOracle.initialize();

        // Bootstrap the pathfinder against the singleton spatial authority
        const spatial = SpatialSovereigntyLimb.getInstance();
        this.pathfinder = new DirectionalPathfinder(spatial);

        logger.info('Simulation Harness AWAKE. Coordinating cache-authoritative world logic nodes.');
    }

    /**
     * setWalkGoal - Authoritative walk command.
     * Called by Admin commands (::walkTo x y) or AI strategic reasoning.
     */
    public setWalkGoal(x: number, y: number, plane = 0): void {
        this.walkGoal = { x, y, plane };
        logger.info({ x, y, plane }, '[HARNESS] Walk goal set.');
    }

    /**
     * registerNpcAgent - Override behavior config for a specific NPC.
     * Call this from gameplay modules (e.g. BarrowsInterpreter, PrifddinasInterpreter)
     * to assign patrol paths or stationary stance to specific NPCs.
     */
    public registerNpcAgent(npcId: number, config: NpcAgentConfig, state: GameState): void {
        const npc = state.npcMap.get(npcId);
        if (!npc || !this.pathfinder) {
            logger.warn({ npcId }, '[HARNESS] registerNpcAgent: NPC not found or pathfinder unavailable.');
            return;
        }
        const spatial = SpatialSovereigntyLimb.getInstance();
        this.agentRegistry.set(npcId, new NpcAgent(npc, config, this.pathfinder, spatial));
        logger.info({ npcId, behavior: config.behavior }, '[HARNESS] NPC agent registered with explicit config.');
    }

    /**
     * Master Tick (Reflex) - Triggered every 600ms.
     */

    public async processTick(tickCount: number, state: GameState, avatar: SovereignAvatar): Promise<void> {
        const yao = this.hexagram.getYaoState();
        const bias = this.calculateMetabolicBias(yao);

        // 0. Process Authoritative Switchboard Commands (Tick-Synchronized)
        const commands = this.switchboard.getAdminQueue();
        if (commands.length > 0) {
            const worldState = WorldStateLimb.getInstance(avatar);
            for (const cmd of commands) {
                await AdminCommandProcessor.execute(cmd, worldState);
            }
            this.switchboard.clearAdminQueue();
        }

        // 1. Synchronize Avatar (Player State)
        const previousPath = avatar.currentPath;
        avatar.processTick();

        // 1.5 Evaluate Pending Interactions if path just finished
        if (avatar.pendingInteraction && avatar.currentPath === null) {
            // Either they arrived, or they were already there.
            const interaction = avatar.pendingInteraction;
            avatar.pendingInteraction = null; // Clear it to prevent looping
            
            const activeModule = GameplaySovereigntyLimb.getInstance().activeModule || this.serverLogic /* universal fallback? */;
            
            const results = await this.interactionGateway.evaluateInteraction(
                avatar, 
                interaction.action, 
                interaction.targetId, 
                state, 
                activeModule
            );
            
            for (const log of results) {
                logger.info({ action: interaction.action, targetId: interaction.targetId }, log);
            }
        }

        // 2. Proximity Manifestation (Phase 39)
        const chunkX = avatar.coord.x >> 6;
        const chunkY = avatar.coord.y >> 6;
        if (chunkX !== this.lastChunkX || chunkY !== this.lastChunkZ) {
            this.lastChunkX = chunkX;
            this.lastChunkZ = chunkY;
            this.grounding.manifestNearbyEntities(chunkX, chunkY).catch(err => {
                logger.error({ err, chunkX, chunkY }, 'Forensic Manifestation Failed.');
            });
        }

        // 3. Map Server-Only Logic to the Current Tick
        for (const [npcId] of state.npcMap) {
            // Persistent Registration (Ensures we only register once per session)
            this.entityLimb.registerEntity({
                id: `npc_${npcId}`,
                type: 'npc',
                name: `NPC ${npcId}`,
                isDummy: this.serverLogic.isDummy(npcId)
            }).catch(() => {});

            this.serverLogic.resolveNpcBehavior(npcId, tickCount).catch(err => {
                logger.error({ err, npcId }, 'Logic resolution failure — defaulting to visceral reflex.');
            });
        }

        // 4. NPC Agent Movement Tick
        // Auto-register new NPCs; tick existing agents (non-blocking)
        for (const [npcId, npc] of state.npcMap) {
            if (!this.agentRegistry.has(npcId) && this.pathfinder) {
                // Auto-register as wander agent (default RSC-style behavior)
                const spatial = SpatialSovereigntyLimb.getInstance();
                const isDummy = this.serverLogic.isDummy(npcId);
                const config: NpcAgentConfig = isDummy
                    ? { behavior: 'stationary' }
                    : { behavior: 'wander', wanderRadius: 5, ticksPerMove: 1 };
                this.agentRegistry.set(npcId, new NpcAgent(npc, config, this.pathfinder, spatial));
                logger.debug({ npcId, behavior: config.behavior }, '[NPC] Agent registered.');
            }

            const agent = this.agentRegistry.get(npcId);
            if (agent) {
                agent.tick(state).catch(err =>
                    logger.error({ err, npcId }, '[NPC] Agent tick threw.')
                );
            }
        }

        // Prune agents for NPCs that have despawned
        for (const [agentId] of this.agentRegistry) {
            if (!state.npcMap.has(agentId)) {
                this.agentRegistry.delete(agentId);
            }
        }

        // 3. Process Reflexive Pulse (Broadcast to Renderer)
        this.processReflexivePulse(tickCount, state, avatar);

        // 4. Reflexive AI Processing (VibeThinker)
        // If the AI is "Thinking," its responses are injected into the reflex pipe
        if (tickCount % 5 === 0) {
            this.reflexLoop(avatar, state);
        }

        // 5. Strategic State Reconciliation (Every 6000ms)
        // Note: This is purely Game/Player State related (Brain Sync). 
        // Neurological Health (Heart Audit) has been decoupled to PulseMonitor.
        if (tickCount - this.lastDeepSync >= 10) {
            this.syncGodhead(state, avatar).catch(err => {
                logger.error({ err }, 'Strategic Deep Path sync stalled — retaining last known reality.');
            });
            this.lastDeepSync = tickCount;
        }
    }

    /**
     * processReflexivePulse
     * Executes authoritative logic and broadcasts "id+calls" to the 60fps Strategic Renderer.
     */
    /**
     * processReflexivePulse
     * Executes authoritative logic and broadcasts "id+calls" to the 60fps Strategic Renderer.
     */
    private processReflexivePulse(tick: number, state: GameState, avatar: SovereignAvatar): void {
        const events: TickEvent[] = [];

        // 1. Authoritative NPC Interactions (Dummies & Practice Nodes)
        for (const [npcId] of state.npcMap) {
            const mapping = ServerLogicRegistry.getMapping(18, npcId);
            if (!mapping) continue;

            switch (mapping.signature) {
                case LogicalSignature.PRACTICE_SKILL_NODE:
                    // Authoritative Practice Success Roll
                    if (this.rollSkillSuccess(70, 99, 99)) {
                        events.push({
                            id: `npc_${npcId}`,
                            signature: 'SKILL_SUCCESS',
                            metadata: { practice: true, type: mapping.context, exp: 12.5 },
                            timestamp: Date.now()
                        });
                    }
                    break;
                case LogicalSignature.TRANSPORT_ACTUATOR:
                    events.push({
                        id: `npc_${npcId}`,
                        signature: 'EXPRESSION_TRIGGER',
                        metadata: { pose: 'movement_pulse', duration: 600 },
                        timestamp: Date.now()
                    });
                    break;
            }
        }

        // 2. Object Interactions (Actuators & Stations)
        for (const [objId] of state.objectMap) {
            const mapping = ServerLogicRegistry.getMapping(16, objId);
            if (!mapping) continue;

            switch (mapping.signature) {
                case LogicalSignature.CONSUMABLE_SKILL_STATION:
                    // FOUR-BUCKET AUTHORITATIVE CHECK (Ground, Equipped, Inventory, Bank)
                    // Portable stations typically require a specific item (e.g. Logs/Fish)
                    const substrate = this.checkItemSubstrate(avatar, state, 995, 1); // 995 = Coins (Stackable Placeholder)
                    
                    if (substrate && this.calcProductionSuccessful(1, 99, 99)) {
                        events.push({
                            id: `obj_${objId}`,
                            signature: 'SKILL_SUCCESS',
                            metadata: { substrate: substrate.bucket, amount: substrate.amount, stackable: substrate.stackable, station: true, type: mapping.context, exp: 45.0 },
                            timestamp: Date.now()
                        });
                        logger.debug({ objId, bucket: substrate.bucket, amount: substrate.amount }, 'Consumable success verified across buckets with stackability.');
                    }
                    break;
                case LogicalSignature.BANK_DEPOSIT_ACTUATOR:
                    // Coal Truck Logic: Check if player "has" coal (453) in any bucket to deposit
                    const coalSubstrate = this.checkItemSubstrate(avatar, state, 453, 1);
                    if (coalSubstrate) {
                        events.push({
                            id: `obj_${objId}`,
                            signature: 'ITEM_DROP',
                            metadata: { effect: 'deposit_vfx', source: coalSubstrate.bucket, amount: coalSubstrate.amount, destination: 'bank' },
                            timestamp: Date.now()
                        });
                    }
                    break;
            }
        }

        // 3. Reflexive Combat Processing...
        // ...Existing combat logic...

        // Broadcast to Renderer (Strategic Limb)
        if (events.length > 0) {
            this.switchboard.broadcast({
                type: 'tick_event',
                tick,
                events
            });
        }
    }

    /**
     * Authoritative Four-Bucket Substrate Search
     * Checks: Ground Item (r=1), Equipped, Inventory, and Banked.
     * Handles: Stackability (Summing amounts across slots).
     */
    private checkItemSubstrate(avatar: SovereignAvatar, state: GameState, itemId: number, requiredAmount: number): { bucket: 'inventory' | 'equipped' | 'ground' | 'bank', amount: number, stackable: boolean } | null {
        // 1. Inventory Check (Stackable Summing)
        let totalInv = 0;
        avatar.inventory.forEach(i => { if (i?.id === itemId) totalInv += i.amount; });
        if (totalInv >= requiredAmount) return { bucket: 'inventory', amount: totalInv, stackable: totalInv > 1 };

        // 2. Equipment Check
        const equipSlot = Object.values(avatar.equipment).find(i => i?.id === itemId) as Item | undefined;
        if (equipSlot) return { bucket: 'equipped', amount: equipSlot.amount, stackable: equipSlot.amount > 1 };

        // 3. Bank Check (Regional Authorization)
        let totalBank = 0;
        avatar.bank.forEach((i: Item) => { if (i.id === itemId) totalBank += i.amount; });
        if (totalBank >= requiredAmount) return { bucket: 'bank', amount: totalBank, stackable: totalBank > 1 };

        // 4. Ground Item Check (Spatial Query within 1 square distance)
        // placeholder for ground item map check once implemented in models.ts
        
        return null;
    }

    /**
     * Ported Legacy Roll Logic from rolls.js
     */
    private rollSkillSuccess(low: number, high: number, level: number): boolean {
        const threshold = Math.floor((low * (99 - level)) / 98) + Math.floor((high * (level - 1)) / 98) + 1;
        const roll = Math.floor(Math.random() * 257);
        return roll <= threshold;
    }

    private calcProductionSuccessful(levelReq: number, skillLevel: number, levelStopFail: number): boolean {
        if (skillLevel < levelReq) return false;
        const roll = Math.floor(Math.random() * 256) + 1;
        const threshold = Math.min(255, Math.floor(64 + (skillLevel - 1) * (19200.0 / (levelStopFail * 98))));
        return roll <= threshold;
    }

    private async syncGodhead(state: GameState, avatar: SovereignAvatar): Promise<void> {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            logger.debug('ðŸš€ [GODHEAD] Commencing Deep Path Strategic Sync (6000ms pulse)...');

            // Strategy: Use Kimi (Cloud) for the            // 2. Strategic Orientation via DeepSeek/Kimi
            const insight = await this.dispatcher.dispatch({
                capabilityId: 'esoteric_reasoning',
                payload: JSON.stringify({
                    task: 'reconcile_simulation_drift',
                    metadata: {
                        pos: avatar.coord,
                        yao: this.hexagram.getYaoState(),
                        tick: state.tickNumber,
                        genomicContext: this.dbRowOracle.resolveRefillNeed(89) // Authoritative grounding for Pen logic
                    }
                })
            });

            if (insight.success) {
                logger.info('[GODHEAD] Simulation drift reconciled. Aligning metabolic vectors.');
            }
        } finally {
            this.isSyncing = false;
        }
    }

    private async reflexLoop(avatar: SovereignAvatar, state: GameState): Promise<void> {
        // Only attempt pathfinding if we have a goal and the avatar is idle
        if (!this.walkGoal || !this.pathfinder || this.isPathfinding) return;
        if (avatar.currentPath && avatar.currentPath.length > 0) return; // Still walking
        if (avatar.isBusy()) return;

        const goal = this.walkGoal;

        // Guard: already at destination
        if (avatar.coord.x === goal.x && avatar.coord.y === goal.y) {
            logger.info({ goal }, '[REFLEX] Avatar reached walk goal. Clearing.');
            this.walkGoal = null;
            return;
        }

        this.isPathfinding = true;
        try {
            logger.debug({ from: avatar.coord, to: goal }, '[REFLEX] Pathfinding...');
            // Plot path to target
            let success = false;
            if (avatar.plotPath) {
                success = await avatar.plotPath(goal.x, goal.y, this.pathfinder, state);
            }
            
            if (success) {
                const steps = avatar.currentPath?.length ?? 0;
                logger.info({ from: avatar.coord, to: goal, steps }, '[REFLEX] Path issued — avatar walking.');

                // Broadcast to 3D viewer + renderer
                this.switchboard.broadcast({
                    type: 'tick_event',
                    tick: state.tickNumber,
                    events: [{
                        id: `walk_${Date.now()}`,
                        signature: 'EXPRESSION_TRIGGER',
                        metadata: {
                            pose: 'walk',
                            from: avatar.coord,
                            to: goal,
                            steps,
                        },
                        timestamp: Date.now()
                    }]
                });
            } else {
                logger.warn({ from: avatar.coord, to: goal }, '[REFLEX] No path found to goal. Retrying next reflex pulse.');
            }
        } catch (err) {
            logger.error({ err }, '[REFLEX] Pathfinding threw.');
        } finally {
            this.isPathfinding = false;
        }
    }

    private calculateMetabolicBias(yao: YaoState): number {
        // Adjusts the "chaos" of the simulation based on the I Ching state
        return (yao === YaoState.OldYang) ? 1.5 : 1.0;
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'Simulation Harness nominal. CNS heartbeat synchronized.' };
    }
}
