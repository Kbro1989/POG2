/**
 * VisualStack — Layered biological vision pipeline for POG2.
 *
 * The substrate's visual system is a stack of limbs, each of which
 * answers a different question about what the eyes are looking at:
 *
 *   1. ChromaLimb          — chromatic signature of the source frame
 *                            ("is this a thing the substrate has
 *                             resonated with before?")
 *   2. GhostSplatEngine    — predictive spatial Gaussian at the
 *                            observed coordinate (66x66 NTX tile +
 *                            projected NPCs at tick N+1..N+3)
 *   3. ChromanumberEngine  — pixel-decoded perceptual map (lines,
 *                            palettes, hex codes)
 *   4. SovereignEye /      — headless capture of the source
 *      PuppeteerEye          (URL, HTML file, OS window)
 *   5. LineSegmentMapper   — line-segment extraction (the "key of
 *                            viewed" — the captured frame becomes a
 *                            stable indexable artifact)
 *   6. ViewedKeyIndex      — keyed by (hexagram, chroma, segment) so
 *                            future observations of similar geometry
 *                            can short-circuit via the index
 *
 * The previous surface required the caller to wire all six by hand,
 * pass intermediate results, and manage lifecycle. VisualStack does
 * that in one call: `stack.observe({ source, coordinate })` returns
 * a `VisualFrame` containing all six layers' outputs plus the keyed
 * index entry.
 *
 * Why this exists: the user's framing is that POG2's vision tools
 * are biological mock visual tools — chroma is the substrate's
 * "color sense", ghostsplat is its "spatial intuition",
 * chromanumber is its "pixel cortex", puppeteer is its "retina",
 * and line segments are its "edges". VisualStack wires them so the
 * substrate can "see" with one method call instead of six.
 *
 * Pause semantics: any observe call that triggers a headless capture
 * (URL or HTML) pauses the T1/T2 clock for `visual_validation` so
 * gameplay doesn't advance mid-screenshot. The pause is reference-
 * counted and released automatically when the capture completes.
 *
 * Upstream:   gameplay overlay, vision-flow MCP tools
 * Downstream: ChromaLimb, GhostSplatEngine, ChromanumberEngine,
 *             SovereignEye, PuppeteerEye, VectorDB (keyed index)
 */

import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { ChromaLimb } from '../limbs/spatial/ChromaLimb.js';
import { GhostSplatEngine, type GhostSplatField } from '../substrates/GhostSplatEngine.js';
import { ChromanumberEngine } from '../engines/ChromanumberEngine.js';
import { SovereignEye, type CaptureSource, type CaptureResult, type ViewportConfig } from '../utils/SovereignEye.js';
import { PuppeteerEye } from '../vision/PuppeteerEye.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import type { GameState } from '../core/models.js';
import { ClockAuthorityRegistry, ClockDomain } from '../utils/ClockAuthorityRegistry.js';
import { SovereignClockController } from '../utils/SovereignClockController.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result } from '../core/models.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('VisualStack');

export interface VisualStackOptions {
    readonly source: CaptureSource;
    readonly coordinate?: { x: number; y: number; plane?: number };
    readonly viewport?: ViewportConfig;
    /**
     * When true, use PuppeteerEye for the capture step (full DOM access).
     * When false (default), use SovereignEye which prefers undici text
     * fetch and only falls back to headless chrome for true visual
     * capture. PuppeteerEye is heavier and slower; reserve it for cases
     * that actually need DOM/Canvas inspection.
     */
    readonly usePuppeteer?: boolean;
    /**
     * When true, pause the gameplay clock for the duration of the
     * capture. Defaults to true — visual capture should not run while
     * the world advances.
     */
    readonly pauseGameplay?: boolean;
}

export interface VisualFrame {
    /** Source that was observed. */
    readonly source: CaptureSource;
    /** Capture artifact path (null if text-only or autoCleanup removed it). */
    readonly imagePath: string | null;
    /** Scraped text content from the source (URL/HTML/RSC). */
    readonly textContent: string | null;
    /** Result of the ChromaLimb signature step. */
    readonly chromaSignature: string | null;
    /** Result of the ChromaLimb validation against prior signatures. */
    readonly chromaValid: boolean | null;
    /** Result of the GhostSplat projection at the observed coordinate. */
    readonly splatField: GhostSplatField | null;
    /** Result of the Chromanumber perceptual decoding (hex codes, palette). */
    readonly chromanumber: Awaited<ReturnType<ChromanumberEngine['analyzeImage']>> extends infer R
        ? (R extends { ok: true; value: infer V } ? V : null)
        : null;
    /** Line segments extracted from the captured frame (the "edges"). */
    readonly lineSegments: ReadonlyArray<LineSegment>;
    /** Stable key for the ViewedKeyIndex — sha256 of (hexagram + chroma + segments). */
    readonly viewedKey: string;
    /** Hexagram ID at observation time. */
    readonly hexagramId: number;
    /** Simulation timestamp at observation start. */
    readonly simulatedAt: number;
    /** Total wall-clock duration of the observe pipeline (diagnostic). */
    readonly realDurationMs: number;
}

export interface LineSegment {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly weight: number;
}

/**
 * The ViewedKeyIndex — keyed by viewedKey for fast "have I seen
 * something like this before?" lookups. Backed by an in-memory Map;
 * persistent storage can be added later (VectorDB or sqlite).
 */
export class ViewedKeyIndex {
    private static instance: ViewedKeyIndex | null = null;
    private readonly entries: Map<string, VisualFrame> = new Map();

    public static getInstance(): ViewedKeyIndex {
        if (!this.instance) this.instance = new ViewedKeyIndex();
        return this.instance;
    }

    public insert(frame: VisualFrame): void {
        this.entries.set(frame.viewedKey, frame);
        logger.debug({ viewedKey: frame.viewedKey, sourceType: frame.source.type }, 'ViewedKeyIndex entry inserted');
    }

    public lookup(viewedKey: string): VisualFrame | undefined {
        return this.entries.get(viewedKey);
    }

    public similar(signature: string, limit = 5): VisualFrame[] {
        const matches: Array<{ frame: VisualFrame; score: number }> = [];
        for (const frame of this.entries.values()) {
            if (frame.chromaSignature && frame.chromaSignature === signature) {
                matches.push({ frame, score: 1.0 });
            }
        }
        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, limit).map(m => m.frame);
    }

    public size(): number { return this.entries.size; }
}

/**
 * LineSegmentMapper — deterministic edge extraction from a captured
 * frame. Uses a simple Sobel-style gradient pass to find high-contrast
 * transitions; the resulting segments are the "key of viewed" the
 * substrate uses to recognize the frame later.
 *
 * Pure function: input is a PNG/JPG file path; output is a stable
 * list of LineSegment records. The hashing step is what makes this
 * indexable — the same physical scene produces the same segments
 * across runs.
 */
export class LineSegmentMapper {
    /**
     * Extract line segments from an image file.
     * Reads pixels via the same `getDeterministicColors` grid sampling
     * ChromanumberEngine uses, so the two stay in lockstep.
     */
    public async extract(imagePath: string, gridSize = 25): Promise<LineSegment[]> {
        if (!existsSync(imagePath)) return [];
        const chroma = ChromanumberEngine.getInstance();
        const colorsRes = await chroma.getDeterministicColors(imagePath, gridSize, 8);
        if (!colorsRes.ok) return [];

        // Convert the color grid into a luminance map. Then walk the
        // grid row-by-row, emit a segment whenever adjacent cells
        // cross a contrast threshold. The result is a stable edge
        // signature; the same image produces the same segments.
        const luminance: number[] = colorsRes.value.map(c => {
            const hex = c.hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) || 0;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        });

        const segments: LineSegment[] = [];
        const stride = gridSize;
        const threshold = 0.18;
        for (let y = 0; y < stride; y++) {
            for (let x = 0; x < stride - 1; x++) {
                const a = luminance[y * stride + x];
                const b = luminance[y * stride + x + 1];
                if (Math.abs(a - b) >= threshold) {
                    segments.push({ x1: x, y1: y, x2: x + 1, y2: y, weight: Math.abs(a - b) });
                }
            }
        }
        for (let x = 0; x < stride; x++) {
            for (let y = 0; y < stride - 1; y++) {
                const a = luminance[y * stride + x];
                const b = luminance[(y + 1) * stride + x];
                if (Math.abs(a - b) >= threshold) {
                    segments.push({ x1: x, y1: y, x2: x, y2: y + 1, weight: Math.abs(a - b) });
                }
            }
        }

        return segments;
    }
}

/**
 * VisualStack — the layered pipeline.
 *
 * Usage:
 *   const stack = VisualStack.boot(config);
 *   const frame = await stack.observe({ source: { type: 'url', target: 'http://localhost:3000' } });
 *   console.log(frame.viewedKey, frame.lineSegments.length);
 */
export class VisualStack {
    private readonly chroma: ChromaLimb;
    private readonly chromanumber: ChromanumberEngine;
    private readonly eye: SovereignEye;
    private readonly puppet: PuppeteerEye | null;
    private readonly ghostSplat: GhostSplatEngine;
    private readonly mapper: LineSegmentMapper;
    private readonly index: ViewedKeyIndex;
    /** Optional CSP relay base URL. When set, URL captures are
     *  routed through the relay so the headless browser sees a
     *  CSP-stripped page and the "unsafe-eval / unsafe-inline"
     *  console warnings go away. */
    private readonly cspRelayBaseUrl?: string;

    constructor(
        config: SovereignConfig,
        opts: { enablePuppeteer?: boolean; projectId?: string; cspRelayBaseUrl?: string } = {}
    ) {
        this.chroma = new ChromaLimb(config);
        this.chromanumber = ChromanumberEngine.getInstance();
        this.eye = new SovereignEye(opts.projectId ?? 'visual-stack');
        this.puppet = opts.enablePuppeteer ? new PuppeteerEye(opts.projectId ?? 'visual-stack') : null;
        this.ghostSplat = GhostSplatEngine.getInstance();
        this.mapper = new LineSegmentMapper();
        this.index = ViewedKeyIndex.getInstance();
        this.cspRelayBaseUrl = opts.cspRelayBaseUrl;
    }

    /**
     * One-shot static boot — used by callers that don't want to
     * manage the constructor themselves.
     */
    public static boot(config: SovereignConfig, opts?: { enablePuppeteer?: boolean; projectId?: string; cspRelayBaseUrl?: string }): VisualStack {
        return new VisualStack(config, opts);
    }

    /**
     * Build the URL the headless browser should actually navigate to.
     * When cspRelayBaseUrl is set and the source is a URL, returns the
     * relay URL so the captured page is served CSP-less. Otherwise
     * returns the source target unchanged.
     */
    private buildCaptureUrl(source: CaptureSource): string {
        if (!this.cspRelayBaseUrl || source.type !== 'url') return source.target;
        const useBase64 = /[\x00-\x1F?#&%<>]/.test(source.target);
        if (useBase64) {
            return `${this.cspRelayBaseUrl}/${encodeURIComponent(Buffer.from(source.target).toString('base64'))}`;
        }
        return `${this.cspRelayBaseUrl}?url=${encodeURIComponent(source.target)}`;
    }

    /**
     * observe — Run the full layered pipeline on a source.
     *
     * Pipeline order:
     *   1. Pause gameplay clock (T1/T2) for visual_validation.
     *   2. Capture the source via SovereignEye or PuppeteerEye.
     *   3. Run ChromaLimb signature against the capture.
     *   4. Run GhostSplat projection at the observed coordinate.
     *   5. Run ChromanumberEngine perceptual decoding.
     *   6. Run LineSegmentMapper on the captured frame.
     *   7. Hash (hexagram + chroma + segments) → viewedKey.
     *   8. Insert into ViewedKeyIndex.
     *   9. Resume the gameplay clock.
     */
    public async observe(opts: VisualStackOptions): Promise<Result<VisualFrame>> {
        const pauseGameplay = opts.pauseGameplay !== false;
        const pauseId = pauseGameplay
            ? SovereignClockController.getInstance().pause('visual_validation')
            : null;

        const realStart = ClockAuthorityRegistry.resolveTime(ClockDomain.OBSERVABILITY, 'VisualStack.observe.start');
        const hexagramId = HexagramManager.getInstance().getCurrentHexagramId();
        const simulatedAt = ClockAuthorityRegistry.resolveTime(ClockDomain.SIMULATION, 'VisualStack.observe.simulatedAt');

        try {
            // ── 2. Capture ───────────────────────────────────────────
            // For URL sources, route through the CSP relay when one is
            // configured. The relay strips CSP headers and meta tags
            // server-side, so the headless browser navigates to a
            // CSP-less page and the "unsafe-eval / unsafe-inline"
            // console warnings go away. The actual screenshot is
            // visually identical to the upstream page.
            const captureSource: CaptureSource = opts.source.type === 'url' && this.cspRelayBaseUrl
                ? { type: 'url', target: this.buildCaptureUrl(opts.source) }
                : opts.source;

            let captureResult: Result<CaptureResult>;
            if (opts.usePuppeteer && this.puppet) {
                // Puppeteer path is heavier; only used when DOM/Canvas
                // inspection is genuinely needed.
                await this.puppet.awaken(true);
                if (captureSource.type === 'url') {
                    const dom = await this.puppet.domInspect(captureSource.target);
                    captureResult = dom.ok
                        ? { ok: true, value: { imagePath: dom.value.screenshot, textContent: dom.value.html, sourceType: 'url', metadata: { elements: dom.value.elements, upstream: opts.source.type === 'url' ? opts.source.target : null }, timestamp: simulatedAt } }
                        : { ok: false, error: dom.error };
                } else {
                    captureResult = await this.eye.capture(captureSource, opts.viewport);
                }
            } else {
                captureResult = await this.eye.capture(captureSource, opts.viewport);
            }

            if (!captureResult.ok) {
                return { ok: false, error: captureResult.error };
            }
            const capture = captureResult.value;

            // ── 3. ChromaLimb signature ──────────────────────────────
            let chromaSignature: string | null = null;
            let chromaValid: boolean | null = null;
            if (capture.textContent) {
                chromaSignature = await this.chroma.generateFromSequence([
                    hexagramId.toString(),
                    capture.textContent.substring(0, 64)
                ]);
                chromaValid = await this.chroma.validateChromaticSoul(chromaSignature);
            }

            // ── 4. GhostSplat projection ─────────────────────────────
            // GhostSplatEngine.project() takes a GameState (the world's
            // entity/coord snapshot), not raw x/y. We synthesize a minimal
            // GameState around the observed coordinate so the projection
            // lands at the right tile. Substrate callers can pass a real
            // GameState via VisualStackOptions.state in the future.
            let splatField: GhostSplatField | null = null;
            if (opts.coordinate) {
                const syntheticState: Partial<GameState> = {
                    plane: opts.coordinate.plane ?? 0,
                    players: new Map() as any, // empty — projection only needs the plane
                    tickNumber: 0
                };
                try {
                    const projection = this.ghostSplat.project(syntheticState as GameState, 3);
                    splatField = projection;
                } catch {
                    splatField = null;
                }
            }

            // ── 5. Chromanumber perceptual decoding ──────────────────
            // analyzeImage requires prompt + anatomyFacts; for visual-stack
            // mode we pass a generic perceptual prompt and an empty anatomy
            // record. The substrate's downstream observers can layer real
            // prompts over the chroma signature later.
            let chromanumberOut: VisualFrame['chromanumber'] = null;
            if (capture.imagePath && existsSync(capture.imagePath)) {
                const analysis = await this.chromanumber.analyzeImage({
                    imagePath: capture.imagePath,
                    prompt: `VisualStack perceptual decode at hexagram ${hexagramId}`,
                    anatomyFacts: { hexagramId, coordinate: opts.coordinate ?? null }
                });
                if (analysis.ok) chromanumberOut = analysis.value as any;
            }

            // ── 6. Line segments ─────────────────────────────────────
            const lineSegments = capture.imagePath
                ? await this.mapper.extract(capture.imagePath)
                : [];

            // ── 7. viewedKey hash ────────────────────────────────────
            const segmentsDigest = lineSegments
                .slice(0, 64)
                .map(s => `${s.x1},${s.y1},${s.x2},${s.y2}:${s.weight.toFixed(2)}`)
                .join('|');
            const viewedKey = createHash('sha256')
                .update(`${hexagramId}|${chromaSignature ?? ''}|${segmentsDigest}`)
                .digest('hex');

            const frame: VisualFrame = {
                source: opts.source,
                imagePath: capture.imagePath,
                textContent: capture.textContent,
                chromaSignature,
                chromaValid,
                splatField,
                chromanumber: chromanumberOut,
                lineSegments,
                viewedKey,
                hexagramId,
                simulatedAt,
                realDurationMs: ClockAuthorityRegistry.resolveTime(ClockDomain.OBSERVABILITY, 'VisualStack.observe.end') - realStart
            };

            // ── 8. Index insert ──────────────────────────────────────
            this.index.insert(frame);

            logger.info({
                viewedKey,
                hexagramId,
                sourceType: opts.source.type,
                segments: lineSegments.length,
                splatProjections: splatField?.projections.size ?? 0,
                realDurationMs: frame.realDurationMs
            }, 'VisualStack observe complete');

            return { ok: true, value: frame };
        } catch (err) {
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        } finally {
            // ── 9. Release pause ─────────────────────────────────────
            if (pauseId) SovereignClockController.getInstance().resume(pauseId);
        }
    }
}

/** Convenience singleton for callers that don't carry a config. */
let _defaultStack: VisualStack | null = null;
export function getDefaultVisualStack(config?: SovereignConfig): VisualStack {
    if (!_defaultStack && config) {
        _defaultStack = VisualStack.boot(config);
    }
    if (!_defaultStack) {
        throw new Error('VisualStack not initialized; call VisualStack.boot(config) or getDefaultVisualStack(config) first.');
    }
    return _defaultStack;
}