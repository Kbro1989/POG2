import { getLastIOLatencyMs } from '../../utils/RSMVBridge.js';
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
    private readonly TICK_INTERVAL = 600; // 600ms Pulse
    private readonly BUDGET_MS = 200;      // Warning threshold for tick overflow
    
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
    private readonly ledger = CNSCausalityLedger.getInstance();
    private pulseStartTime: number = 0;
    private readonly PULSE_DEADLINE_MS = 600;
    private deferredOps: Array<() => Promise<void>> = [];

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
        logger.info('CNS Godhead Pulse (Hardened Heartbeat) Started.');
        
        // Phase 112: Immediate bootstrap tick
        this.tick();
    }

    private async tick(): Promise<void> {
        const start = performance.now();
        this.tickCount++;

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
            if (this.substrateState === SubstrateState.ONLINE && this.vision) {
                // We do NOT await this, as LLM vision latency often exceeds the 600ms tick budget.
                // It runs as a 'sidecar' verification that logs drift but doesn't stall the world logic.
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


    /**
     * pulse - The 7-step deterministic execution loop.
     */
    public async pulse(commands: AdminCommand[]): Promise<GameState | undefined> {
        this.pulseStartTime = performance.now();
        this.resolve();
        // 1. Collect & Normalize
        const events = commands.map(cmd => this.createTickEvent(cmd));

        // 2. Sort (Priority -> Time -> ID)
        const sorted = this.sortEvents(events);

        // 3. Resolve Conflicts (Tile Locking)
        const resolved = this.resolveConflicts(sorted);

        // 4. Atomic World Transaction
        const tx = this.grounding!.beginTick();

        // 5. Execute valid events
        for (const event of resolved) {
            if (event.outcome === "SUCCESS") {
                await this.executeEvent(tx, event);
            }
            // 6. Record Outcome
            this.ledger.record(event);
        }

        // Apply world changes
        await this.grounding!.commitTick(tx);

        // Authoritative Gameplay Tick
        await this.gameplay!.processTick();

        if (this.gameplay?.globalState) {
            let playerAgent: PlayerAgent | undefined;
            if (this.gameplay.avatar) {
                playerAgent = new PlayerAgent(this.gameplay.avatar);
            }
            const field = this.ghostSplat!.project(this.gameplay.globalState, 3, playerAgent);
            if (field) {
                this.switchboard!.broadcastGhostSplat(field);
            }
        }

        // 7. Commit Ledger (Logs & history rotation)
        this.ledger.commitTick();

        const elapsed = performance.now() - this.pulseStartTime;
        if (elapsed > this.PULSE_DEADLINE_MS * 0.8) {
            logger.warn({ duration: elapsed.toFixed(1) }, `[CNS] Pulse at ${elapsed.toFixed(1)}ms, deferring ${this.deferredOps.length} ops`);
        }

        // Execute deferred work post-pulse
        while (this.deferredOps.length > 0) {
            const op = this.deferredOps.shift();
            if (op) await op().catch(e => logger.error({ err: e }, `[CNS] Deferred op failed`));
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
                    // DEFERRED: Spatial recalculation off main pulse
                    setImmediate(() => {
                        this.grounding!.applyWorldTransform(tx, { x: event.coord!.x, y: event.coord!.y, z: event.coord!.z }).catch(err => 
                            logger.error({ err: err.message }, `[CNS] Deferred transform failed`)
                        );
                    });
                    logger.debug({ coords: event.coord }, '[VOLLEY] SPATIAL_SHIFT deferred for next tick.');
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
                    // DEFERRED: Entity spawn off main pulse
                    this.grounding!.spawnEntity(tx, defWithId).catch(err =>
                        logger.error({ err: err.message }, `[CNS] Deferred spawn failed`)
                    );
                    logger.debug({ id: sid }, '[VOLLEY] ENTITY_MANIFEST staged for async spawn.');
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
