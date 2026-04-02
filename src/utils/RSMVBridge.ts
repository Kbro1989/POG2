/**
 * RSMVBridge — Sovereign Cache Access Layer
 *
 * Resolves the ESM/CommonJS boundary by calling rsmv_bridge.ts as a
 * tsx subprocess. Returns strongly-typed results from the live RS3 cache.
 *
 * Replaces the broken require()-based GameCacheLoader pattern in:
 *  - CacheForensicsLimb
 *  - TopologyLimb
 *  - KinematicsLimb
 */

import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './logger.js';
import { Result, ok, err } from '../core/models.js';

const logger = createLogger('RSMVBridge');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute path to the bridge script
const BRIDGE_SCRIPT = join(process.cwd(), 'src', 'utils', 'rsmv_bridge.ts');

// npx tsx — solves path issues and EINVAL
const TIMEOUT_MS = 15000; // 15s max per cache read

function callBridge<T>(operation: string, ...args: string[]): Result<T> {
    try {
        const stdout = execFileSync(
            process.platform === 'win32' ? 'npx.cmd' : 'npx',
            ['tsx', BRIDGE_SCRIPT, operation, ...args],
            { timeout: TIMEOUT_MS, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, shell: process.platform === 'win32' }
        );
        const parsed = JSON.parse(stdout.trim()) as T & { error?: string };
        if ((parsed as any).error && (parsed as any).error !== 'parse_unavailable') {
            return err(new Error((parsed as any).error));
        }
        return ok(parsed);
    } catch (e: any) {
        const msg = e?.stdout ? (() => { try { return JSON.parse(e.stdout).error; } catch { return e.message; } })() : e.message;
        logger.error({ operation, args, msg }, 'RSMVBridge call failed');
        return err(new Error(`RSMVBridge[${operation}]: ${msg}`));
    }
}

// ── Types ──────────────────────────────────────────────────────────────────

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

export interface BridgeHealthResult {
    online: boolean;
    reason?: string;
    cacheVersion?: number;
}

// ── RSMVBridge Singleton ───────────────────────────────────────────────────

export class RSMVBridge {
    private static _instance: RSMVBridge | null = null;
    private _healthy: boolean | null = null;

    static get instance(): RSMVBridge {
        if (!RSMVBridge._instance) RSMVBridge._instance = new RSMVBridge();
        return RSMVBridge._instance;
    }

    /** Probe the live cache. Result is cached so subsequent limb inits are O(1). */
    public healthCheck(): Result<BridgeHealthResult> {
        const result = callBridge<BridgeHealthResult>('health');
        this._healthy = result.ok && result.value.online;
        return result;
    }

    /** Returns true if the last healthCheck confirmed the cache is live. */
    public get isOnline(): boolean {
        return this._healthy === true;
    }

    // ── Object ──

    public getObject(id: number): Result<BridgeObjectResult> {
        return callBridge<BridgeObjectResult>('object', String(id));
    }

    // ── NPC ──

    public getNpc(id: number): Result<BridgeNpcResult> {
        return callBridge<BridgeNpcResult>('npc', String(id));
    }

    // ── Item ──

    public getItem(id: number): Result<BridgeItemResult> {
        return callBridge<BridgeItemResult>('item', String(id));
    }

    // ── Model topology ──

    public getModel(id: number): Result<BridgeModelResult> {
        return callBridge<BridgeModelResult>('model', String(id));
    }

    // ── Animation sequence ──

    public getSequence(id: number): Result<BridgeSequenceResult> {
        return callBridge<BridgeSequenceResult>('sequence', String(id));
    }
}

// Convenience singleton export
export const rsmvBridge = RSMVBridge.instance;
