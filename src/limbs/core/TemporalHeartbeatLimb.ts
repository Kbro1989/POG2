import { createLogger } from '../../utils/logger.js';
import { CNSGodheadPulseVolley } from '../../engines/gameplay/CNSGodheadPulseVolley.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';
import { PlayerAgent } from '../../engines/gameplay/PlayerAgent.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';

const logger = createLogger('TemporalHeartbeatLimb');

/**
 * TemporalHeartbeatLimb - The Sovereign Heartbeat Motor.
 * 
 * Orchestrates the dual-rate pulse:
 *  - 600ms: Atomic World Tick (Physics, Movement, Cache Logic).
 *  - 6000ms: Cognitive Player Tick (Ollama Intents, High-level Strategy).
 */
export class TemporalHeartbeatLimb {
    private static instance: TemporalHeartbeatLimb;
    private worldInterval: NodeJS.Timeout | null = null;
    private worldTickCount: number = 0;

    private readonly WORLD_TICK_MS = 600;
    private readonly PLAYER_TICK_RATIO = 1; // 1:1 synchronization for pro-player reaction time
    private isCognitiveBusy = false;

    private constructor() {
        logger.info('TemporalHeartbeatLimb online. 600ms Synchronous Pulse established.');
    }

    public static getInstance(): TemporalHeartbeatLimb {
        if (!TemporalHeartbeatLimb.instance) {
            TemporalHeartbeatLimb.instance = new TemporalHeartbeatLimb();
        }
        return TemporalHeartbeatLimb.instance;
    }

    /**
     * start - Initiates the dual-rate heartbeat.
     */
    public start(): void {
        if (this.worldInterval) return;

        logger.info('Sovereign Heartbeat started. Synchronizing world/player loops.');

        this.worldInterval = setInterval(async () => {
            await this.pulse();
        }, this.WORLD_TICK_MS);
    }

    /**
     * stop - Halts the heartbeat.
     */
    public stop(): void {
        if (this.worldInterval) {
            clearInterval(this.worldInterval);
            this.worldInterval = null;
            logger.info('Sovereign Heartbeat halted.');
        }
    }

    /**
     * pulse - Executes a single authoritative world pulse.
     */
    public async pulse(): Promise<void> {
        this.worldTickCount++;

        // 1. World Tick (600ms) - Standard RS Heartbeat
        const volley = CNSGodheadPulseVolley.getInstance();
        const switchboard = SwitchboardLimb.getInstance();

        try {
            const pending = switchboard.drainAdminQueue();
            const state = await volley.pulse(pending);

            // 2. Spatial Radar Update (Sensory Cortex)
            // Render the world state to the CLI for grounding verification
            const renderer = volley.getRenderer();
            const avatar = volley.getAvatar();
            if (renderer && state && avatar) {
                const radar = (await import('../spatial/SpatialRadarLimb.js')).SpatialRadarLimb.getInstance();
                const grid = radar.render(state, avatar);
                renderer.drawRadar(grid);
            }

            // 3. Pro-Player Cognitive Tick (Sync 1:1)
            // Skip-on-Busy Guard: Never block the heartbeat if the brain is still thinking
            if (!this.isCognitiveBusy) {
                this.emitPlayerPulse();
            } else {
                logger.warn({ tick: this.worldTickCount }, 'Cognitive Skip: Substrate busy. Droping tick to maintain authority.');
            }

        } catch (e: any) {
            logger.error({ error: e.message, tick: this.worldTickCount }, 'Heartbeat pulse volley failure.');
        }
    }

    private async emitPlayerPulse(): Promise<void> {
        this.isCognitiveBusy = true;
        try {
            const playerTickNum = this.worldTickCount;
            logger.info({ tick: playerTickNum }, 'Emitting 600ms Pro-Player Cognitive Pulse.');

            const volley = CNSGodheadPulseVolley.getInstance();
            const avatar = volley.getAvatar();
            if (avatar) {
                const playerAgent = new PlayerAgent(avatar as SovereignAvatarEntity);
                playerAgent.advanceTick(this.WORLD_TICK_MS);

                // Tactical Evaluation (Safespotting Override)
                // Retrieve the field just broadcasted by CNSGodheadPulseVolley
                const GhostSplatEngine = (await import('../../substrates/GhostSplatEngine.js')).GhostSplatEngine;
                const field = GhostSplatEngine.getInstance().getLatestField();
                if (field) {
                    await playerAgent.evaluateTacticalPosition(field);

                    // Combat Evaluation (CombatRotationEngine)
                    if (avatar.metadata.tacticalState !== 'evading') {
                        const intent = playerAgent.evaluateCombatRotation(field, playerTickNum);
                        if (intent) {
                            avatar.intent = intent as any;
                        }
                    }
                }
            }

            // Phase 28: Trigger OllamaCognitiveLimb
            // await OllamaCognitiveLimb.getInstance().process(playerTickNum);

        } finally {
            this.isCognitiveBusy = false;
        }
    }

    public getStatus() {
        return {
            active: !!this.worldInterval,
            worldTick: this.worldTickCount,
            playerTick: this.worldTickCount,
            frequency: { world: '600ms', cognitive: '600ms (Authoritative)' },
            isBusy: this.isCognitiveBusy
        };
    }
}
