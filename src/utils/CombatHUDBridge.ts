import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('CombatHUDBridge');

export interface HUDStateUpdate {
    type: 'STATE_UPDATE';
    adrenaline: number;
    activeArchetype: string;
    combatStyle?: string;
    activePhase?: string;
    targetName?: string;
    targetHp?: number;
    lastAction?: string;
    activeRotation?: string;
    nextAbility?: string;
    kernelPhase?: string;
    learningTrace?: any;
}

export interface HUDLogUpdate {
    type: 'LOG_UPDATE';
    message: string;
    level: 'info' | 'action';
}

export interface HitsplatUpdate {
    type: 'HITSPLAT';
    value: number;
    kind: 'DAMAGE' | 'CRIT' | 'HEAL' | 'BLOCK' | 'POISON' | 'XP';
    entityId: string;
}

export class CombatHUDBridge {
    private static instance: CombatHUDBridge;
    private wss: WebSocketServer | null = null;
    private clients: Set<WebSocket> = new Set();
    private startTime: number = Date.now();
    private lastTickReceived: number = 0;
    private traceBuffer: any[] = []; // Simple buffer for the dashboard to pull from

    private constructor() {
        this.initServer();
    }

    public static getInstance(): CombatHUDBridge {
        if (!CombatHUDBridge.instance) {
            CombatHUDBridge.instance = new CombatHUDBridge();
        }
        return CombatHUDBridge.instance;
    }

    private initServer() {
        try {
            const server = createServer((req, res) => {
                if (req.url === '/health') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'alive', 
                        port: 8080, 
                        uptimeMs: Date.now() - this.startTime,
                        clientsConnected: this.clients.size,
                        lastTickReceived: this.lastTickReceived,
                        causalTracesBuffered: this.traceBuffer.length
                    }));
                    return;
                }

                // MIME types for static serving
                const MIME_TYPES: Record<string, string> = {
                    '.html': 'text/html',
                    '.js': 'application/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.svg': 'image/svg+xml',
                    '.ico': 'image/x-icon',
                };

                const url = new URL(req.url || '/', `http://localhost`);
                const pathname = url.pathname;

                // ─── API: /api/enrich ───
                if (pathname === '/api/enrich') {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    try {
                        const type = url.searchParams.get('type') || 'npc';
                        const nameQuery = url.searchParams.get('name') || '';
                        const idQuery = url.searchParams.get('id') || '';

                        const dumpDir = 'D:\\sovereign\\cache_pedagogy\\json_dumps';
                        const fileMap: Record<string, string> = { npc: 'npcs.json', item: 'items.json', object: 'objects.json' };
                        const fileName = fileMap[type] || 'npcs.json';
                        const dataPath = join(dumpDir, fileName);

                        if (!existsSync(dataPath)) {
                            res.end(JSON.stringify({ error: `Data file not found: ${fileName}` }));
                            return;
                        }

                        const entries: any[] = JSON.parse(readFileSync(dataPath, 'utf8'));
                        let match: any = null;

                        if (idQuery) {
                            match = entries.find((e: any) => e.id === parseInt(idQuery));
                        } else if (nameQuery) {
                            const q = nameQuery.toLowerCase();
                            match = entries.find((e: any) => e.name && e.name.toLowerCase() === q)
                                 || entries.find((e: any) => e.name && e.name.toLowerCase().includes(q));
                        }

                        if (match) {
                            res.end(JSON.stringify({
                                name: match.name,
                                role: type.toUpperCase(),
                                cacheData: { id: match.id, hp: match.hp || match.hitpoints || 0, ...match },
                                location: match.location || 'Cache Substrate',
                                url: `https://runescape.wiki/w/${encodeURIComponent(match.name.replace(/ /g, '_'))}`
                            }));
                        } else {
                            res.end(JSON.stringify({ name: nameQuery || `ID ${idQuery}`, role: type.toUpperCase(), error: 'Not found in cache dump' }));
                        }
                    } catch (e) {
                        res.end(JSON.stringify({ error: 'Enrich API error' }));
                    }
                    return;
                }

                // ─── API: /api/actionbar ───
                if (pathname === '/api/actionbar') {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    try {
                        const regPath = 'D:\\sovereign\\memory\\pedagogy\\sovereign_ability_registry.json';
                        if (existsSync(regPath)) {
                            const reg = JSON.parse(readFileSync(regPath, 'utf8'));
                            const style = (url.searchParams.get('style') || 'ranged').toLowerCase();
                            const styleAbilities = reg.styles?.[style] || [];
                            const slots = styleAbilities.slice(0, 14).map((name: string, i: number) => ({
                                slotIndex: i,
                                abilityId: name.toLowerCase().replace(/[\s()]/g, '_'),
                                abilityName: name,
                                style,
                                tier: 'basic',
                                cooldownTotal: 5,
                                adrenalineCost: 0,
                                adrenalineThreshold: 0
                            }));
                            res.end(JSON.stringify({ style, slots }));
                        } else {
                            res.end(JSON.stringify({ style: 'ranged', slots: [] }));
                        }
                    } catch (e) {
                        res.end(JSON.stringify({ style: 'ranged', slots: [] }));
                    }
                    return;
                }

                // ─── Mounted Sovereign Data Directories ───
                const mountedPaths: Record<string, string> = {
                    '/interfaces/': 'D:\\sovereign\\cache_pedagogy\\atlas\\interfaces',
                    '/dumps/': 'D:\\sovereign\\cache_pedagogy\\json_dumps',
                    '/pedagogy/': 'D:\\sovereign\\memory\\pedagogy',
                    '/scratch/': join(process.cwd(), 'scratch'),
                    '/pvme/': join(process.cwd(), 'data', 'pvme'),
                    '/atlas/': join(process.cwd(), 'atlas'),
                };

                for (const [prefix, root] of Object.entries(mountedPaths)) {
                    if (pathname.startsWith(prefix)) {
                        const relativePath = pathname.slice(prefix.length);
                        const resolved = join(root, relativePath);
                        try {
                            if (existsSync(resolved)) {
                                const ext = extname(resolved);
                                const mime = MIME_TYPES[ext] || 'application/octet-stream';
                                const data = readFileSync(resolved);
                                res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
                                res.end(data);
                            } else {
                                res.writeHead(404, { 'Content-Type': 'text/plain' });
                                res.end(`Not found: ${req.url}`);
                            }
                        } catch (e) {
                            res.writeHead(500);
                            res.end('Internal server error');
                        }
                        return;
                    }
                }

                // ─── Static Files from public/ ───
                const publicDir = join(process.cwd(), 'public');
                let filePath = pathname === '/' ? '/unified_diagnostic.html' : pathname;
                filePath = join(publicDir, filePath);

                try {
                    if (existsSync(filePath)) {
                        const ext = extname(filePath);
                        const mime = MIME_TYPES[ext] || 'application/octet-stream';
                        const data = readFileSync(filePath);
                        res.writeHead(200, { 'Content-Type': mime });
                        res.end(data);
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end(`Not found: ${req.url}`);
                    }
                } catch (e) {
                    res.writeHead(500);
                    res.end('Internal server error');
                }
            });

            this.wss = new WebSocketServer({ server });
            this.wss.on('connection', (ws) => {
                this.clients.add(ws);
                logger.info('HUD client connected');
                
                ws.on('close', () => {
                    this.clients.delete(ws);
                    logger.info('HUD client disconnected');
                });
            });

            server.listen(8080, () => {
                logger.info('Combat HUD Bridge active on ws://localhost:8080 (Health: http://localhost:8080/health)');
            });

            server.on('error', (e: any) => {
                if (e.code === 'EADDRINUSE') {
                    logger.error('Port 8080 already in use. HUD Bridge failed to bind.');
                } else {
                    logger.error({ err: e }, 'HUD Bridge server error');
                }
            });
        } catch (e) {
            logger.error({ err: e }, 'Failed to start HUD Bridge');
        }
    }

    public broadcast(payload: HUDStateUpdate | HUDLogUpdate | HitsplatUpdate) {
        const message = JSON.stringify(payload);
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    public log(message: string, level: 'info' | 'action' = 'info') {
        this.broadcast({ type: 'LOG_UPDATE', message, level });
    }

    public updateState(adrenaline: number, archetype: string, lastAction?: string, activeRotation?: string, nextAbility?: string, combatStyle?: string, activePhase?: string, targetHp?: number, kernelPhase?: string, learningTrace?: any) {
        this.lastTickReceived = Date.now();
        const payload: HUDStateUpdate = {
            type: 'STATE_UPDATE',
            adrenaline,
            activeArchetype: archetype,
            combatStyle,
            activePhase,
            targetHp,
            lastAction,
            activeRotation,
            nextAbility,
            kernelPhase,
            learningTrace
        };
        this.broadcast(payload);
        
        // Simple ring buffer for causal traces (learningTrace)
        if (learningTrace) {
            this.traceBuffer.push(learningTrace);
            if (this.traceBuffer.length > 50) {
                const oldest = this.traceBuffer.shift();
                this.serializeTrace(oldest);
            }
        }
    }

    private serializeTrace(trace: any) {
        try {
            const logDir = 'logs';
            if (!existsSync(logDir)) mkdirSync(logDir);
            const date = new Date().toISOString().split('T')[0];
            const logFile = join(logDir, `causal_traces_${date}.jsonl`);
            appendFileSync(logFile, JSON.stringify(trace) + '\n');
        } catch (e) {
            // Silently fail if log cannot be written to avoid interfering with bridge
        }
    }

    public hitsplat(value: number, kind: HitsplatUpdate['kind'] = 'DAMAGE', entityId: string = 'target') {
        this.broadcast({ type: 'HITSPLAT', value, kind, entityId });
    }
}

