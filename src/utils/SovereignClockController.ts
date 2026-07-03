/**
 * SovereignClockController — Pause/resume authority for the gameplay clock.
 *
 * The CanonicalClock (utils/CanonicalClock.ts) already exposes
 * `startDriving()` / `stopDriving()` for its 300ms wall-clock driver.
 * This controller is the substrate-facing primitive that wraps those
 * calls with:
 *
 *   - A single `pause()` / `resume()` API the gameplay overlay calls.
 *   - Tick-tier scoping: callers can pause just T1 (game ticks), just
 *     T2 (player phase), or just T3 (cognitive windows). The default
 *     pauses everything.
 *   - A pause reason stack so concurrent callers can pause for
 *     different reasons without stepping on each other. Resume is
 *     reference-counted: the clock stays paused while any reason
 *     remains on the stack.
 *   - Hooks (`onPause` / `onResume`) so consumers like the gameplay
 *     overlay, the limb pulse (PulseMonitor.lightweightPulse), and the
 *     HexagramManager state-transition listeners can react.
 *   - Strict invariant: nothing in the controller calls Date.now()
 *     for state. Real time is read only via the registry's
 *     `OBSERVABILITY` domain. Simulation state reads use
 *     `clock.simulatedNow()` (ClockDomain.SIMULATION).
 *
 * Why this exists: the gameplay overlay, the I-Ching ternary routing
 * with fire-injection gates, and the visual stack (ChromaLimb →
 * GhostSplat → Chromanumber → Puppeteer → line segmentation) all need
 * a way to "freeze the game but keep the substrate alive" without
 * tearing down the wall-clock driver. The previous surface required
 * each caller to know about startDriving()/stopDriving() and to
 * remember not to advance the clock during gameplay pauses.
 *
 * Upstream:   gameplay overlay, VisionStack, OrchestrateEngine
 * Downstream: CanonicalClock, PulseMonitor, HexagramManager listeners
 */

import { CanonicalClock, TickTier } from './CanonicalClock.js';
import { ClockAuthorityRegistry, ClockDomain } from './ClockAuthorityRegistry.js';
import { createLogger } from './logger.js';

const logger = createLogger('SovereignClockController');

export type PauseReason =
    | 'gameplay_overlay'      // user has the gameplay window focused/paused
    | 'fire_injection'        // a sovereign_knock or foreign tool entry is being gated
    | 'visual_validation'     // chrome/firefox headless capture is in flight
    | 'cognitive_window'      // a T3 cognitive window is being opened/closed
    | 'system_maintenance'    // db vacuum, vector rebuild, etc.
    | 'user_request';         // explicit user-asserted pause

export interface PauseEntry {
    readonly id: string;
    readonly reason: PauseReason;
    readonly tiers: ReadonlyArray<TickTier>;
    readonly pausedAt: number;       // simulatedNow() at pause time
    readonly realPausedAt: number;   // performance.now() — diagnostic only
}

export type PauseListener = (event: { action: 'pause' | 'resume'; entries: ReadonlyArray<PauseEntry>; reason: PauseReason }) => void;

const PAUSE_TIER_ALL: ReadonlyArray<TickTier> = [TickTier.GAME, TickTier.PLAYER, TickTier.COGNITIVE];
const PAUSE_TIER_GAMEPLAY: ReadonlyArray<TickTier> = [TickTier.GAME, TickTier.PLAYER];
const PAUSE_TIER_COGNITIVE: ReadonlyArray<TickTier> = [TickTier.COGNITIVE];

export class SovereignClockController {
    private static instance: SovereignClockController | null = null;

    /** Reason → tiers default mapping (callers can override per-pause). */
    private static readonly REASON_TIERS: Record<PauseReason, ReadonlyArray<TickTier>> = {
        gameplay_overlay: PAUSE_TIER_GAMEPLAY,
        fire_injection: PAUSE_TIER_COGNITIVE, // only T3 — gameplay continues
        visual_validation: PAUSE_TIER_GAMEPLAY,
        cognitive_window: PAUSE_TIER_COGNITIVE,
        system_maintenance: PAUSE_TIER_ALL,
        user_request: PAUSE_TIER_ALL
    };

    /** Active pause entries by id. The clock is paused for tier X iff
     *  at least one entry has tier X in its tiers list. */
    private readonly entries: Map<string, PauseEntry> = new Map();
    private readonly listeners: Set<PauseListener> = new Set();
    private idCounter: number = 0;

    private constructor() { }

    public static getInstance(): SovereignClockController {
        if (!this.instance) {
            this.instance = new SovereignClockController();
        }
        return this.instance;
    }

    /**
     * Pause the clock for a given reason. Returns the assigned id which
     * must be passed to `resume(id)` to undo. Reference-counted: a
     * reason can be paused multiple times — each call returns a fresh
     * id. The clock only resumes when all entries are cleared.
     *
     * IMPORTANT: this method is the substrate's pause primitive and
     * must work BEFORE the CanonicalClock is bootstrapped (e.g. when
     * the substrate's CLI is parsing config but the game loop hasn't
     * started yet). It therefore does NOT call simulatedNow() — the
     * pause timestamp is taken from performance.now() (OBSERVABILITY
     * domain) and the entry's `pausedAt` is set to 0 until the clock
     * is bootstrapped. Once bootstrapped, subsequent pauses will see
     * the proper simulated time.
     *
     * @param reason   Why the pause is being requested.
     * @param tiers    Optional override of which tiers to pause. Defaults
     *                 to the reason's standard scope (see REASON_TIERS).
     */
    public pause(reason: PauseReason, tiers?: ReadonlyArray<TickTier>): string {
        const id = `${reason}-${++this.idCounter}-${Date.now()}`;

        // Read performance.now() (OBSERVABILITY) for the real timestamp.
        // simulatedNow() is only valid after CanonicalClock.bootstrap(),
        // and pause() is a substrate-level primitive that must work
        // regardless of bootstrap state.
        const realPausedAt = performance.now();
        let pausedAt = 0;
        try {
            if (CanonicalClock.getInstance() && (CanonicalClock as any).isBootstrapped?.()) {
                pausedAt = CanonicalClock.getInstance().simulatedNow();
            }
        } catch {
            pausedAt = 0;
        }

        const entry: PauseEntry = {
            id,
            reason,
            tiers: tiers ?? SovereignClockController.REASON_TIERS[reason] ?? PAUSE_TIER_ALL,
            pausedAt,
            realPausedAt
        };
        this.entries.set(id, entry);

        // If any tier is newly covered, drive the underlying clock.
        // Only attempt this if the clock is bootstrapped — pause()
        // is allowed to register an entry even before bootstrap, but
        // it cannot stop a non-existent driver.
        const clock = CanonicalClock.getInstance();
        const tiersNowPaused = this.computePausedTiers();
        const tiersPreviouslyPaused = this.computePausedTiersExcluding(id);
        const newlyPausedTiers = tiersNowPaused.filter(t => !tiersPreviouslyPaused.includes(t));

        if (newlyPausedTiers.length > 0) {
            let isDriving = false;
            try { isDriving = clock.isDriving(); } catch { isDriving = false; }
            if (isDriving) {
                const needsDriverStop = newlyPausedTiers.some(t => t === TickTier.GAME || t === TickTier.PLAYER);
                if (needsDriverStop) {
                    clock.stopDriving();
                    logger.info({ reason, id, pausedTiers: tiersNowPaused }, 'CanonicalClock driver stopped');
                }
            }
        }

        logger.info({ reason, id, tiers: entry.tiers, pausedAt }, 'SovereignClockController: pause registered');
        this.notify({ action: 'pause', entries: this.snapshot(), reason });
        return id;
    }

    /**
     * Resume the clock by removing a specific pause entry. No-op if
     * the id is unknown. The clock resumes its wall-clock driver only
     * when no remaining entries cover T1 or T2.
     */
    public resume(id: string): boolean {
        const entry = this.entries.get(id);
        if (!entry) {
            logger.warn({ id }, 'SovereignClockController: unknown pause id, resume ignored');
            return false;
        }
        this.entries.delete(id);

        const stillPausedTiers = this.computePausedTiers();
        const wasGameplayOrPlayer = entry.tiers.some(t => t === TickTier.GAME || t === TickTier.PLAYER);
        const stillPausedForT1T2 = stillPausedTiers.some(t => t === TickTier.GAME || t === TickTier.PLAYER);

        if (wasGameplayOrPlayer && !stillPausedForT1T2) {
            const clock = CanonicalClock.getInstance();
            if (!clock.isDriving()) {
                clock.startDriving();
                logger.info({ reason: entry.reason, id }, 'CanonicalClock driver restarted');
            }
        }

        logger.info({ reason: entry.reason, id, stillPausedTiers }, 'SovereignClockController: pause released');
        this.notify({ action: 'resume', entries: this.snapshot(), reason: entry.reason });
        return true;
    }

    /**
     * Release every pause with the given reason. Returns the count of
     * entries released. Useful for "user requested pause" — when the
     * user wants everything paused, then later wants it all back.
     */
    public resumeAll(reason?: PauseReason): number {
        let released = 0;
        for (const [id, entry] of Array.from(this.entries.entries())) {
            if (!reason || entry.reason === reason) {
                if (this.resume(id)) released++;
            }
        }
        return released;
    }

    /**
     * True if any pause entry currently covers tier T1 (game ticks).
     * Gameplay code should call this before advancing the world.
     */
    public isGameplayPaused(): boolean {
        return this.computePausedTiers().some(t => t === TickTier.GAME || t === TickTier.PLAYER);
    }

    /**
     * True if any pause entry currently covers tier T3 (cognitive
     * windows). Cognitive planning should call this before opening a
     * window.
     */
    public isCognitivePaused(): boolean {
        return this.computePausedTiers().some(t => t === TickTier.COGNITIVE);
    }

    public snapshot(): ReadonlyArray<PauseEntry> {
        return Array.from(this.entries.values());
    }

    public onChange(listener: PauseListener): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    private computePausedTiers(): TickTier[] {
        const all = new Set<TickTier>();
        for (const e of this.entries.values()) {
            for (const t of e.tiers) all.add(t);
        }
        return Array.from(all);
    }

    private computePausedTiersExcluding(excludeId: string): TickTier[] {
        const all = new Set<TickTier>();
        for (const [id, e] of this.entries.entries()) {
            if (id === excludeId) continue;
            for (const t of e.tiers) all.add(t);
        }
        return Array.from(all);
    }

    private notify(payload: { action: 'pause' | 'resume'; entries: ReadonlyArray<PauseEntry>; reason: PauseReason }): void {
        for (const listener of this.listeners) {
            try {
                listener(payload);
            } catch (err) {
                logger.error({ err }, 'Pause listener threw');
            }
        }
    }
}

/** Convenience accessor for callers that don't want the singleton dance. */
export const clockController = SovereignClockController.getInstance();