/**
 * RSMVBridge â€” Sovereign Cache Access Layer
 *
 * Resolves the ESM/CommonJS boundary by calling rsmv_bridge.ts as a
 * tsx subprocess. Returns strongly-typed results from the live RS3 cache.
 *
 * Replaces the broken require()-based GameCacheLoader pattern in:
 *  - CacheForensicsLimb
 *  - TopologyLimb
 *  - KinematicsLimb
 */

import { spawn } from 'child_process';
import { CanonicalClock } from './CanonicalClock.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './logger.js';
import { Result, ok, err } from '../core/models.js';

const logger = createLogger('RSMVBridge');
const __filename = fileURLToPath(import.meta.url);

let _lastLatencyMs = 0;

export function getLastIOLatencyMs(): number {
    return _lastLatencyMs;
}

import { getPackageRoot } from './SovereignPathResolver.js';

const BRIDGE_SCRIPT = join(getPackageRoot(), 'src', 'utils', 'rsmv_bridge.ts');

const TIMEOUT_MS = 60000; // Increased to 60s for substrate stability during cold starts

async function callBridge<T>(operation: string, ...args: string[]): Promise<Result<T>> {
    const start = CanonicalClock.getInstance().simulatedNow();
    return new Promise((resolve) => {
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        const childArgs = ['tsx', BRIDGE_SCRIPT, operation, ...args];

        const child = spawn(cmd, childArgs, {
            shell: process.platform === 'win32',
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdout += chunk;

            // Phase 9: Real-time Substrate Visibility
            // If the chunk doesn't look like part of a JSON blob, it might be a log from the sub-tool
            if (!chunk.trim().startsWith('{') && !chunk.trim().startsWith('[')) {
                const lines = chunk.split('\n').filter((l: string) => l.trim());
                for (const line of lines) {
                    process.stdout.write(`\x1b[38;5;244m[RSMV_BRIDGE:OUT]\x1b[0m ${line}\n`);
                }
            }
        });

        child.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderr += chunk;
            const lines = chunk.split('\n').filter((l: string) => l.trim());
            for (const line of lines) {
                process.stderr.write(`\x1b[38;5;208m[RSMV_BRIDGE:ERR]\x1b[0m ${line}\n`);
            }
        });

        const timer = setTimeout(() => {
            child.kill();
            logger.warn({ operation, timeout: TIMEOUT_MS }, 'RSMVBridge neurological link severed due to timeout.');
            resolve(err(new Error(`RSMVBridge timeout: ${operation} exceeded ${TIMEOUT_MS}ms`)));
        }, TIMEOUT_MS);

        child.on('close', (code) => {
            clearTimeout(timer);
            _lastLatencyMs = CanonicalClock.getInstance().simulatedNow() - start;

            if (code !== 0) {
                const msg = stderr.trim() || `Exit code ${code}`;
                logger.error({ operation, args, msg }, 'RSMVBridge subprocess failed');
                resolve(err(new Error(`RSMVBridge[${operation}] failed: ${msg}`)));
                return;
            }

            try {
                const parsed = JSON.parse(stdout.trim()) as T & { error?: string };
                if ((parsed as any).error && (parsed as any).error !== 'parse_unavailable') {
                    resolve(err(new Error((parsed as any).error)));
                } else {
                    resolve(ok(parsed));
                }
            } catch (e: any) {
                resolve(err(new Error(`RSMVBridge[${operation}] parse error: ${e.message} (Payload: ${stdout.substring(0, 100)}...)`)));
            }
        });

        child.on('error', (errVal) => {
            clearTimeout(timer);
            resolve(err(errVal));
        });
    });
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BridgeObjectResult {
    id: number;
    name: string;
    actions: string[];
    members_action_1?: string;
    members_action_2?: string;
    models?: number[];
    params?: any;
    dummy_45?: number;
    mapscene?: number;
    sizeX?: number;
    sizeZ?: number;
    maybe_blocks_movement?: boolean;
    probably_nocollision?: boolean;
    raw: any;
}

export interface BridgeNpcResult {
    id: number;
    name: string;
    combatLevel: number | null;
    models: number[];
    headModels: number[];
    actions: string[];
    boundSize: number | null;
    walkRange: number | null;
    movementType: number | null;
    raw: any;
}

export interface BridgeItemResult {
    id: number;
    name: string;
    isEquippable: boolean;
    equipSlotId: number | null;
    isMember: boolean;
    maleModels: (number | null)[];
    femaleModels: (number | null)[];
    actions: string[];
    raw: any;
}

export interface BridgeModelResult {
    modelId: number;
    vertexCount: number;
    triangleCount: number;
    boneCount: number;
    hasUVs: boolean;
    hasSkinning: boolean;
    materials: number[];
    miny?: number;
    maxy?: number;
    error?: 'parse_unavailable';
}

export interface BridgeSequenceResult {
    id: number;
    frameCount: number;
    isSkeletal: boolean;
    totalDuration: number;
    raw: any;
}

export interface BridgeCollisionResult {
    x: number;
    z: number;
    plane: number;
    xsize: number;
    zsize: number;
    data: number[]; // Flat array of [height00, height01, height10, height11, collision3] x (xsize*zsize)
}

export interface BridgeHealthResult {
    online: boolean;
    reason?: string;
    cacheVersion?: number;
}

export interface BridgeVarbitResult {
    id: number;
    varid: number;       // Parent Varp ID
    bitcount: number;    // Total bits consumed
    lsb?: number;        // Least significant bit position (alias: bits[0])
    msb?: number;        // Most significant bit position (alias: bits[1])
    bits?: [number, number]; // [lsb, msb] pair from rsmv parser
    [key: string]: any;  // Additional parser fields
}

// â”€â”€ RSMVBridge Singleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class RSMVBridge {
    private static _instance: RSMVBridge | null = null;
    private _healthy: boolean | null = null;

    static get instance(): RSMVBridge {
        if (!RSMVBridge._instance) RSMVBridge._instance = new RSMVBridge();
        return RSMVBridge._instance;
    }

    private _lastHealthCheckTime = 0;
    private _lastHealthCheckResult: Result<BridgeHealthResult> | null = null;

    /** Probe the live cache. Result is cached for 30s to prevent audit spam. */
    public async healthCheck(): Promise<Result<BridgeHealthResult>> {
        const now = CanonicalClock.getInstance().simulatedNow();
        if (this._lastHealthCheckResult && (now - this._lastHealthCheckTime < 30000)) {
            return this._lastHealthCheckResult;
        }

        try {
            const result = await callBridge<BridgeHealthResult>('health');
            this._healthy = result.ok && result.value.online;
            this._lastHealthCheckTime = now;
            this._lastHealthCheckResult = result;
            return result;
        } catch (e) {
            logger.warn({ err: e }, '[RSMVBridge] Health check failed, defaulting to DEGRADED mode to prevent boot stall.');
            const degraded = ok({ online: false, reason: 'Substrate diagnostic timeout: ESM resolution conflict.' });
            this._healthy = false;
            this._lastHealthCheckTime = now;
            this._lastHealthCheckResult = degraded;
            return degraded;
        }
    }

    /** Returns true if the last healthCheck confirmed the cache is live. */
    public get isOnline(): boolean {
        return this._healthy === true;
    }

    // â”€â”€ Async Accessors â”€â”€

    public async getObject(id: number): Promise<Result<BridgeObjectResult>> {
        return await callBridge<BridgeObjectResult>('object', String(id));
    }

    public async getNpc(id: number): Promise<Result<BridgeNpcResult>> {
        return await callBridge<BridgeNpcResult>('npc', String(id));
    }

    public async getItem(id: number): Promise<Result<BridgeItemResult>> {
        return await callBridge<BridgeItemResult>('item', String(id));
    }

    public async getModel(id: number): Promise<Result<BridgeModelResult>> {
        return await callBridge<BridgeModelResult>('model', String(id));
    }

    public async getSequence(id: number): Promise<Result<BridgeSequenceResult>> {
        return await callBridge<BridgeSequenceResult>('sequence', String(id));
    }

    public async getInterface(id: number): Promise<Result<any>> {
        return await callBridge<any>('interface', String(id));
    }

    public async getSprite(id: number): Promise<Result<any>> {
        return await callBridge<any>('sprite', String(id));
    }

    public async getDBTables(): Promise<Result<any>> {
        return await callBridge<any>('dbtables');
    }

    public async getDBRows(tableId?: number): Promise<Result<any>> {
        const params = tableId !== undefined ? [tableId.toString()] : [];
        return await callBridge<any>('dbrows', ...params);
    }

    public async getVarps(): Promise<Result<any>> {
        return await callBridge<any>('varplayer');
    }

    public async getVarbit(id: number): Promise<Result<BridgeVarbitResult>> {
        return await callBridge<BridgeVarbitResult>('varbit', String(id));
    }

    public async getVarbits(): Promise<Result<any>> {
        return await callBridge<any>('varbits');
    }

    public async getEnum(id: number): Promise<Result<any>> {
        return await callBridge<any>('enum', String(id));
    }

    public async getCollision(x: number, z: number, plane: number, xsize = 64, zsize = 64): Promise<Result<BridgeCollisionResult>> {
        return await callBridge<BridgeCollisionResult>('collision', String(x), String(z), String(plane), String(xsize), String(zsize));
    }

    public async getMapsquareTiles(chunkX: number, chunkZ: number): Promise<Result<{ chunkX: number, chunkZ: number, tiles: { x: number, z: number, plane: number, collision: number, height: number | null }[] }>> {
        return await callBridge<any>('mapsquare_tiles', String(chunkX), String(chunkZ));
    }
}

// Convenience singleton export
export const rsmvBridge = RSMVBridge.instance;
