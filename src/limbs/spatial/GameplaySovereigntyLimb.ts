import { GameState } from '../../core/models.js';
import { SovereignAvatar } from '../../core/SovereignAvatar.js';
import { GameplayModule } from '../../engines/gameplay/MinigameInterfaces.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('GameplaySovereigntyLimb');

export class GameplaySovereigntyLimb {
    private isRunning: boolean = false;
    private tickInterval: NodeJS.Timeout | null = null;
    public tickCount: number = 0;
    
    // The overarching state matrix
    public globalState: GameState = {
        plane: 0,
        tickNumber: 0,
        players: new Map(),
        npcMap: new Map(),
        npcSpatialIndex: new Map(),
        objectMap: new Map(),
        playerInventory: [],
        varbits: new Map() // Universal server varbits (e.g., global Voice of Seren rotation)
    };

    public avatar: SovereignAvatar;
    private activeModule: GameplayModule | null = null;

    constructor() {
        this.avatar = new SovereignAvatar('POG2_Sovereign');
        this.globalState.players!.set(this.avatar.username, this.avatar as any);
        logger.info('GameplaySovereigntyLimb booted with initial Avatar state.');
    }

    /**
     * Docks a specific Region/Minigame logic module onto the active server.
     */
    public async mountModule(module: GameplayModule) {
        logger.info(`Mounting Gameplay Module: ${module.name}`);
        this.activeModule = module;
        await this.activeModule.mount(this.globalState, this.avatar);
        logger.info(`Module ${module.name} loaded and pedagogy synthesized.`);
    }

    /**
     * Engages the 600ms continuous real-time execution loop.
     */
    public startClock() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.tickInterval = setInterval(() => this.processTick(), 600);
        logger.info('Standard 600ms Sovereign Server Clock started.');
    }

    /**
     * Halts the real-time execution loop.
     */
    public stopClock() {
        this.isRunning = false;
        if (this.tickInterval) clearInterval(this.tickInterval);
        logger.info('Server Clock stopped.');
    }

    /**
     * Executes a single mechanical tick manually (allows CLI step-throughs without a real-time thread).
     */
    public forceTick(): string | null {
        return this.processTick();
    }

    /**
     * Replicating the absolute '600ms' Server Engine tick.
     */
    private processTick(): string | null {
        this.tickCount++;
        this.globalState.tickNumber = this.tickCount;

        // Process Avatar spatial movement / locks
        this.avatar.processTick();

        // Process Module Logic (e.g., spawn rotations, Varbit shifting)
        if (this.activeModule) {
            return this.activeModule.onTick(this.tickCount, this.globalState, this.avatar);
        }

        return null;
    }

    /**
     * Pushes an interaction event from the CLI REPL into the logic engine.
     */
    public pushAction(action: string): string {
        if (!this.activeModule) {
            return "[Engine] No active gameplay module mounted to process the action.";
        }
        
        // Ensure character can act
        if (this.avatar.isBusy()) {
            return `[Engine] You are busy locking an action for ${this.avatar.lockTicks} more ticks.`;
        }

        return this.activeModule.onAction(action, this.globalState, this.avatar);
    }
}
