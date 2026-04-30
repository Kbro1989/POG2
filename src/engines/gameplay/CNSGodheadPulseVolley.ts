import { getLastIOLatencyMs } from '../../utils/RSMVBridge.js';
import { EventBus } from '../../events/EventBus.js';
import { createLogger } from '../../utils/logger.js';
import { performance } from 'perf_hooks';
import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { SubstrateState, YaoState, GameState, SovereignAvatar } from '../../core/models.js';
import { RSMVController } from '../../vision/RSMVController.js';
import { CacheForensicsLimb } from '../../limbs/spatial/CacheForensicsLimb.js';
import { SwitchboardLimb, type AdminCommand } from '../../monitor/SwitchboardLimb.js';
import { SpatialVisionEngine } from '../SpatialVisionEngine.js';
import { WorldGroundingLimb } from '../../limbs/world_grounding/WorldGroundingLimb.js';
import { GameplaySovereigntyLimb } from '../../limbs/spatial/GameplaySovereigntyLimb.js';
import { GlobeStateLimb } from '../../limbs/spatial/GlobeStateLimb.js';
import { GameplayModule } from './MinigameInterfaces.js';
import { SubstrateResolver } from './SubstrateResolver.js';
import { NodeTester } from '../../monitor/NodeTester.js';
import { CNSCausalityLedger, type TickEvent, type EventOutcome, type TileLock, type EventSource } from '../core/CNSCausalityLedger.js';
import { Renderer } from '../../ui/Renderer.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { GhostSplatEngine } from '../../substrates/GhostSplatEngine.js';
import { PlayerAgent } from './PlayerAgent.js';
import crypto from 'crypto';

const logger = createLogger('CNSGodheadPulseVolley');

interface VolleyBatch {
    timestamp: number;
    commands: AdminCommand[];
}

/**
 * CNSGodheadPulseVolley
 * The deterministic execution kernel for POG2 Sovereign.
 * Implements Phase 31 Authoritative Substrate Runtime (Deterministic, Graded, Verified).
 */
export class CNSGodheadPulseVolley {
    private static instance: CNSGodheadPulseVolley | undefined;
    private readonly TICK_INTERVAL = 300; // 300ms Player Reflex Pulse
    private readonly GAME_TICK_INTERVAL = 600; // 600ms World Pulse
    private readonly BUDGET_MS = 150;      // Warning threshold for tick overflow
    
    // Dependencies resolved lazily via resolve() to avoid boot-order violations.
    private switchboard?: SwitchboardLimb;
    private grounding?: WorldGroundingLimb;
    private vision?: SpatialVisionEngine;
    private gameplay?: GameplaySovereigntyLimb;
    private rsmv?: RSMVController;
    private forensics?: CacheForensicsLimb;
    private router: TernaryRouter;
    private nodeTester?: NodeTester;
    private renderer?: Renderer;
    private ghostSplat?: GhostSplatEngine;
    private globe?: GlobeStateLimb;
    private readonly ledger = CNSCausalityLedger.getInstance();
    private pulseStartTime: number = 0;
    private readonly PULSE_DEADLINE_MS = 300;
    private currentTickQueue: Array<() => Promise<void>> = [];
    private nextTickQueue: Array<() => Promise<void>> = [];

    public enqueueNow(op: () => Promise<void>): void {
        this.currentTickQueue.push(op);
    }

    public enqueueNextTick(op: () => Promise<void>): void {
        this.nextTickQueue.push(op);
    }

    /**
     * resolve - Lazy dependency resolution.
     * Prevents accessing substrates before they are configured by OrchestrateEngine.
     */
    private resolve(): void {
        if (!this.switchboard) this.switchboard = SwitchboardLimb.getInstance();
        if (!this.grounding) this.grounding = WorldGroundingLimb.getInstance();
        if (!this.vision) this.vision = SpatialVisionEngine.getInstance();
        if (!this.gameplay) this.gameplay = GameplaySovereigntyLimb.getInstance();
        if (!this.rsmv) this.rsmv = RSMVController.getInstance();
        if (!this.forensics) this.forensics = CacheForensicsLimb.getInstance();
        if (!this.ghostSplat) this.ghostSplat = GhostSplatEngine.getInstance();
        if (!this.globe) this.globe = (this.gameplay as any)?.globe; // Usually initialized in NeurologicalMap
    }

    private static readonly PRIORITY: Record<EventSource, number> = {
        ADMIN: 0,
        SYSTEM: 1,
        AI: 2,
        WORLD_SCRIPT: 3
    };

    private substrateState: SubstrateState = SubstrateState.OFFLINE;
    private tickCount = 0;
    private isStarted = false;

    private constructor() {
        if (CNSGodheadPulseVolley.instance) {
            throw new Error('Singleton violation: use CNSGodheadPulseVolley.getInstance()');
        }
        // Router will be injected by OrchestrateEngine to ensure shared context.
        // It's initialized with a dummy config first to satisfy types.
        this.router = new TernaryRouter({} as any);
    }

    public static getInstance(): CNSGodheadPulseVolley {
        if (!this.instance) {
            this.instance = new CNSGodheadPulseVolley();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    public setRouter(router: TernaryRouter) {
        this.router = router;
    }

    public setNodeTester(nodeTester: NodeTester) {
        this.nodeTester = nodeTester;
    }

    public setRenderer(renderer: Renderer) {
        this.renderer = renderer;
    }

    public getRenderer(): Renderer | undefined {
        return this.renderer;
    }

    public getAvatar(): SovereignAvatar | undefined {
        this.resolve();
        return this.gameplay?.avatar;
    }

    /**
     * startLoop - Deterministic Heartbeat (Hardened Recursive).
     * Implements self-correcting drift logic inspired by RSC Evolution alarms.
     */
    public startLoop(): void {
        if (this.isStarted) {
            logger.warn('CNS Godhead Pulse already active. Ignition aborted.');
            return;
        }

        this.isStarted = true;
        logger.info('CNS Godhead Pulse (Hardened Heartbeat) Started. Player Tick: 300ms | Game Tick: 600ms');

        // Phase 112: Inject deterministic execution boundary into the global EventBus
        EventBus.getInstance().setQueueHandler((op) => {
            this.enqueueNextTick(async () => op());
        });

        // Phase 112: Immediate bootstrap tick
        this.tick();
        
        // POG2 Thinking Sub-loop (Async User-behind-Player)
        this.startPog2ThinkingLoop();
    }

    private async startPog2ThinkingLoop(): Promise<void> {
        // Runs entirely independently of the deterministic tick
        while (this.isStarted) {
            try {
                this.resolve();
                if (this.gameplay?.globalState && this.gameplay.avatar) {
                    // This mirrors "user looking at screen, then clicking"
                    const harness = (this.gameplay as any).harness;
                    if (harness && harness.syncGodhead) {
                        await harness.syncGodhead(this.gameplay.globalState, this.gameplay.avatar);
                    }
                }
            } catch (err) {
                logger.error({ err }, 'POG2 Async Thinking Loop Error');
            }
            // Think every 5-8 seconds asynchronously
            await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        }
    }

    private async tick(): Promise<void> {
        const start = performance.now();
        this.tickCount++;

        // Swap deterministic queues at start of tick
        this.currentTickQueue = this.nextTickQueue;
        this.nextTickQueue = [];

        try {
            // Resolve lazy dependencies before first pulse
            this.resolve();

            // 1. Health Probe (Substrate Authority via Resolver)
            this.substrateState = await SubstrateResolver.resolve();
            this.updateTernaryState(this.substrateState);

            // 2. Substrate Veto (Hard Abort if OFFLINE)
            if (this.substrateState === SubstrateState.OFFLINE) {
                logger.error('[CNS GODHEAD] Pulse aborted: Substrate OFFLINE');
                return;
            }

            const pendingCommands = this.switchboard!.drainAdminQueue();
            
            // Phase 32: Tick-Accurate World Simulation (7-Step Flow)
            await this.pulse(pendingCommands);

            // 3. Post-Actuation Verification (Spatial Vision) - Non-blocking to pulse rhythm
            // Throttle to every 10th tick (6s) — LLM vision latency far exceeds 600ms,
            // and the game world doesn't change visually that fast.
            if (this.substrateState === SubstrateState.ONLINE && this.vision && this.tickCount % 10 === 0) {
                this.vision.verifySpatialAnchor().then(verification => {
                    if (!verification.ok) {
                        logger.warn({ error: (verification.error as Error)?.message }, '[CNS GODHEAD] Visual verification drift detected. Substrate link degraded.');
                    }
                }).catch(err => {
                    logger.error({ err }, '[CNS GODHEAD] Vision Substrate Critical Failure.');
                });
            }

        } catch (err) {
            logger.error({ err }, '[CNS GODHEAD] Pulse failure â€” potential world desync.');
        } finally {
            const duration = performance.now() - start;
            

            // Self-Correcting Scheduling (Drift Compensation)
            const nextDelay = Math.max(0, this.TICK_INTERVAL - duration);
            
            logger.debug({
                duration,
                drift: duration - this.TICK_INTERVAL,
                limit: this.TICK_INTERVAL
            }, '[CNS GODHEAD] Tick metrics');

            if (duration > this.BUDGET_MS) {
                logger.warn({ duration, limit: this.TICK_INTERVAL }, 'CNS Tick Overflow â€” authoritative simulation drift detected.');
            }

            setTimeout(() => this.tick(), nextDelay);
        }
    }


    /**
     * updateTernaryState - Maps substrate health to the POG2 Yin/Yang/Yao logic.
     */
    private updateTernaryState(state: SubstrateState): void {
        switch (state) {
            case SubstrateState.ONLINE:
                this.router.setYaoState(YaoState.YoungYang); // Balanced Action
                break;
            case SubstrateState.DEGRADED:
            case SubstrateState.DEGRADED_IO:
                this.router.setYaoState(YaoState.YoungYin);  // Perceptive Only (Wait states)
                break;
            case SubstrateState.OFFLINE:
                this.router.setYaoState(YaoState.OldYin);    // Shutdown/Stasis
                break;
        }
    }


    public async pulse(commands: AdminCommand[]): Promise<GameState | undefined> {
        this.pulseStartTime = performance.now();
        this.resolve();
        // 1. Collect & Normalize
        const events = commands.map(cmd => this.createTickEvent(cmd));

        // 2. Sort (Priority -> Time -> ID)
        const sorted = this.sortEvents(events);

        // 3. Resolve Conflicts (Tile Locking)
        const resolved = this.resolveConflicts(sorted);

        const isGameTick = this.tickCount % 2 === 0;

        // 4. Atomic World Transaction (Only full commits on game tick)
        const tx = this.grounding!.beginTick();

        // 5. Execute valid events
        for (const event of resolved) {
            if (event.outcome === "SUCCESS") {
                await this.executeEvent(tx, event);
            }
            // 6. Record Outcome
            this.ledger.record(event);
        }

        // Execute deterministic queue ops for this tick
        for (const op of this.currentTickQueue) {
            try {
                await op();
            } catch (e) {
                logger.error({ err: e }, '[CNS] Deterministic op failed');
            }
        }
        this.currentTickQueue = [];

        // Apply world changes
        await this.grounding!.commitTick(tx);

        // Authoritative Gameplay Tick (Dual-Tick Architecture)
        await this.gameplay!.processTick(isGameTick);

        if (this.gameplay?.globalState) {
            const playerAgent = (this.gameplay as any).playerAgent;
            // We project ghost splats on player ticks too for smooth client visuals
            const field = this.ghostSplat!.project(this.gameplay.globalState, 3, playerAgent);
            if (field) {
                this.switchboard!.broadcastGhostSplat(field);
            }

            // Phase 112: Sovereign Live Bridge - Sync Avatar State to Globe
            if (this.gameplay.avatar && this.globe) {
                const avatar = this.gameplay.avatar as SovereignAvatarEntity;
                this.globe.pushNodeState('player_sovereign', {
                    coord: avatar.coord,
                    equipment: avatar.equipment,
                    adrenaline: avatar.adrenaline,
                    bloodlustStacks: avatar.bloodlustStacks,
                    hp: avatar.currentHp,
                    maxHp: avatar.maxHp,
                    intent: avatar.intent,
                    lockTicks: avatar.lockTicks
                });
            }
        }

        // 7. Commit Ledger (Logs & history rotation)
        if (isGameTick) {
            this.ledger.commitTick();
        }

        const elapsed = performance.now() - this.pulseStartTime;
        if (elapsed > this.PULSE_DEADLINE_MS * 0.8) {
            logger.warn({ duration: elapsed.toFixed(1) }, `[CNS] Pulse at ${elapsed.toFixed(1)}ms`);
        }

        return this.gameplay?.globalState;
    }

    private createTickEvent(cmd: AdminCommand): TickEvent {
        const source = (cmd as any).source || cmd.metadata?.source || "ADMIN";
        const timestamp = (cmd as any).timestamp || cmd.metadata?.timestamp || Date.now();
        const inputs = cmd.metadata || {};
        
        // Resolve coordinate if present
        let coord;
        if (cmd.type === 'teleport' || cmd.type === 'spawn') {
            const rawCoord = inputs.coords || (inputs.regionId ? this.grounding!.getSpatialTruth(inputs.regionId) : null);
            if (rawCoord) {
                const zVal = rawCoord.z ?? rawCoord.plane ?? 0;
                coord = { x: rawCoord.x, y: rawCoord.y, z: zVal, plane: zVal };
            }
        }

        const action = cmd.type;
        const stableId = crypto.createHash('md5')
            .update(`${action}-${source}-${JSON.stringify(inputs)}-${timestamp}`)
            .digest('hex');

        return {
            id: stableId,
            tick: this.ledger.getCurrentTick(),
            timestamp,
            action,
            source: source as EventSource,
            inputs,
            coord,
            outcome: "SUCCESS"
        };
    }

    private sortEvents(events: TickEvent[]): TickEvent[] {
        return [...events].sort((a, b) => {
            const pA = CNSGodheadPulseVolley.PRIORITY[a.source] ?? 99;
            const pB = CNSGodheadPulseVolley.PRIORITY[b.source] ?? 99;

            if (pA !== pB) return pA - pB;
            if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
            return a.id.localeCompare(b.id);
        });
    }

    private resolveConflicts(events: TickEvent[]): TickEvent[] {
        for (const event of events) {
            if (event.coord) {
                const tileKey = `${event.coord.x},${event.coord.y},${event.coord.plane}`;
                const activeLocks = this.ledger.getActiveLocks();

                if (activeLocks.has(tileKey)) {
                    event.outcome = "REJECTED_COLLISION";
                    logger.warn({ eventId: event.id, tileKey }, '[CNS GODHEAD] REJECTED_COLLISION: Tile already locked.');
                    continue;
                }

                this.ledger.setTileLock(tileKey, {
                    ownerEventId: event.id,
                    action: event.action
                });
            }
        }
        return events;
    }

    private async executeEvent(tx: Map<string, any>, event: TickEvent): Promise<void> {
        switch (event.action) {
            case 'teleport':
                if (event.coord) {
                    // DEFERRED: Spatial recalculation inside tick boundaries
                    this.enqueueNow(async () => {
                        await this.grounding!.applyWorldTransform(tx, { x: event.coord!.x, y: event.coord!.y, z: event.coord!.z }).catch(err => 
                            logger.error({ err: err.message }, `[CNS] Deferred transform failed`)
                        );
                    });
                    logger.debug({ coords: event.coord }, '[VOLLEY] SPATIAL_SHIFT deferred for tick execution.');
                }
                break;

            case 'walkTo': {
                // Route to SimulationHarness.setWalkGoal() → reflexLoop → avatar.plotPath
                const { x, y, plane } = event.inputs;
                if (typeof x === 'number' && typeof y === 'number') {
                    const harness = (this.gameplay as any)?.harness;
                    if (harness?.setWalkGoal) {
                        harness.setWalkGoal(x, y, plane ?? 0);
                        logger.debug({ x, y, plane }, '[VOLLEY] Walk goal delegated to Simulation Harness.');
                    } else {
                        logger.warn('[VOLLEY] walkTo received but no harness found on gameplay limb.');
                    }
                }
                break;
            }

            case 'spawn':
                const sid = event.inputs.entityId;
                const entityDef = this.grounding!.getEntityManifest(sid);
                if (entityDef) {
                    const defWithId = { ...entityDef, id: sid };
                    if (event.coord) {
                        defWithId.coord = event.coord;
                    }
                    // DEFERRED: Entity spawn inside tick boundaries
                    this.enqueueNow(async () => {
                        await this.grounding!.spawnEntity(tx, defWithId).catch(err =>
                            logger.error({ err: err.message }, `[CNS] Deferred spawn failed`)
                        );
                    });
                    logger.debug({ id: sid }, '[VOLLEY] ENTITY_MANIFEST staged for deterministic spawn.');
                }
                break;

            case 'admin_auth':
                const rank = event.inputs.rank || 'admin';
                this.switchboard!.setPrivilege(rank);
                logger.debug({ rank }, '[VOLLEY] PRIVILEGE_ELEVATION logged.');
                break;

            default:
                logger.warn({ action: event.action }, '[VOLLEY] Unknown action â€” dropping from execution.');
                event.outcome = "REJECTED_AUTHORITY";
        }
    }

    /**
     * healthCheck - Neurological diagnostic probe.
     */
    public healthCheck(): { online: boolean; details: string; status: 'ONLINE' | 'DEGRADED' | 'DEGRADED_IO' | 'OFFLINE' } {
        const ioLatency = getLastIOLatencyMs();
        const online = this.substrateState !== 'OFFLINE';
        return {
            online,
            status: this.substrateState as any,
            details: `CNS Pulse Kernel: ${this.substrateState} (Heartbeat: ${this.TICK_INTERVAL}ms | IO Latency: ${ioLatency}ms)`
        };
    }

    /**
     * injectVolley - Batch injection hook for programmatic control.
     */
    public injectVolley(commands: AdminCommand[]): void {
        this.resolve();
        commands.forEach(cmd => this.switchboard!.pushAdminCommand(cmd));
        logger.info({ count: commands.length }, 'Programmatic Volley Injection confirmed.');
    }
}
