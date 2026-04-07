import * as net from 'net';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { Result, EngineOutput, YaoState, type SovereignKnock, type ConcealmentState } from '../../core/models.js';
const logger = createLogger('RSCLimb');
import { SovereignConfig } from '../../config/SovereignConfig.js';
import type { TernaryRouter } from '../../routing/TernaryRouter.js';
import { createLogger } from "../../utils/logger.js";

interface WorldState {
    player: { x: number; y: number; index: number };
    npcs: Map<number, any>;
    players: Map<number, any>;
    objects: any[];
}

/**
 * RSCLimb - Gameplay Interaction Substrate
 */
export class RSCLimb {
    private client: net.Socket | null = null;
    private serverProcess: ChildProcess | null = null;
    private state: WorldState = {
        player: { x: 0, y: 0, index: -1 },
        npcs: new Map(),
        players: new Map(),
        objects: []
    };
    private concealmentState: ConcealmentState = 'is'; // Concealed by default
    private router?: TernaryRouter;

    constructor(private readonly config: SovereignConfig) { }

    public setRouter(router: TernaryRouter): void {
        this.router = router;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const isProcessActive = this.serverProcess !== null;
        let details = `RSC Bridge: ${isProcessActive ? 'ACTIVE' : 'IDLE'}`;
        
        // Physical substrate check
        const serverDir = join(process.cwd(), 'openrsc-repo', 'server');
        const { existsSync } = await import('fs');
        const substrateExists = existsSync(serverDir);
        
        if (!substrateExists) {
            return { online: false, details: `${details} (ERROR: Substrate 'openrsc-repo' missing)` };
        }

        return {
            online: true,
            details: isProcessActive
                ? `${details} (Server PID: ${this.serverProcess?.pid})`
                : `${details} (Substrate READY, "Sovereign Knock" required for activation)`
        };
    }

    public async connectWithKnock(knock: SovereignKnock): Promise<Result<void>> {
        if (!this.router) return { ok: false, error: new Error('TernaryRouter not injected into RSCLimb') };

        // No TCP connection until knock validated
        logger.info('Received SovereignKnock on RSC Bridge. Validating...');
        const stateRes = await this.router.sovereignKnock(knock);

        if (!stateRes.ok) {
            logger.warn({ error: stateRes.error }, 'SovereignKnock REJECTED.');
            return { ok: false, error: stateRes.error };
        }

        this.concealmentState = stateRes.value;
        logger.info('SovereignKnock ACCEPTED. RSC Bridge exposed. Establishing connection...');

        return this.startServer();
    }

    public async startServer(): Promise<Result<void>> {
        if (this.serverProcess) return { ok: true, value: undefined };

        const serverDir = join(process.cwd(), 'openrsc-repo', 'server');
        const antPath = 'ant'; // Simplification for porting, assuming ant in PATH or config

        try {
            this.serverProcess = spawn(antPath, ['runserver'], { cwd: serverDir, shell: true });
            logger.info('RSC Server started.');
            return { ok: true, value: undefined };
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    public async login(username: string): Promise<Result<void>> {
        // Simplified login for porting
        logger.info({ username }, 'AI Logging into RSC...');
        return { ok: true, value: undefined };
    }

    public async walk(x: number, y: number): Promise<Result<void>> {
        logger.info({ x, y }, 'RSC Walk Command dispatched.');
        return { ok: true, value: undefined };
    }

    public async getPerception(): Promise<WorldState> {
        return this.state;
    }
}
