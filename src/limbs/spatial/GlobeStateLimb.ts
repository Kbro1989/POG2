import { type Result, ok } from '../../core/models.js';
import { WebSocket } from 'ws';
import type { SovereignConfig } from '../../config/SovereignConfig.js';
import type { QuotaTracker, QuotaState } from '../../utils/QuotaTracker.js';
import { EventBus, SovereignEvent } from '../../events/EventBus.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('GlobeStateLimb');

export interface GlobeState {
    id: string;
    nodes: Record<string, any>;
    lastSync: number;
}

/**
 * GlobeStateLimb - Durable State Management via Multiplayer Globe Bridge.
 * 
 * Synchronizes the Sovereign Organism's neurological state with a 
 * globally accessible, durable substrate (PartyKit/Partyserver).
 */
export class GlobeStateLimb {
    private ws: WebSocket | null = null;
    private state: GlobeState = {
        id: 'pog2-sovereign',
        nodes: {},
        lastSync: Date.now()
    };
    private endpoint: string = 'ws://localhost:8787/party/globe';
    private subscribers: Map<string, Array<(data: any) => void>> = new Map();
    private connectPromise: Promise<Result<boolean>> | null = null;

    constructor(config?: SovereignConfig) {
        if (config?.globeEndpoint) {
            this.endpoint = config.globeEndpoint;
        }

        // Tap into the cognitive stream
        EventBus.getInstance().subscribeAll(this.streamEventData.bind(this));
    }

    public setEndpoint(url: string): void {
        this.endpoint = url;
    }

    /**
     * Directly stream an EventBus telemetry packet to the WebGL globe
     */
    private streamEventData(event: SovereignEvent): void {
        this.state.lastSync = Date.now();

        if (this.ws?.readyState === WebSocket.OPEN) {
            // Strip large payloads if needed, or send the whole event envelope
            this.ws.send(JSON.stringify({
                type: 'event',
                id: event.id,
                eventType: event.type,
                source: event.source,
                traceId: event.traceId,
                timestamp: event.timestamp,
                // Include latency if it's a metric or embedded in payload
                latency: event.payload?.latencyMs,
            }), (err: any) => { if (err) logger.debug({ err }, 'Failed to stream telemetry packet'); });
        }
    }

    /**
     * Subscribe to state updates for a specific neurological node ID.
     */
    public onStateUpdate(nodeId: string, callback: (data: any) => void): void {
        if (!this.subscribers.has(nodeId)) {
            this.subscribers.set(nodeId, []);
        }
        this.subscribers.get(nodeId)!.push(callback);
    }

    /**
     * Connects to the Multiplayer Globe substrate.
     * Stores the connection promise so healthCheck() can await it.
     */
    public async connect(): Promise<Result<boolean>> {
        this.connectPromise = new Promise((resolve) => {
            try {
                this.ws = new WebSocket(this.endpoint);

                this.ws.on('open', () => {
                    logger.info({ endpoint: this.endpoint }, 'Connected to Multiplayer Globe Substrate');
                    resolve(ok(true));
                });

                this.ws.on('message', (data: string) => {
                    try {
                        const msg = JSON.parse(data);
                        if (msg.type === 'state-sync') {
                            this.state = msg.state;
                            logger.debug('State synchronized from Globe');

                            // Notify subscribers of the new state
                            for (const [nodeId, nodeData] of Object.entries(this.state.nodes)) {
                                const callbacks = this.subscribers.get(nodeId);
                                if (callbacks) {
                                    callbacks.forEach(cb => {
                                        try { cb(nodeData); } catch (e) { logger.error({ err: e }, 'Globe subscriber error'); }
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        logger.warn({ err }, 'Failed to parse Globe message');
                    }
                });

                this.ws.on('error', (err: any) => {
                    logger.error({ err }, 'Globe connection error');
                    resolve({ ok: false, error: err });
                });

            } catch (err) {
                resolve({ ok: false, error: err as Error });
            }
        });
        return this.connectPromise;
    }

    /**
     * Push a node's state to the global substrate.
     */
    public async pushNodeState(nodeId: string, data: any): Promise<Result<boolean>> {
        this.state.nodes[nodeId] = data;
        this.state.lastSync = Date.now();

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'update-node',
                nodeId,
                data,
                timestamp: this.state.lastSync
            }));
            return ok(true);
        }

        return { ok: false, error: new Error('Globe substrate offline') };
    }

    /**
     * Query state from the substrate.
     */
    public getNodeState(nodeId: string): any {
        return this.state.nodes[nodeId];
    }

    /**
     * Sovereign FinOps: Push quota state to durable substrate.
     */
    public async syncQuotaState(qt: QuotaTracker): Promise<void> {
        await this.pushNodeState('quota', qt.serialize());
    }

    /**
     * Sovereign FinOps: Load persisted quota state.
     */
    public loadQuotaState(): QuotaState | null {
        return this.getNodeState('quota') as QuotaState | null;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string; retryable?: boolean }> {
        // If a connection is pending, wait briefly for it to resolve
        if (this.connectPromise && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
            try {
                await Promise.race([
                    this.connectPromise,
                    new Promise(resolve => setTimeout(resolve, 3000))
                ]);
            } catch {
                // Connection failed — fall through to status check
            }
        }

        const isOnline = this.ws?.readyState === WebSocket.OPEN;
        const isConnecting = this.ws?.readyState === WebSocket.CONNECTING;

        return {
            online: isOnline,
            retryable: isConnecting,
            details: isOnline
                ? `Globe Substrate Active: ${Object.keys(this.state.nodes).length} nodes synced.`
                : (isConnecting ? 'Globe Substrate Offline: Waiting for connection.' : 'Globe Substrate Offline: Connection failed or closed.')
        };
    }
}
