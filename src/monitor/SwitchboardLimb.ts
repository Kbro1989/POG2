import { type Result, ok, type WorldDelta, type LearningTrace } from '../core/models.js';
import { GlobeReconciliationKernel } from '../routing/GlobeReconciliationKernel.js';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { join } from 'path';
import { createLogger } from "../utils/logger.js";
import { EventBus } from '../events/EventBus.js';
import { DBRowOracleLimb } from '../limbs/spatial/DBRowOracleLimb.js';
import { PedagogyForensicsLimb } from '../limbs/pedagogy/PedagogyForensicsLimb.js';
import { getAtlasSpatialPath } from '../utils/SovereignPathResolver.js';
import { rsmvBridge } from '../utils/RSMVBridge.js';

const logger = createLogger('SwitchboardLimb');

export interface AdminCommand {
    type: string;
    metadata?: any;
}

/**
 * SwitchboardLimb - Dynamic Resource Routing
 * Centralized ingress for bridge commands and task orchestration.
 * Implementation: Hardened Singleton with Deterministic Queue.
 */
export class SwitchboardLimb {
    private static instance: SwitchboardLimb | undefined;
    private wss: WebSocketServer | null = null;
    private server: HttpServer | null = null;
    private activePort: number | null = null;
    
    private adminQueue: AdminCommand[] = [];
    private gameState: any = null;
    private privilege: string = 'standard';

    protected constructor() {
        if (SwitchboardLimb.instance) {
            throw new Error('Singleton violation: use SwitchboardLimb.getInstance()');
        }
    }

    public static getInstance(): SwitchboardLimb {
        if (!this.instance) {
            this.instance = new SwitchboardLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }
    
    /**
     * initialize - Explicit lifecycle start.
     */
    public initialize(): void {
        this.reset();
        logger.info('Switchboard Kernel Initialized.');
    }

    /**
     * reset - Clear queue and authority (for deterministic tests).
     */
    public reset(): void {
        this.adminQueue = [];
        this.privilege = 'standard';
    }

    /**
     * injectSubstrates - Sets up dependencies for the switchboard.
     */
    public injectSubstrates(substrates: { nodeTester: any, endpointHealer: any }): void {
        this.injectSubstratesInternal = substrates;
        logger.debug('Substrates injected into Switchboard Bridge.');
    }

    private injectSubstratesInternal: any = null;

    /**
     * startServer - Initializes the external bridge server.
     */
    public async startServer(port: number, orchestrator: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const app = express();
                
                // Allow Cross-Origin Requests for local diagnostics
                app.use((req, res, next) => {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    res.header('Access-Control-Allow-Private-Network', 'true');
                    
                    // Permissive CSP for local Sovereign substrates
                    res.header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src 'self' ws: wss: http: https: *; img-src 'self' data: http: https: *;");
                    
                    if (req.method === 'OPTIONS') {
                        return res.sendStatus(200);
                    }
                    next();
                });

                app.use((req, res, next) => {
                    logger.info({ method: req.method, url: req.url }, '[SWITCHBOARD] Incoming Request');
                    next();
                });

                const server = createServer(app);
                
                // Serve SovereignEye captures via HTTP
                const eyeDir = join(process.cwd(), 'captures', 'sovereign_eye');
                const publicDir = join(process.cwd(), 'public');
                const spatialRoot = getAtlasSpatialPath();
                const regionsDir = join(spatialRoot, 'regions');
                const unifiedDir = join(spatialRoot, 'unified_extract');
                const worldExtractDir = join(spatialRoot, 'world_extract');
                
                app.use('/captures', express.static(eyeDir));
                app.use('/unified', express.static(unifiedDir));
                app.use('/world', express.static(worldExtractDir));
                app.use('/regions', express.static(regionsDir));
                app.use(express.static(publicDir));

                app.get('/ping', (req, res) => res.json({ status: 'PULSE_ACTIVE', timestamp: Date.now() }));

                let wss: WebSocketServer | null = null;

                server.on('error', (err: any) => {
                    logger.error({ err }, '[SWITCHBOARD] HTTP Server Error');
                    if (wss) wss.close();
                    server.close();
                    reject(err);
                });

                server.listen(port, '0.0.0.0', () => {
                    logger.info(`[SWITCHBOARD] Bridge ONLINE on port ${port} (0.0.0.0)`);
                    wss = new WebSocketServer({ server });
                    this.server = server;
                    this.wss = wss;
                    this.activePort = port;

                    wss.on('connection', (ws: WebSocket) => {
                        logger.info('External client connected to Switchboard Bridge.');

                        ws.on('message', async (data: string) => {
                            try {
                                const msg = JSON.parse(data);
                                if (msg.type === 'command') {
                                    logger.info({ intent: msg.intent }, 'Bridge received task command');
                                    
                                    // Fast-path for Live Cache Radar bypasses the slow LLM
                                    if (typeof msg.intent === 'string' && msg.intent.startsWith('GET_LIVE_RSMV')) {
                                        const parts = msg.intent.split(' ');
                                        const x = parseInt(parts[1] || '3200');
                                        const z = parseInt(parts[2] || '3200');
                                        const plane = parseInt(parts[3] || '0');
                                        
                                        logger.info(`[SWITCHBOARD] ⚡ Requesting LIVE RSMV Extraction at [${x}, ${z}, ${plane}]`);
                                        
                                        const MAX_RETRIES = 3;
                                        const RETRY_BASE_MS = 2000;
                                        let lastError = 'Unknown extraction failure';
                                        
                                        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                                            const result = await rsmvBridge.getCollision(x, z, plane);
                                            
                                            if (result.ok) {
                                                ws.send(JSON.stringify({ type: 'result', ok: true, value: { type: 'LIVE_RSMV', ...result.value }, error: null }));
                                                return;
                                            }
                                            
                                            lastError = result.error.message;
                                            if (attempt < MAX_RETRIES) {
                                                const waitMs = RETRY_BASE_MS * attempt;
                                                logger.warn({ attempt, waitMs, err: lastError }, `[SWITCHBOARD] RSMV extraction failed, retrying in ${waitMs}ms...`);
                                                await new Promise(r => setTimeout(r, waitMs));
                                            }
                                        }
                                        
                                        logger.error({ retries: MAX_RETRIES, err: lastError }, '[SWITCHBOARD] RSMV extraction exhausted all retries');
                                        ws.send(JSON.stringify({ type: 'result', ok: false, value: null, error: lastError }));
                                        return;
                                    }
                                    
                                    const result = await orchestrator.run(msg.intent);
                                    ws.send(JSON.stringify({ type: 'result', ok: result.ok, value: result.value, error: result.error }));
                                } else if (msg.type === 'ADMIN_COMMAND') {
                                    // Authoritative Ingress Path (Phase 29)
                                    this.pushAdminCommand({
                                        type: msg.payload.command,
                                        metadata: { ...msg.payload.args, timestamp: msg.payload.timestamp }
                                    });
                                } else if (msg.type === 'CONSOLE_COMMAND') {
                                    logger.info({ cmd: msg.payload }, 'Bridge received console command');
                                    // Handle standard console commands via orchestrator if needed
                                    await orchestrator.run(msg.payload);
                                }
                            } catch (err) {
                                logger.error({ err }, 'Failed to process bridge message');
                                ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }));
                            }
                        });

                        ws.send(JSON.stringify({ type: 'welcome', status: 'Sovereign Bridge ACTIVE' }));
                    });

                    logger.info(`Switchboard Bridge listening on port ${port}`);
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * startWithGracefulPort - Checks for available ports starting from a base.
     */
    public async startWithGracefulPort(orchestrator: any, startPort: number = 8788): Promise<{ port: number, url: string }> {
        let currentPort = startPort;
        const maxTries = 20;

        for (let i = 0; i < maxTries; i++) {
            try {
                await this.startServer(currentPort, orchestrator);
                return { port: currentPort, url: `http://localhost:${currentPort}` };
            } catch (err: any) {
                if (err.code === 'EADDRINUSE') {
                    logger.warn({ port: currentPort }, 'Switchboard port in use, incrementing...');
                    currentPort++;
                    continue;
                }
                throw err;
            }
        }
        throw new Error(`Switchboard failed to bind to any port in range ${startPort}-${currentPort - 1}`);
    }

    /**
     * broadcast - Sends a message to all active bridge clients.
     */
    public broadcast(payload: any): void {
        if (!this.wss) return;
        const msg = JSON.stringify(payload);
        this.wss.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }

    /**
     * broadcastSubstrateDeepAudit - Pushes genomic integrity metrics to the HUD.
     * Tier: Epistemology (Knowing the State of Truth)
     */
    public broadcastSubstrateDeepAudit(): void {
        setImmediate(() => {
            const oracle = DBRowOracleLimb.getInstance();
            // ... existing logic ...
            const injectors = oracle.publishInjectors();
            const synthesizedCount = injectors.filter(i => i.authorityTier === 'SYNTHESIZED').length;
            const totalInjectors = injectors.length || 1;
            
            const integrityRatio = synthesizedCount / totalInjectors;
            const healthLevel = integrityRatio > 0.8 ? 'OPTIMAL' : integrityRatio > 0.4 ? 'DEGRADED' : 'CRITICAL';

            const auditMetadata = {
                integrity: (integrityRatio * 100).toFixed(2) + '%',
                synthesizedNodes: synthesizedCount,
                biologicalNodes: totalInjectors - synthesizedCount,
                health: healthLevel,
                timestamp: Date.now(),
                layer: 'Sovereign Substrate'
            };

            this.broadcast({
                type: 'SUBSTRATE_AUDIT',
                payload: auditMetadata
            });
            logger.info({ integrity: auditMetadata.integrity }, 'ðŸŒŒ Optimized Substrate Health Broadcasted.');
        });
    }

    /**
     * pushAdminCommand - Single Ingress Path for deterministic logic.
     */
    public pushAdminCommand(cmd: AdminCommand): void {
        this.adminQueue.push(cmd);
        logger.debug({ type: cmd.type }, 'Admin command enqueued in deterministic buffer.');
    }

    /**
     * getAdminQueue - Inspect the current pending authoritative commands.
     */
    public getAdminQueue(): AdminCommand[] {
        return this.adminQueue;
    }

    /**
     * clearAdminQueue - Drains the buffer (to be called by the Heartbeat).
     */
    public clearAdminQueue(): void {
        this.adminQueue = [];
    }

    /**
     * drainAdminQueue - Legacy egress path for the 600ms Godhead Pulse.
     */
    public drainAdminQueue(): AdminCommand[] {
        const batch = [...this.adminQueue];
        this.clearAdminQueue();
        return batch;
    }

    /**
     * setPrivilege - Authoritative elevation.
     */
    public setPrivilege(rank: string): void {
        this.privilege = rank;
        logger.info({ rank }, 'CNS Privilege Elevation Confirmed.');
    }

    /**
     * getPrivilege - Check current authority rank.
     */
    public getPrivilege(): string {
        return this.privilege;
    }

    /**
     * broadcastGhostSplat - Pushes the GhostSplatField to remote HUDs for predictive visualization.
     * Tier: Sensory (Predictive)
     */
    public broadcastGhostSplat(field: any): void {
        // Map objects don't JSON.stringify natively. Convert projections to array.
        const serializableField = {
            ...field,
            heatmap: Array.from(field.heatmap),
            entityHeat: field.entityHeat ? Array.from(field.entityHeat) : undefined,
            avatarHeat: field.avatarHeat ? Array.from(field.avatarHeat) : undefined,
            projections: field.projections instanceof Map 
                ? Array.from(field.projections.entries()) 
                : field.projections,
            gaussians: field.gaussians ? Array.from(field.gaussians) : undefined
        };

        this.broadcast({
            type: 'ghost_splat',
            timestamp: Date.now(),
            payload: serializableField
        });
    }

    /**
     * broadcastKernelDiagnostics - Pushes EpistemicTransitionKernel state to remote HUDs.
     * Includes: ChaosPhase, volatilityEMA, stabilityTrend, predictionAccuracy, phaseGateMultiplier.
     * Called from the CNS pulse loop to keep the public dashboard current.
     */
    public broadcastKernelDiagnostics(diagnostics: {
        phase: string;
        volatilityEMA: number;
        stabilityTrendEMA: number;
        predictionAccuracyEMA: number;
        phaseGateMultiplier: number;
        transitionCount: number;
        yaoState: string;
    }): void {
        this.broadcast({
            type: 'kernel_diagnostics',
            timestamp: Date.now(),
            payload: diagnostics
        });
    }

    /**
     * broadcastWorldDelta - Reconciles a live delta and broadcasts the result.
     */
    public async broadcastWorldDelta(delta: WorldDelta): Promise<void> {
        const kernel = GlobeReconciliationKernel.getInstance();
        kernel.ingestDelta(delta);
        
        const reconciliation = await kernel.reconcileTile(delta.x, delta.y, delta.z);
        
        this.broadcast({
            type: 'WORLD_DELTA_RECONCILIATION',
            timestamp: Date.now(),
            payload: {
                delta,
                reconciliation
            }
        });

        if (reconciliation.consensus !== 'STABLE') {
            logger.warn({ 
                tile: reconciliation.tile, 
                consensus: reconciliation.consensus, 
                uncertainty: reconciliation.uncertainty 
            }, 'Reality Disagreement Broadcasted to Globe.');
        }
    }

    /**
     * broadcastLearningTrace - Propagates a post-hoc causal explanation to the observation layer.
     */
    public broadcastLearningTrace(trace: LearningTrace): void {
        this.broadcast({
            type: 'CAUSAL_EXPLANATION',
            timestamp: Date.now(),
            payload: trace
        });
    }

    /**
     * syncGameState - Broadcasts the integrated POG2 world/player state to the UI.
     */
    public syncGameState(state: any) {
        this.gameState = state;
        this.broadcast({ type: 'GAME_STATE', payload: state });

        // Phase 19: Propagate player movement to the Global Consensus substrate
        if (state.avatar) {
            EventBus.getInstance().publish({
                type: 'direct_perception',
                source: 'Switchboard',
                payload: {
                    entityId: 'player_sovereign',
                    name: state.avatar.username || 'Sovereign',
                    x: state.avatar.x,
                    y: state.avatar.y,
                    plane: state.avatar.plane,
                    timestamp: Date.now()
                }
            });
        }
    }

    /**
     * connectToSubstrates - Hooks into Renderer and SovereignEye for remote mirroring.
     */
    public connectToSubstrates(renderer: any, eye: any): void {
        if (renderer && typeof renderer.onOutput === 'function') {
            renderer.onOutput((payload: any) => {
                this.broadcast({
                    type: 'log',
                    timestamp: Date.now(),
                    ...payload
                });
            });
        } else {
            logger.debug('Renderer substrate does not implement onOutput â€” telemetry mirroring skipped.');
        }

        // Guard: VisionEngine may not implement EventEmitter
        if (eye && typeof eye.on === 'function') {
            eye.on('capture', (capture: any) => {
                this.broadcast({
                    type: 'vision',
                    timestamp: Date.now(),
                    capture
                });
            });
        } else {
            logger.debug('SovereignEye substrate does not support EventEmitter â€” vision mirroring skipped.');
        }
    }

    /**
     * connect - Establishes a flow between two neurological nodes.
     */
    public async connect(source: string, target: string): Promise<Result<boolean>> {
        logger.info({ source, target }, 'Establishing neurological circuit...');
        return ok(true);
    }

    public healthCheck(): { online: boolean; details: string; retryable?: boolean } {
        const isOnline = this.server?.listening || false;
        return {
            online: isOnline,
            retryable: !isOnline,
            details: isOnline
                ? `Switchboard Bridge Active on port ${this.activePort}. ${this.wss?.clients.size || 0} remote mirroring links.`
                : 'Switchboard Bridge Offline.'
        };
    }

    /**
     * getActivePort - Returns the currently active port for dynamic discovery.
     */
    public getActivePort(): number | null {
        return this.activePort;
    }
}
