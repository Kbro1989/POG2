// ── Ambient Cloudflare Workers declarations ────────────────────────────────
// Using ambient declarations so this file compiles in both the main Node tsc
// pass (where cloudflare:workers doesn't exist) and the wrangler deploy pass
// (where it does). This avoids polluting tsconfig with cloudflare types that
// conflict with Node globals.
declare class DurableObjectBase {
    constructor(state: DurableObjectStateAmbient, env: any);
    fetch(request: Request): Promise<Response>;
}
declare interface DurableObjectStateAmbient {
    id: { toString(): string };
    storage: {
        get<T>(key: string): Promise<T | undefined>;
        put<T>(key: string, value: T): Promise<void>;
        delete(key: string): Promise<boolean>;
    };
    blockConcurrencyWhile(fn: () => Promise<void>): void;
}
declare class WebSocketPairAmbient {
    0: WebSocket;
    1: WebSocket;
}

import type { HexagramDefinition, GameplayContext } from '../core/HexagramDefinitions.js';

// ── DO-owned broadcast schema ──────────────────────────────────────────────
// POG2WorldDO is the consumer/broadcaster — it defines the wire format.
// Engine-side code (GhostSplatEngine, SovereignCollisionEngine) does NOT
// need to know about these types.

export interface GhostSplatSnapshot {
    heatmap: number[];             // Flattened density values (66×66)
    dimensions: { width: number; height: number; plane: number };
    mapsquare: string;             // "50,50"
    timestamp: number;
}

export interface CollisionSnapshot {
    mapsquare: string;
    plane: number;
    blocked: number[];             // Packed coords (x << 14 | y)
    walkable: number[];
}

export interface WorldTelemetryFrame {
    tick: number;
    timestamp: number;
    hexagramState: {
        activeId: number;
        definition: HexagramDefinition;
        engineFocus: string[];
        yaoLines: boolean[];        // 6 lines, true = yang/active
    };
    ghostSplat: GhostSplatSnapshot | null;
    collisionGrid: CollisionSnapshot[];
    activeEntities: {
        npcs: number;
        items: number;
        objects: number;
        players: number;
    };
}

/**
 * POG2WorldDO — Telemetry Radiator & State Broadcaster
 *
 * This Durable Object does NOT own any engines. It pulls state from engine
 * singletons or sibling DO stubs and broadcasts WorldTelemetryFrames to
 * WebSocket subscribers on a 300ms cycle aligned with RS3 client prediction.
 *
 * Endpoints:
 *   GET /health    → { status, tick }
 *   GET /telemetry → Current WorldTelemetryFrame as JSON
 *   GET /ws        → WebSocket upgrade (channel subscription)
 */
export class POG2WorldDO extends DurableObjectBase {
    private tick: number = 0;
    private clients: Set<WebSocket> = new Set();
    private telemetryInterval: ReturnType<typeof setInterval> | null = null;

    constructor(state: DurableObjectStateAmbient, env: any) {
        super(state, env);
        this.startTelemetryLoop();
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'alive', tick: this.tick }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (url.pathname === '/ws') {
            const pair = new WebSocketPairAmbient();
            const [client, server] = [pair[0], pair[1]];
            this.handleConnection(server);
            return new Response(null, { status: 101, webSocket: client } as any);
        }

        if (url.pathname === '/telemetry') {
            return new Response(JSON.stringify(this.buildFrame()), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('Not Found', { status: 404 });
    }

    private handleConnection(ws: WebSocket): void {
        (ws as any).accept?.();
        this.clients.add(ws);

        // Immediate push of current state
        ws.send(JSON.stringify({ type: 'INIT', frame: this.buildFrame() }));

        ws.addEventListener('message', (msg: MessageEvent) => {
            try {
                const data = JSON.parse(typeof msg.data === 'string' ? msg.data : '{}');
                if (data.type === 'SUBSCRIBE') {
                    // Channel filtering: 'hexagram', 'ghostsplat', 'collision', 'all'
                    (ws as any).__channels = data.channels || ['all'];
                }
            } catch {
                // Malformed message — ignore
            }
        });

        ws.addEventListener('close', () => this.clients.delete(ws));
    }

    private startTelemetryLoop(): void {
        // 300ms cycle — aligns with RS3 client prediction layer
        this.telemetryInterval = setInterval(() => {
            this.tick++;
            const frame = this.buildFrame();
            this.broadcast(frame);
        }, 300);
    }

    private buildFrame(): WorldTelemetryFrame {
        return {
            tick: this.tick,
            timestamp: Date.now(),
            hexagramState: this.getHexagramState(),
            ghostSplat: this.getGhostSplatSnapshot(),
            collisionGrid: this.getCollisionSnapshot(),
            activeEntities: this.getEntityCounts()
        };
    }

    private getHexagramState(): WorldTelemetryFrame['hexagramState'] {
        // Resolved from HexagramManager via globalThis (same isolate)
        // or via DO-stub call (cross-isolate)
        const activeHex = (globalThis as any).HEXAGRAM_MANAGER?.getActiveHexagram()
            || { id: 1, binary: '111111', name: 'The Creative', gameplay: { engineFocus: [] } };
        return {
            activeId: activeHex.id,
            definition: activeHex,
            engineFocus: activeHex.gameplay?.engineFocus || [],
            yaoLines: activeHex.binary.split('').map((b: string) => b === '1')
        };
    }

    private getGhostSplatSnapshot(): GhostSplatSnapshot | null {
        // GhostSplatEngine exports density matrix via globalThis
        return (globalThis as any).GHOST_SPLAT?.getSnapshot() || null;
    }

    private getCollisionSnapshot(): CollisionSnapshot[] {
        // SovereignCollisionEngine heatmap for current mapsquare
        return (globalThis as any).COLLISION_ENGINE?.getBlockedCoords() || [];
    }

    private getEntityCounts(): WorldTelemetryFrame['activeEntities'] {
        // From WorldStateLimb or SimulationHarness
        const state = (globalThis as any).GAME_STATE;
        if (state) {
            return {
                npcs: state.npcMap?.size || 0,
                items: state.groundItems?.size || 0,
                objects: state.objectMap?.size || 0,
                players: state.players?.size || 0
            };
        }
        return { npcs: 0, items: 0, objects: 0, players: 0 };
    }

    private broadcast(frame: WorldTelemetryFrame): void {
        const msg = JSON.stringify({ type: 'TICK', frame });
        for (const ws of this.clients) {
            try {
                const channels: string[] = (ws as any).__channels || ['all'];
                if (channels.includes('all') || channels.includes('telemetry')) {
                    ws.send(msg);
                }
            } catch {
                // Dead socket — will be cleaned on 'close' event
                this.clients.delete(ws);
            }
        }
    }
}

