import { type Result, ok } from '../core/models.js';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { join } from 'path';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('SwitchboardLimb');

/**
 * SwitchboardLimb - Dynamic Resource Routing
 * Orchestrates the connection between limbs, tasks, and data substrates.
 */
export class SwitchboardLimb {
    private wss: WebSocketServer | null = null;
    private server: HttpServer | null = null;
    private activePort: number | null = null;

    constructor() { }

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
                const server = createServer(app);
                
                // Serve SovereignEye captures via HTTP
                const eyeDir = join(process.cwd(), 'captures', 'sovereign_eye');
                app.use('/captures', express.static(eyeDir));

                let wss: WebSocketServer | null = null;

                server.on('error', (err: any) => {
                    if (wss) wss.close();
                    server.close();
                    reject(err);
                });

                server.listen(port, () => {
                    // Only after successful listen do we attach WS and assign to this
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
        const maxTries = 5;

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
            logger.debug('SovereignEye substrate does not support EventEmitter — vision mirroring skipped.');
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
}
