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
import { CacheForensicsLimb } from '../limbs/spatial/CacheForensicsLimb.js';
import { WorldForensicsLimb } from '../limbs/spatial/WorldForensicsLimb.js';
import { getAtlasSpatialPath } from '../utils/SovereignPathResolver.js';
import fs from 'fs';
import { WikiEnricher } from '../utils/WikiEnricher.js';
import { I1841CacheTranslator } from '../limbs/pedagogy/Interface1841ActionBarMapping.js';
import { ABILITY_LIBRARY } from '../limbs/pedagogy/SovereignAvatarActionBarVolition.js';
import { ImageArtifactCleaner } from '../utils/ImageArtifactCleaner.js';


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
        // Start periodic image cleanup every 5 minutes
        ImageArtifactCleaner.startPeriodicCleaner();
        logger.info('Switchboard Kernel Initialized. Image artifact cleaner started.');
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

                // Throttled request logger — suppress repetitive static/radar noise
                const _loggedUrls = new Map<string, number>();
                app.use((req, res, next) => {
                    const url = req.url;
                    // Skip noisy paths entirely
                    const isNoise = url === '/ping'
                        || url.endsWith('.html')
                        || url.endsWith('.js')
                        || url.endsWith('.css')
                        || url.endsWith('.ico')
                        || url.endsWith('.png')
                        || url.endsWith('.jpg')
                        || url.endsWith('.svg')
                        || url.endsWith('.map');
                    if (!isNoise) {
                        logger.info({ method: req.method, url }, '[SWITCHBOARD] Incoming Request');
                    }
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

                app.get('/api/sovereignty/source', (req, res) => {
                    const source = (globalThis as any).SOVEREIGN_SUBSTRATE || 'ATLAS_FALLBACK';
                    res.json({ 
                        source, 
                        atlasDir: 'D:/POG2/atlas/spatial',
                        cacheDir: 'D:/sovereign/cache_pedagogy/rsmv_inspector/generated'
                    });
                });

                app.get('/api/abilities', (req, res) => {
                    res.json(ABILITY_LIBRARY);
                });

                app.get('/api/actionbar', (req, res) => {
                    try {
                        const filePath = 'D:/POG2/scratch/interface_1841_actionbar.json';
                        let rawData: any;
                        if (fs.existsSync(filePath)) {
                            rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        } else {
                            // Fallback minimal JSON
                            rawData = {
                                interfaceId: 1841,
                                components: [
                                    {
                                        componentId: 2,
                                        type: "CONTAINER",
                                        parentId: 65535,
                                        children: [3, 4, 5, 6],
                                        scripts: { load: [13138, -2147483645] }
                                    },
                                    {
                                        componentId: 11,
                                        type: "CONTAINER",
                                        parentId: 5,
                                        children: [0, 12],
                                        scripts: { load: [13133, -1, -2147483645, 120651776, -1, 120651788, 5] }
                                    }
                                ]
                            };
                        }
                        
                        const translated = I1841CacheTranslator.translate(rawData);
                        
                        // Populate with live abilities if gameState is active, otherwise default simulation layout
                        if (this.gameState && this.gameState.avatar && this.gameState.avatar.actionBarSlots) {
                            const slots = this.gameState.avatar.actionBarSlots;
                            for (let i = 0; i < translated.slots.length; i++) {
                                const abilityKey = slots[i];
                                if (abilityKey) {
                                    const upperKey = abilityKey.toUpperCase();
                                    const abilityDef = ABILITY_LIBRARY[upperKey];
                                    if (abilityDef) {
                                        translated.slots[i].abilityId = upperKey as any;
                                        translated.slots[i].abilityName = abilityDef.name;
                                        (translated.slots[i] as any).cooldownTotal = abilityDef.cooldown;
                                        (translated.slots[i] as any).adrenalineCost = abilityDef.adrenReq;
                                        (translated.slots[i] as any).tier = abilityDef.tier;
                                        (translated.slots[i] as any).style = abilityDef.style.toLowerCase();
                                        (translated.slots[i] as any).isAvailable = true;
                                    } else {
                                        translated.slots[i].abilityId = upperKey as any;
                                        translated.slots[i].abilityName = abilityKey;
                                    }
                                }
                            }
                        } else {
                            const styleReq = (req.query.style as string)?.toUpperCase() || 'RANGED';
                            let defaultLayout: (string | null)[];
                            
                            if (styleReq === 'MELEE') {
                                defaultLayout = ['SEVER', 'SMASH', 'BACKHAND', 'SLAUGHTER', 'HURRICANE', 'QUAKE', 'BERSERK', 'CLEAVE', 'DISMEMBER', 'FURY', 'ASSAULT', 'DESTROY', null, null];
                            } else if (styleReq === 'MAGIC') {
                                defaultLayout = ['WRACK', 'DRAGON_BREATH', 'SONIC_WAVE', 'CONC_BLAST', 'COMBUST', 'WILD_MAGIC', 'ASPHYXIATE', 'SUNSHINE', 'TSUNAMI', 'OMNIPOWER', 'DETONATE', 'CHAIN', null, null];
                            } else {
                                // Default beautiful Ranged layout to match diagnostic HUD parity
                                defaultLayout = ['GALESHOT', 'RICOCHET', 'PIERCING_SHOT', 'SNIPE', 'CORR_SHOT', 'SNAP_SHOT', 'RAPID_FIRE', 'S_TENDRILS', 'BOMBARDMENT', 'DEATHS_SWIFT', 'DEADSHOT', 'IMBUE_SHADOW', null, null];
                            }

                            for (let i = 0; i < translated.slots.length; i++) {
                                const abilityKey = defaultLayout[i];
                                if (abilityKey) {
                                    const upperKey = abilityKey.toUpperCase();
                                    const abilityDef = ABILITY_LIBRARY[upperKey];
                                    if (abilityDef) {
                                        translated.slots[i].abilityId = upperKey as any;
                                        translated.slots[i].abilityName = abilityDef.name;
                                        (translated.slots[i] as any).cooldownTotal = abilityDef.cooldown;
                                        (translated.slots[i] as any).adrenalineCost = abilityDef.adrenReq;
                                        (translated.slots[i] as any).tier = abilityDef.tier;
                                        (translated.slots[i] as any).style = abilityDef.style.toLowerCase();
                                        (translated.slots[i] as any).isAvailable = true;
                                    }
                                }
                            }
                        }
                        
                        res.json(translated);
                    } catch (err: any) {
                        logger.error({ err }, '[SWITCHBOARD] /api/actionbar failed');
                        res.status(500).json({ error: err.message });
                    }
                });

                app.get('/world/:filename', async (req, res, next) => {
                    const match = req.params.filename.match(/^ms_(\d+)_(\d+)\.json$/);
                    if (!match) {
                        return next();
                    }
                    try {
                        const rx = parseInt(match[1]);
                        const ry = parseInt(match[2]);
                        const filename = req.params.filename;
                        const localPath = join(worldExtractDir, filename);

                        if (fs.existsSync(localPath)) {
                            return res.sendFile(localPath);
                        }

                        logger.info(`[SWITCHBOARD] ⚡ Attempting to load Mapsquare data for [${rx}, ${ry}]`);
                        
                        // Try to load from pre-generated atlas data
                        const cachedPath = join(worldExtractDir, `${rx}_${ry}.json`);
                        if (fs.existsSync(cachedPath)) {
                            logger.info(`[SWITCHBOARD] Loading cached mapsquare from ${cachedPath}`);
                            const tilesData = JSON.parse(fs.readFileSync(cachedPath, 'utf8'));
                            const collisionMatrix: any = {};
                            if (tilesData && tilesData.tiles) {
                                for (const tile of tilesData.tiles) {
                                    const wx = (rx * 64) + tile.x;
                                    const wy = (ry * 64) + tile.z;
                                    const plane = tile.plane;
                                    const key = `${plane}_${wx}_${wy}`;

                                    const flag = tile.collision || 0;
                                    const isBlocked = (flag & 1) !== 0; // Standard 0x1 standard solid/blocking
                                    const isOverlay = (flag & 2) !== 0;
                                    const isWater = (flag & 128) !== 0;

                                    let surfaceType = 'terrain';
                                    if (isOverlay) surfaceType = 'bridge';
                                    else if (isWater) surfaceType = 'water';

                                    collisionMatrix[key] = {
                                        walkable: !isBlocked,
                                        surfaceType,
                                        edges: {
                                            northBlocked: false,
                                            southBlocked: false,
                                            eastBlocked: false,
                                            westBlocked: false
                                        },
                                        sourceFlags: flag
                                    };
                                }
                            }

                            const syntheticExport = {
                                rx,
                                ry,
                                collision_matrix: collisionMatrix,
                                entities: []
                            };

                            if (!fs.existsSync(worldExtractDir)) {
                                fs.mkdirSync(worldExtractDir, { recursive: true });
                            }
                            fs.writeFileSync(localPath, JSON.stringify(syntheticExport, null, 2));
                            logger.info(`[SWITCHBOARD] ✅ Mapsquare [${rx}, ${ry}] loaded from cache.`);

                            return res.json(syntheticExport);
                        } else {
                            logger.warn(`[SWITCHBOARD] No cached mapsquare available for [${rx}, ${ry}]`);
                            return res.status(404).json({ 
                                error: `Mapsquare [${rx}, ${ry}] not in cache. Generate via POG2 atlas extraction or static maps.`
                            });
                        }
                    } catch (err: any) {
                        logger.error({ err }, '[SWITCHBOARD] Mapsquare load failed');
                        return res.status(500).json({ error: err.message });
                    }
                });

                app.use('/captures', express.static(eyeDir));
                app.use('/unified', express.static(unifiedDir));
                app.use('/world', express.static(worldExtractDir));
                app.use('/regions', express.static(regionsDir));
                app.use(express.static(publicDir));

                app.get('/ping', (req, res) => res.json({ status: 'PULSE_ACTIVE', timestamp: Date.now() }));

                app.get('/api/enrich', async (req, res) => {
                    try {
                        const type = req.query.type as string; // 'npc' or 'item' or 'object'
                        const id = parseInt(req.query.id as string || '0');
                        const name = req.query.name as string;

                        let cacheData: any = null;
                        let queryName = name;

                        if (id) {
                            const cacheForensics = CacheForensicsLimb.getInstance();
                            if (type === 'npc') {
                                const r = await cacheForensics.getNpcDetails(id);
                                if (r.ok) {
                                    cacheData = r.value;
                                    queryName = r.value.name;
                                }
                            } else if (type === 'item') {
                                const r = await cacheForensics.getItemDetails(id);
                                if (r.ok) {
                                    cacheData = r.value;
                                    queryName = r.value.name;
                                }
                            } else if (type === 'object') {
                                const r = await cacheForensics.getObjectDetails(id);
                                if (r.ok) {
                                    cacheData = r.value;
                                    queryName = r.value.name;
                                }
                            }
                        }

                        if (!queryName) {
                            return res.status(400).json({ error: 'Name or ID required' });
                        }

                        const wikiRes = await WikiEnricher.enrich(queryName);
                        if (!wikiRes.ok) {
                            return res.json({
                                name: queryName,
                                role: type ? type.toUpperCase() : 'Unknown',
                                intent: 'Wiki lookup failed or not found',
                                url: 'https://runescape.wiki',
                                cacheData
                            });
                        }

                        return res.json({
                            ...wikiRes.value,
                            cacheData
                        });
                    } catch (e: any) {
                        logger.error({ err: e }, '[SWITCHBOARD] /api/enrich failed');
                        return res.status(500).json({ error: e.message });
                    }
                });

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

                    let _lastWsLogTime = 0;

                    wss.on('connection', (ws: WebSocket) => {
                        const now = Date.now();
                        if (now - _lastWsLogTime > 30000) {
                            logger.info('External client connected to Switchboard Bridge.');
                            _lastWsLogTime = now;
                        }

                        ws.on('message', async (data: string) => {
                            try {
                                const msg = JSON.parse(data);
                                if (msg.type === 'command') {
                                    logger.info({ intent: msg.intent }, 'Bridge received task command');

                                    // Fast-path for Live Cache Radar bypasses the slow LLM
                                    if (typeof msg.intent === 'string' && msg.intent.startsWith('GET_LIVE_rsmv')) {
                                        const parts = msg.intent.split(' ');
                                        const x = parseInt(parts[1] || '3200');
                                        const z = parseInt(parts[2] || '3200');
                                        const plane = parseInt(parts[3] || '0');

                                        logger.info(`[SWITCHBOARD] ⚡ Requesting LIVE rsmv Extraction at [${x}, ${z}, ${plane}]`);

                                        const MAX_RETRIES = 3;
                                        const RETRY_BASE_MS = 2000;
                                        let lastError = 'Unknown extraction failure';
                                        const worldForensics = WorldForensicsLimb.getInstance();

                                        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                                            const result = await worldForensics.getTerrainFlags(x, z, plane);

                                            if (result && result > 0) {
                                                ws.send(JSON.stringify({ type: 'result', ok: true, value: { type: 'COLLISION_DATA', collision: result }, error: null }));
                                                return;
                                            }

                                            lastError = 'Collision data not available';
                                            if (attempt < MAX_RETRIES) {
                                                const waitMs = RETRY_BASE_MS * attempt;
                                                logger.warn({ attempt, waitMs, err: lastError }, `[SWITCHBOARD] collision extraction failed, retrying in ${waitMs}ms...`);
                                                await new Promise(r => setTimeout(r, waitMs));
                                            }
                                        }

                                        logger.error({ retries: MAX_RETRIES, err: lastError }, '[SWITCHBOARD] rsmv extraction exhausted all retries');
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

