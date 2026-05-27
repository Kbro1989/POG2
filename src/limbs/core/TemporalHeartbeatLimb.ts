import { createLogger } from '../../utils/logger.js';
import { CNSGodheadPulseVolley } from '../../engines/gameplay/CNSGodheadPulseVolley.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';
import { PlayerAgent } from '../../engines/gameplay/PlayerAgent.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { CanonicalClock, TickTier } from '../../utils/CanonicalClock.js';

const logger = createLogger('TemporalHeartbeatLimb');

/**
 * TemporalHeartbeatLimb - The Sovereign Heartbeat Motor.
 * 
 * Refactored: Now registered to the CanonicalClock substrate to ensure 
 * deterministic synchronization across all sovereign limbs.
 */
export class TemporalHeartbeatLimb {
    private static instance: TemporalHeartbeatLimb;
    private worldTickCount: number = 0;
    private isCognitiveBusy = false;

    private constructor() {
        logger.info('TemporalHeartbeatLimb online. Anchored to CanonicalClock.');
        this.initializeSovereignPulse();
    }

    public static getInstance(): TemporalHeartbeatLimb {
        if (!TemporalHeartbeatLimb.instance) {
            TemporalHeartbeatLimb.instance = new TemporalHeartbeatLimb();
        }
        return TemporalHeartbeatLimb.instance;
    }

    private initializeSovereignPulse(): void {
        CanonicalClock.getInstance().registerPulse({
            domain: 'temporal-motor',
            name: 'TemporalHeartbeatLimb.pulse',
            priority: 0,
            callback: () => this.pulse()
        });
        logger.info('TemporalHeartbeatLimb pulse registered to CanonicalClock.');
    }

    public async pulse(): Promise<void> {
        this.worldTickCount++;

        // 1. World Tick (600ms) - Standard RS Heartbeat
        const volley = CNSGodheadPulseVolley.getInstance();
        const switchboard = SwitchboardLimb.getInstance();

        try {
            const pending = switchboard.drainAdminQueue();
            const state = await volley.pulse(pending);

            // 2. Spatial Radar Update
            const renderer = volley.getRenderer();
            const avatar = volley.getAvatar();
            if (renderer && state && avatar) {
                const radar = (await import('../spatial/SpatialRadarLimb.js')).SpatialRadarLimb.getInstance();
                const grid = radar.render(state, avatar);
                renderer.drawRadar(grid);
            }

            // 3. Pro-Player Cognitive Tick (Sync 1:1)
            if (!this.isCognitiveBusy) {
                this.emitPlayerPulse();
            } else {
                logger.warn({ tick: this.worldTickCount }, 'Cognitive Skip: Substrate busy.');
            }

        } catch (e: any) {
            logger.error({ error: e.message, tick: this.worldTickCount }, 'Heartbeat pulse failure.');
        }
    }

    private async emitPlayerPulse(): Promise<void> {
        this.isCognitiveBusy = true;
        try {
            const playerTickNum = this.worldTickCount;
            const volley = CNSGodheadPulseVolley.getInstance();
            const avatar = volley.getAvatar();
            if (avatar) {
                const playerAgent = new PlayerAgent(avatar as SovereignAvatarEntity);
                playerAgent.advanceTick(600);

                const GhostSplatEngine = (await import('../../substrates/GhostSplatEngine.js')).GhostSplatEngine;
                const field = GhostSplatEngine.getInstance().getLatestField();
                if (field) {
                    await playerAgent.evaluateTacticalPosition(field);

                    if (avatar.metadata.tacticalState !== 'evading') {
                        const intent = playerAgent.evaluateCombatRotation(field, playerTickNum);
                        if (intent) {
                            avatar.intent = intent as any;
                        }
                    }
                }
            }
        } finally {
            this.isCognitiveBusy = false;
        }
    }

    public getStatus() {
        return {
            worldTick: this.worldTickCount,
            frequency: '600ms (CanonicalClock)',
            isBusy: this.isCognitiveBusy
        };
    }
}
