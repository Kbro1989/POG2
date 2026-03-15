import pino from 'pino';
import { type Result, ok } from '../core/models.js';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { join } from 'path';

const logger = pino({ name: 'SwitchboardLimb', base: { hostname: 'POG2' } });

/**
 * SwitchboardLimb - Dynamic Resource Routing
 * Orchestrates the connection between limbs, tasks, and data substrates.
 */
export class SwitchboardLimb {
    private wss: WebSocketServer | null = null;
    private server: HttpServer | null = null;

    constructor() { }

    /**
     * startServer - Initializes the external bridge server.
     */
    public async startServer(port: number, orchestrator: any): Promise<void> {
        const app = express();
        this.server = createServer(app);
        this.wss = new WebSocketServer({ server: this.server });

        // Serve SovereignEye captures via HTTP
        const eyeDir = join(process.cwd(), 'captures', 'sovereign_eye');
        app.use('/captures', express.static(eyeDir));

        this.wss.on('connection', (ws: WebSocket) => {
            logger.info('External client connected to Switchboard Bridge.');

            ws.on('message', async (data: string) => {
                try {
                    const msg = JSON.parse(data);
                    if (msg.type === 'command') {
                        logger.info({ intent: msg.intent }, 'Bridge received command');
                        const result = await orchestrator.run(msg.intent);
                        ws.send(JSON.stringify({ type: 'result', ok: result.ok, value: result.value, error: result.error }));
                    }
                } catch (err) {
                    logger.error({ err }, 'Failed to process bridge message');
                    ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }));
                }
            });

            ws.send(JSON.stringify({ type: 'welcome', status: 'Sovereign Bridge ACTIVE' }));
        });

        return new Promise((resolve, reject) => {
            this.server?.on('error', (err: any) => {
                logger.error({ err }, 'Switchboard Bridge server error');
                if (err.code === 'EADDRINUSE') {
                    logger.warn(`Port ${port} already in use. Bridge will remain offline.`);
                }
                resolve(); // Resolve anyway so we don't hang the audit
            });

            this.server?.listen(port, () => {
                logger.info(`Switchboard Bridge listening on port ${port}`);
                resolve();
            });
        });
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
     * connectToSubstrates - Hooks into Renderer and SovereignEye for remote mirroring.
     */
    public connectToSubstrates(renderer: any, eye: any): void {
        renderer.onOutput((payload: any) => {
            this.broadcast({
                type: 'log',
                timestamp: Date.now(),
                ...payload
            });
        });

        eye.on('capture', (capture: any) => {
            this.broadcast({
                type: 'vision',
                timestamp: Date.now(),
                capture
            });
        });
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
            retryable: !isOnline, // Allow NodeTester to retry if not yet listening
            details: isOnline 
                ? `Switchboard Bridge Active: ${this.wss?.clients.size || 0} remote mirroring links.`
                : 'Switchboard Bridge Offline.'
        };
    }
}
