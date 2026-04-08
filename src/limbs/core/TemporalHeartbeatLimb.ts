import { createLogger } from '../../utils/logger.js';
import { CNSGodheadPulseVolley } from '../../engines/gameplay/CNSGodheadPulseVolley.js';
import { SwitchboardLimb } from '../../monitor/SwitchboardLimb.js';

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
    private readonly PLAYER_TICK_RATIO = 10; // 600ms * 10 = 6000ms

    private constructor() {
        logger.info('TemporalHeartbeatLimb online. 600ms/6000ms duality established.');
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
            await this.processPulse();
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

    private async processPulse(): Promise<void> {
        this.worldTickCount++;
        
        // 1. World Tick (600ms) - Standard RS Heartbeat
        const volley = CNSGodheadPulseVolley.getInstance();
        const switchboard = SwitchboardLimb.getInstance();
        
        try {
            const pending = switchboard.drainAdminQueue();
            await volley.pulse(pending);
            
            // 2. Player Tick (6000ms) - Cognitive Heartbeat
            if (this.worldTickCount % this.PLAYER_TICK_RATIO === 0) {
                this.emitPlayerPulse();
            }
            
        } catch (e: any) {
            logger.error({ error: e.message, tick: this.worldTickCount }, 'Heartbeat pulse volley failure.');
        }
    }

    private emitPlayerPulse(): void {
        const playerTickNum = Math.floor(this.worldTickCount / this.PLAYER_TICK_RATIO);
        logger.info({ playerTick: playerTickNum }, 'Emitting 6000ms Cognitive Pulse (Ollama Trigger).');
        
        // Phase 28: This is where we'll trigger the OllamaCognitiveLimb
        // to ingest current substrate state and emit intents.
    }

    public getStatus() {
        return {
            active: !!this.worldInterval,
            worldTick: this.worldTickCount,
            playerTick: Math.floor(this.worldTickCount / this.PLAYER_TICK_RATIO),
            frequency: { world: '600ms', player: '6000ms' }
        };
    }
}
