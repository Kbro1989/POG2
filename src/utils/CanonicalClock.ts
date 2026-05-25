/**
 * CanonicalClock.ts — Sovereign Temporal Authority
 *
 * RS-native deterministic clock. ALL simulation state derives from this.
 * Wall-clock (Date.now(), performance.now()) is FORBIDDEN inside tick boundaries.
 *
 * Architecture:
 *   T1 (600ms) — Game Tick: world reduces, ledger commits
 *   T2 (300ms) — Player Phase: combat/ability advances
 *   T3 (variable) — Cognitive Window: AI planning, pathfinding
 *
 * Rules:
 *   1. simulatedNow() is the ONLY time that enters state.
 *   2. realNow() is for diagnostics/logging ONLY.
 *   3. rng() returns deterministic randomness per tick coordinate.
 *   4. All consumers must use clock.simulatedNow() instead of Date.now().
 */

import { performance } from 'perf_hooks';
import { createLogger } from './logger.js';

const logger = createLogger('CanonicalClock');

export enum TickTier {
    GAME = 'GAME',           // T1: 600ms server truth
    PLAYER = 'PLAYER',       // T2: 300ms reflex pulse
    COGNITIVE = 'COGNITIVE'  // T3: variable, 1+ ticks
}

/**
 * RS-native tick constants from wiki.
 * All durations are in game ticks (0.6s each) unless marked _MS.
 * Source: https://runescape.wiki/w/Game_tick
 *         https://runescape.wiki/w/Game_tick/Ticks_per_action
 */
export const RS_TICKS = {
    // Core timing
    GAME_TICK_MS: 600,
    PLAYER_PHASE_MS: 300,

    // Combat
    GLOBAL_ABILITY_COOLDOWN: 3,
    WEAPON_SPEED_FASTEST: 4,   // Claws, daggers, scimitars
    WEAPON_SPEED_FAST: 5,      // Longswords, rapiers
    WEAPON_SPEED_AVERAGE: 6,   // Battleaxes, halberds, pickaxes
    WEAPON_SPEED_SLOWEST: 12,  // Dark bow

    // Skills (ticks per action)
    COOKING_FISH: 4,
    COOKING_WINE: 1,
    FLETCHING_SHAFTS: 3,
    FLETCHING_HEADLESS: 2,
    FLETCHING_STRING: 2,
    FLETCHING_DARTS: 1,
    HERBLORE_MIX: 2,
    HERBLORE_SECONDARY: 2,
    SMITHING_SMELT: 4,
    SMITHING_STRIKE: 2,
    MINING_SWING: 4,
    WOODCUTTING_CHANCE: 4,
    FISHING_ATTEMPT: 4,
    DIVINATION_SIPHON: 2,

    // Movement
    WALK_SPEED: 1,  // 1 square per tick
    RUN_SPEED: 2,   // 2 squares per tick

    // Misc
    CHAT_BUBBLE_DURATION: 5,
    PRAYER_ACTIVATION_DELAY: 1,
    STAT_DECAY_INTERVAL: 100,
    BURY_BONES: 1,
    PICKPOCKET: 2,
    PICKPOCKET_FAIL_PENALTY_MIN: 7,
    PICKPOCKET_FAIL_PENALTY_MAX: 10,
} as const;

export interface TickCoordinate {
    readonly gameTick: number;
    readonly playerPhase: number;
    readonly cognitiveCycle: number;
}

export interface CognitiveWindow {
    id: string;
    trigger: string;
    startTick: number;
    startTime: number;
    maxDurationTicks: number;
    snapshot: any;
    cancelled: boolean;
    cancelReason?: string;
    completedTick?: number;
    latencyTicks?: number;
}

export class CanonicalClock {
    private static instance: CanonicalClock;
    private static isBootstrapped = false;

    private gameTick = 0;
    private playerPhase = 0;
    private cognitiveCycle = 0;
    private activeCognitiveWindows: Map<string, CognitiveWindow> = new Map();

    private realBootTime = 0;
    private realTickStart = 0;
    private seed = 0;

    private tickListeners: Array<(tick: number, phase: number, time: number) => void> = [];

    private constructor() {
        this.realBootTime = performance.now();
        this.realTickStart = this.realBootTime;
    }

    public static getInstance(): CanonicalClock {
        if (!CanonicalClock.instance) {
            CanonicalClock.instance = new CanonicalClock();
        }
        return CanonicalClock.instance;
    }

    public static resetForTesting(seed = 0): CanonicalClock {
        CanonicalClock.instance = new CanonicalClock();
        CanonicalClock.instance.setSeed(seed);
        CanonicalClock.isBootstrapped = true;
        return CanonicalClock.instance;
    }

    /**
     * Enforces deterministic epoch origin.
     * Must be called exactly once during system initialization before ANY temporal logic fires.
     */
    public static bootstrap(seed: number): void {
        if (this.isBootstrapped) {
            throw new Error('CanonicalClock is already bootstrapped. Dual-origin timeline detected and rejected.');
        }
        
        const instance = this.getInstance();
        instance.setSeed(seed);
        this.isBootstrapped = true;
        logger.info({ seed }, 'CanonicalClock bootstrapped. Deterministic lattice anchored.');
    }

    public static assertBootstrapped(): void {
        if (!this.isBootstrapped) {
            throw new Error('Temporal Authority Violation: System attempted to read time before CanonicalClock.bootstrap()');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RS-NATIVE CONSTANT ACCESSORS
    // ═══════════════════════════════════════════════════════════════

    public getGameTickMs(): number { return RS_TICKS.GAME_TICK_MS; }
    public getPlayerPhaseMs(): number { return RS_TICKS.PLAYER_PHASE_MS; }
    public getGlobalCooldownTicks(): number { return RS_TICKS.GLOBAL_ABILITY_COOLDOWN; }
    public getWeaponSpeedFastest(): number { return RS_TICKS.WEAPON_SPEED_FASTEST; }
    public getWeaponSpeedAverage(): number { return RS_TICKS.WEAPON_SPEED_AVERAGE; }
    public getWalkSpeed(): number { return RS_TICKS.WALK_SPEED; }
    public getRunSpeed(): number { return RS_TICKS.RUN_SPEED; }
    public getChatBubbleDuration(): number { return RS_TICKS.CHAT_BUBBLE_DURATION; }
    public getStatDecayInterval(): number { return RS_TICKS.STAT_DECAY_INTERVAL; }

    // ═══════════════════════════════════════════════════════════════
    // SIMULATED TIME — Deterministic, derived from T1+T2
    // ═══════════════════════════════════════════════════════════════

    /**
     * simulatedNow() — The ONLY time that enters state.
     *
     * RS rule: "Each action registered within one tick will start to
     * take place by the beginning of the next tick."
     *
     * T1 tick 1427, phase 0: 856200ms
     * T1 tick 1427, phase 1: 856500ms
     * T1 tick 1428, phase 0: 856800ms
     */
    public simulatedNow(): number {
        CanonicalClock.assertBootstrapped();
        return this.gameTick * RS_TICKS.GAME_TICK_MS + this.playerPhase * RS_TICKS.PLAYER_PHASE_MS;
    }

    public getGameTick(): number { return this.gameTick; }
    public getPlayerPhase(): number { return this.playerPhase; }
    public getCognitiveCycle(): number { return this.cognitiveCycle; }

    public isGameTickBoundary(): boolean {
        return this.playerPhase === 0;
    }

    public getCoordinate(): TickCoordinate {
        return {
            gameTick: this.gameTick,
            playerPhase: this.playerPhase,
            cognitiveCycle: this.cognitiveCycle
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // REAL TIME — Diagnostics Only (NEVER enters state)
    // ═══════════════════════════════════════════════════════════════

    public realNow(): number {
        return performance.now() - this.realBootTime;
    }

    public realElapsedInTick(): number {
        return performance.now() - this.realTickStart;
    }

    public getDrift(): number {
        return this.realNow() - this.simulatedNow();
    }

    // ═══════════════════════════════════════════════════════════════
    // HEARTBEAT — Discrete Advancement
    // ═══════════════════════════════════════════════════════════════

    /**
     * pulse() — Advance by one phase (300ms).
     *
     * Sequence:
     *   pulse() -> phase 0 -> T1 GAME TICK (world reduces, ledger commits)
     *   pulse() -> phase 1 -> T2 PLAYER PHASE (combat/ability advances)
     *   pulse() -> phase 0 -> next T1 GAME TICK...
     */
    /**
     * pulse() — Advance the clock across the three-ring lattice.
     *
     * Sequence:
     *   Tier 1 (600ms): World truth, ledger commits.
     *   Tier 2 (300ms): Player combat, agility, reflex.
     *   Tier 3 (T-Optional): Sovereign cognitive expansion/planning.
     */
    public pulse(tier: TickTier = TickTier.GAME): TickCoordinate {
        if (tier === TickTier.GAME) {
            // T1 Boundary: Commit world logic
            this.gameTick++;
            this.realTickStart = performance.now();
            
            // Notify T1 game listeners
            for (const listener of this.tickListeners) {
                try { listener(this.gameTick, this.playerPhase, this.simulatedNow()); }
                catch (err) { logger.error({ err }, 'T1 Listener error'); }
            }
        } else if (tier === TickTier.PLAYER) {
            // T2 Boundary: Player Phase pulse
            this.playerPhase = (this.playerPhase + 1) % 2;
        } else if (tier === TickTier.COGNITIVE) {
            // T3 Boundary: Optional Cognitive Tick (does not advance simulation truth)
            this.cognitiveCycle++;
        }

        return this.getCoordinate();
    }

    /**
     * gameTickOnly() — Advance full game tick (for testing/replay).
     */
    public gameTickOnly(): TickCoordinate {
        this.playerPhase = 0;
        this.gameTick++;
        return this.getCoordinate();
    }


    public registerPulse(pulse: { domain: string, callback: Function, priority: number, name: string }): void {
        this.tickListeners.push(pulse.callback as any);
    }

    public isTickingPermitted(): boolean {
        // Blocks ticking if any critical cognitive window is active
        return this.activeCognitiveWindows.size === 0;
    }

    /**
     * onTick() — Register a listener for T1 game tick boundaries.
     */
    public onTick(listener: (tick: number, phase: number, time: number) => void): void {
        this.tickListeners.push(listener);
    }

    // ═══════════════════════════════════════════════════════════════
    // COGNITIVE WINDOWS — T3 Cortex Layer
    // ═══════════════════════════════════════════════════════════════

    public openCognitiveWindow(trigger: string, snapshot: any, maxDurationTicks = 5): CognitiveWindow {
        this.cognitiveCycle++;
        const id = `cog_${this.gameTick}_${this.cognitiveCycle}`;

        const window: CognitiveWindow = {
            id,
            trigger,
            startTick: this.gameTick,
            startTime: this.simulatedNow(),
            maxDurationTicks,
            snapshot,
            cancelled: false
        };

        this.activeCognitiveWindows.set(id, window);
        return window;
    }

    public closeCognitiveWindow(id: string): boolean {
        const window = this.activeCognitiveWindows.get(id);
        if (window) {
            window.completedTick = this.gameTick;
            window.latencyTicks = window.completedTick - window.startTick;
        }
        return this.activeCognitiveWindows.delete(id);
    }

    public cancelCognitiveWindow(id: string, reason: string): boolean {
        const window = this.activeCognitiveWindows.get(id);
        if (window) {
            window.cancelled = true;
            window.cancelReason = reason;
            return true;
        }
        return false;
    }

    public getActiveCognitiveWindows(): CognitiveWindow[] {
        return Array.from(this.activeCognitiveWindows.values());
    }

    public isCognitiveWindowExpired(window: CognitiveWindow): boolean {
        return (this.gameTick - window.startTick) > window.maxDurationTicks;
    }

    // ═══════════════════════════════════════════════════════════════
    // REPLAY / SEEKING
    // ═══════════════════════════════════════════════════════════════

    public seek(gameTick: number, playerPhase = 0): void {
        this.gameTick = gameTick;
        this.playerPhase = playerPhase;
        this.activeCognitiveWindows.clear();
    }

    public setSeed(seed: number): void {
        this.seed = seed;
        this.gameTick = 0;
        this.playerPhase = 0;
        this.cognitiveCycle = 0;
        this.activeCognitiveWindows.clear();
    }

    public getSeed(): number { return this.seed; }

    // ═══════════════════════════════════════════════════════════════
    // SEEDED RNG — Per-tier deterministic randomness
    // ═══════════════════════════════════════════════════════════════

    /**
     * rng() — Deterministic randomness for combat, drops, skill rolls.
     * Seed = hash(gameTick:playerPhase:seed)
     *
     * RS combat is deterministic per tick — the "random" hit is actually
     * a seeded roll that replays identically.
     */
    public rng(): SeededRNG {
        CanonicalClock.assertBootstrapped();
        const seed = `${this.gameTick}:${this.playerPhase}:${this.seed}`;
        return new SeededRNG(seed);
    }

    /**
     * cognitiveRng() — For T3 processes that need randomness (rare).
     */
    public cognitiveRng(window: CognitiveWindow): SeededRNG {
        const seed = `${window.id}:${window.trigger}:${this.seed}`;
        return new SeededRNG(seed);
    }

    // ═══════════════════════════════════════════════════════════════
    // ZONE 66×66 GAUSSIAN — Spatial Prediction Trigger
    // ═══════════════════════════════════════════════════════════════

    public shouldTriggerZonePrediction(prevX: number, prevY: number, currX: number, currY: number): boolean {
        const prevChunkX = prevX >> 6;
        const prevChunkY = prevY >> 6;
        const currChunkX = currX >> 6;
        const currChunkY = currY >> 6;
        return prevChunkX !== currChunkX || prevChunkY !== currChunkY;
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════════

    public format(): string {
        const tier = this.playerPhase === 0 ? 'T1-GAME' : 'T2-PLAYER';
        const cogCount = this.activeCognitiveWindows.size;
        return `Tick ${this.gameTick}.${this.playerPhase} [${tier}] Cog:${cogCount} @ ${this.simulatedNow()}ms`;
    }

    public healthCheck() {
        return {
            gameTick: this.gameTick,
            playerPhase: this.playerPhase,
            cognitiveCycle: this.cognitiveCycle,
            activeCognitiveWindows: this.activeCognitiveWindows.size,
            simulatedTime: this.simulatedNow(),
            realTime: this.realNow(),
            drift: this.getDrift(),
            seed: this.seed
        };
    }
}

/**
 * SeededRNG — FNV-1a + Park-Miller LCG for deterministic randomness.
 * Used by combat, drops, skill rolls. Replays identically given same tick coordinate.
 */
export class SeededRNG {
    private state: number;

    constructor(seed: string) {
        // FNV-1a hash
        let hash = 0x811c9dc5;
        for (let i = 0; i < seed.length; i++) {
            hash ^= seed.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        this.state = Math.abs(hash) % 2147483647;
        if (this.state === 0) this.state = 1; // Park-Miller requires non-zero
    }

    next(): number {
        this.state = (this.state * 16807) % 2147483647;
        return (this.state - 1) / 2147483646;
    }

    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    id(prefix: string): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = prefix + '_';
        for (let i = 0; i < 8; i++) {
            result += chars[this.range(0, chars.length - 1)];
        }
        return result;
    }
}

/** Singleton export for convenience */
export const clock = CanonicalClock.getInstance();
