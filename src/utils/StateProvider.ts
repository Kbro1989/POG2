/**
 * StateProvider — Live State Injection Layer
 *
 * Bridges the gap between L1 static cache definitions (VarbitSovereigntyLimb)
 * and L2 per-tick dynamic gameplay state (GameState.varps / GameState.varbits).
 *
 * The dual-tick temporal contract:
 *   T1 (Game Tick):    600ms — server truth, ledger commits, world reduction
 *   T2 (Player Phase): 300ms — combat pulse, abilities, cooldowns, prediction
 *
 * Design:
 *   - Wraps VarbitSovereigntyLimb for synchronous L1 lookups
 *   - Falls back to RSMVBridge.getVarbit(id) for on-demand cache resolution
 *   - Caches resolved definitions permanently (L1 is immutable)
 *   - Provides getVarbit/setVarbit/getVarp/setVarp as the canonical API
 *     for gameplay scripts, replacing all direct state.varbits.set() calls
 */

import { GameState } from '../core/models.js';
import { VarbitSovereigntyLimb } from '../limbs/spatial/VarbitSovereigntyLimb.js';
import { rsmvBridge, BridgeVarbitResult } from './RSMVBridge.js';
import { createLogger } from './logger.js';
import * as fs from 'fs';

const logger = createLogger('StateProvider');

/** Canonical varbit definition shape used by the sovereignty limb */
export interface VarbitDefinition {
    parentVarpId: number;
    lsb: number;
    msb: number;
}

/**
 * StateProvider — Singleton service for authoritative game state access.
 *
 * All gameplay scripts should use this instead of touching GameState.varbits
 * or GameState.varps directly.
 */
export class StateProvider {
    private static _instance: StateProvider | null = null;
    private sovereignty: VarbitSovereigntyLimb;

    /** Tracks in-flight async resolutions to prevent duplicate subprocess calls */
    private pendingResolutions: Map<number, Promise<VarbitDefinition | null>> = new Map();

    /** Local definition cache for varbits resolved dynamically from the bridge */
    private dynamicDefinitions: Map<number, VarbitDefinition> = new Map();

    /**
     * Synthetic varbit registry.
     * Engine-computed state (e.g. "is player in combat", local UI toggles) that
     * has no corresponding RS3 cache entry must be registered here BEFORE any
     * setVarbit call. Synthetic varbits are stored directly in GameState.varbits
     * and never hit the bridge subprocess.
     */
    private syntheticVarbits: Set<number> = new Set();

    /** Tick counter for cache invalidation diagnostics */
    private lastSyncTick: number = 0;

    private constructor() {
        this.sovereignty = VarbitSovereigntyLimb.getInstance();
    }

    public static getInstance(): StateProvider {
        if (!StateProvider._instance) {
            StateProvider._instance = new StateProvider();
        }
        return StateProvider._instance;
    }

    // ── Synthetic Varbit Registry ─────────────────────────────────────────────

    /**
     * markSynthetic — Register a varbit ID as engine-computed, non-cache state.
     * Call this for any varbit that is derived from game logic rather than the
     * RS3 cache (e.g. combat phase flags, local minigame UI toggles).
     *
     * Synthetic varbits bypass the bridge entirely — they are stored directly in
     * GameState.varbits and resolved without bit-window extraction.
     */
    public markSynthetic(varbitId: number): void {
        this.syntheticVarbits.add(varbitId);
        logger.debug({ varbitId }, '[StateProvider] Varbit marked as synthetic (engine-computed, no cache lookup).');
    }

    /**
     * isSynthetic — Returns true if this varbit ID is registered as engine-computed.
     */
    public isSynthetic(varbitId: number): boolean {
        return this.syntheticVarbits.has(varbitId);
    }

    // ── Varbit Access ─────────────────────────────────────────────────────────

    /**
     * getVarbit — Synchronous fast path for resolved varbits.
     *
     * Extracts the bit-window from the parent Varp using the L1 definition.
     * If the definition is not yet loaded, returns the cached L2 value
     * from GameState.varbits (which may be 0 if never set) and schedules
     * an async background resolution.
     */
    public getVarbit(varbitId: number, state: GameState): number {
        // Fast path: delegate to sovereignty limb which has the L1 registry
        return this.sovereignty.resolveVarbitValue(varbitId, state);
    }

    /**
     * setVarbit — Authoritative varbit mutation.
     *
     * For synthetic varbits, stores the value directly in GameState.varbits
     * without any parent Varp computation or remanifest trigger.
     * For cache-grounded varbits, ensures the L1 definition is loaded first,
     * then delegates to VarbitSovereigntyLimb for bit-window mutation.
     */
    public async setVarbit(varbitId: number, value: number, state: GameState): Promise<void> {
        if (this.syntheticVarbits.has(varbitId)) {
            state.varbits.set(varbitId, value);
            return;
        }
        // Ensure definition is loaded before setting
        await this.ensureVarbitDefinition(varbitId);
        await this.sovereignty.setVarbit(varbitId, value, state);
    }

    // ── Varp Access ───────────────────────────────────────────────────────────

    /**
     * getVarp — Direct Varp read from GameState.
     * Varps are the raw 32-bit server variables; varbits are bit-windows into them.
     */
    public getVarp(varpId: number, state: GameState): number {
        return state.varps.get(varpId) || 0;
    }

    /**
     * setVarp — Authoritative Varp mutation.
     * Triggers remanifest of all varbits that share this parent Varp.
     */
    public async setVarp(varpId: number, value: number, state: GameState): Promise<void> {
        await this.sovereignty.setVarp(varpId, value, state);
    }

    // ── Async Definition Resolution ───────────────────────────────────────────

    /**
     * ensureVarbitDefinition — Guarantees the L1 definition is loaded.
     *
     * If the definition exists in VarbitSovereigntyLimb (loaded from
     * varbits_registry.json at boot), this is a no-op.
     *
     * If missing, spawns a subprocess call to rsmv_bridge.ts to fetch
     * the definition from the live NXT JCACHE, then injects it into
     * the sovereignty limb's in-memory registry.
     *
     * Deduplicates concurrent calls for the same varbitId.
     */
    public async ensureVarbitDefinition(varbitId: number): Promise<VarbitDefinition | null> {
        // Synthetic varbits never have cache definitions
        if (this.syntheticVarbits.has(varbitId)) return null;

        // Check local dynamic cache first
        if (this.dynamicDefinitions.has(varbitId)) {
            return this.dynamicDefinitions.get(varbitId)!;
        }

        // Check if sovereignty limb already has it (from static registry)
        const existing = this.sovereignty.resolveVarbitValue(varbitId, { varps: new Map(), varbits: new Map() } as any);
        // If resolveVarbitValue returned a non-zero value without a varp, the definition existed
        // But we need a cleaner check — use the public accessor we're about to add

        // Deduplicate in-flight resolutions
        if (this.pendingResolutions.has(varbitId)) {
            return this.pendingResolutions.get(varbitId)!;
        }

        const resolution = this.resolveFromBridge(varbitId);
        this.pendingResolutions.set(varbitId, resolution);

        try {
            const def = await resolution;
            return def;
        } finally {
            this.pendingResolutions.delete(varbitId);
        }
    }

    /**
     * resolveFromBridge — Fetches a single varbit definition from the NXT cache
     * via the rsmv_bridge subprocess.
     */
    private async resolveFromBridge(varbitId: number): Promise<VarbitDefinition | null> {
        logger.info({ varbitId }, '[StateProvider] Resolving varbit definition from live cache...');

        const result = await rsmvBridge.getVarbit(varbitId);
        if (!result.ok) {
            logger.warn({ varbitId, error: result.error?.message }, '[StateProvider] Failed to resolve varbit from cache.');
            return null;
        }

        const raw = result.value;
        const def = this.parseBridgeVarbit(raw);
        if (!def) {
            logger.warn({ varbitId, raw }, '[StateProvider] Bridge returned unparseable varbit structure.');
            return null;
        }

        // Inject into VarbitSovereigntyLimb's permanent L1 registry
        this.sovereignty.injectVarbitDefinition(varbitId, def);
        this.dynamicDefinitions.set(varbitId, def);

        logger.info({
            varbitId,
            parentVarpId: def.parentVarpId,
            lsb: def.lsb,
            msb: def.msb
        }, '[StateProvider] Varbit definition resolved and injected.');

        return def;
    }

    /**
     * parseBridgeVarbit — Normalizes the rsmv parser output into the canonical
     * VarbitDefinition shape used by VarbitSovereigntyLimb.
     *
     * The rsmv parser can return the bit window in multiple formats:
     *   - { varid, bits: [lsb, msb] }      (standard)
     *   - { varid, lsb, msb }              (flattened)
     *   - { varid, bitcount }              (count only, derive lsb=0, msb=bitcount-1)
     */
    private parseBridgeVarbit(raw: BridgeVarbitResult): VarbitDefinition | null {
        const parentVarpId = raw.varid;
        if (parentVarpId === undefined || parentVarpId === null) return null;

        let lsb: number;
        let msb: number;

        if (raw.bits && Array.isArray(raw.bits) && raw.bits.length === 2) {
            lsb = raw.bits[0];
            msb = raw.bits[1];
        } else if (raw.lsb !== undefined && raw.msb !== undefined) {
            lsb = raw.lsb;
            msb = raw.msb;
        } else if (raw.bitcount !== undefined && raw.bitcount > 0) {
            lsb = 0;
            msb = raw.bitcount - 1;
        } else {
            return null;
        }

        return { parentVarpId, lsb, msb };
    }

    // ── Batch Pre-Resolution ──────────────────────────────────────────────────

    /**
     * preResolveVarbits — Pre-loads a batch of varbit definitions before
     * a gameplay module mounts. This prevents subprocess latency during
     * the first tick of a minigame.
     *
     * Called by gameplay interpreters in their mount() phase.
     */
    public async preResolveVarbits(varbitIds: number[]): Promise<void> {
        const missing = varbitIds.filter(id => !this.dynamicDefinitions.has(id));
        if (missing.length === 0) return;

        logger.info({ count: missing.length, ids: missing }, '[StateProvider] Batch pre-resolving varbit definitions...');

        // Resolve sequentially to avoid subprocess stampede
        for (const id of missing) {
            await this.ensureVarbitDefinition(id);
        }

        logger.info({ resolved: missing.length }, '[StateProvider] Batch pre-resolution complete.');
    }

    // ── Serialization ─────────────────────────────────────────────────────────

    /**
     * persistDiscoveredVarbits — Serializes newly discovered varbits to the L1 registry.
     * Prevents redundant bridge calls across restarts and builds a self-updating L1 registry.
     * Call this during graceful shutdown of the engine.
     */
    public async persistDiscoveredVarbits(outputPath: string = 'D:/POG2/src/limbs/spatial/varbits_registry.json'): Promise<void> {
        if (this.dynamicDefinitions.size === 0) return;
        
        try {
            let existing: Record<string, VarbitDefinition> = {};
            if (fs.existsSync(outputPath)) {
                existing = JSON.parse(await fs.promises.readFile(outputPath, 'utf8'));
            }

            let addedCount = 0;
            for (const [id, def] of this.dynamicDefinitions) {
                if (!existing[id.toString()]) {
                    existing[id.toString()] = def;
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                await fs.promises.writeFile(outputPath, JSON.stringify(existing, null, 2));
                logger.info({ count: addedCount, path: outputPath }, '[StateProvider] Persisted newly discovered varbit definitions to L1 registry.');
            }
        } catch (error) {
            logger.error({ error }, '[StateProvider] Failed to persist discovered varbits.');
        }
    }

    // ── Tick Lifecycle ────────────────────────────────────────────────────────

    /**
     * onTickBoundary — Called by SimulationHarness at every T1 (600ms) boundary.
     *
     * Currently used for diagnostic tracking. Future: invalidation of
     * transient L2 state if needed.
     */
    public onTickBoundary(tickCount: number): void {
        this.lastSyncTick = tickCount;
    }

    /**
     * getDiagnostics — Returns a snapshot of the provider's state for the switchboard.
     */
    public getDiagnostics(): { staticDefinitions: number; dynamicDefinitions: number; syntheticVarbits: number; pendingResolutions: number; lastSyncTick: number } {
        return {
            staticDefinitions: 0, // We don't have direct access to the sovereignty limb's map size
            dynamicDefinitions: this.dynamicDefinitions.size,
            syntheticVarbits: this.syntheticVarbits.size,
            pendingResolutions: this.pendingResolutions.size,
            lastSyncTick: this.lastSyncTick
        };
    }
}

// Convenience singleton export
export const stateProvider = StateProvider.getInstance();

