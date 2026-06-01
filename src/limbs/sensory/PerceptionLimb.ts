import { ChromaCore, PerceivedFrame, ColorDelta, PerceptionValidation, ChromaSampleResult } from '../../utils/ChromaCore.js';
import { SovereignEye } from '../../utils/SovereignEye.js';
import { Result, ok, err } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('PerceptionLimb');

export interface Frame {
  timestamp: number;
  imagePath: string;
}

export interface PerceptionState {
  frame: Frame;
  sample: ChromaSampleResult;
  validation?: PerceptionValidation;
}

export interface TemporalState {
  frames: PerceivedFrame[];
  deltas: ColorDelta[];
  /** true if palette changed significantly between any two consecutive frames */
  hasMotion: boolean;
  /** changeScore of the most recent delta, 0..1 */
  latestChangeScore: number;
}

/**
 * PerceptionLimb (Limb #36) — Single interface over all sensory substrates.
 *
 * Architecture position: Layer 4 (optional / fallback).
 * Cache truth is Layer 1. This is validation only.
 *
 * Subsystems:
 *   - ChromaCore      → pixel sampling (deterministic, no LLM)
 *   - SovereignEye    → screen capture
 *   - Temporal buffer → frame sequence for motion/delta detection
 */
export class PerceptionLimb {
  private eye: SovereignEye;
  private frameBuffer: PerceivedFrame[] = [];
  private readonly BUFFER_SIZE = 16; // ring buffer depth

  constructor(private readonly captureTarget: string = 'POG2') {
    this.eye = new SovereignEye('perception-limb');
  }

  // ── Primary API ─────────────────────────────────────────────────────────────

  /**
   * capture — Take a screenshot and return a Frame.
   */
  async capture(): Promise<Result<Frame>> {
    const res = await this.eye.capture({ type: 'window', target: this.captureTarget });
    if (!res.ok) return res as any;

    return ok({
      timestamp: Date.now(),
      imagePath: res.value.imagePath || ''
    });
  }

  /**
   * analyze — Sample a frame's pixel palette (deterministic, no LLM).
   * Returns structured PerceptionState — never a "PASS" string.
   */
  async analyze(
    frame: Frame,
    expectedPalette?: string[]
  ): Promise<Result<PerceptionState>> {
    const sampleRes = await ChromaCore.sample(frame.imagePath, { gridSize: 50, maxColors: 10 });
    if (!sampleRes.ok) return sampleRes as any;

    let validation: PerceptionValidation | undefined;
    if (expectedPalette && expectedPalette.length > 0) {
      const valRes = await ChromaCore.validate(frame.imagePath, expectedPalette);
      if (valRes.ok) validation = valRes.value;
    }

    const perceivedFrame: PerceivedFrame = {
      timestamp: frame.timestamp,
      imagePath: frame.imagePath,
      sample: sampleRes.value,
      delta: this.computeDeltaFromBuffer(sampleRes.value)
    };

    this.pushToBuffer(perceivedFrame);

    logger.debug({
      imagePath: frame.imagePath,
      colors: sampleRes.value.colors.length,
      confidence: validation?.confidence
    }, 'PerceptionLimb: frame analyzed');

    return ok({ frame, sample: sampleRes.value, validation });
  }

  /**
   * track — Analyze a sequence of pre-captured frames for temporal state.
   * Detects animation transitions, UI changes, HP drops, menu opens.
   */
  async track(frames: Frame[]): Promise<Result<TemporalState>> {
    if (frames.length === 0) {
      return err(new Error('PerceptionLimb.track: no frames provided'));
    }

    const perceived: PerceivedFrame[] = [];
    const deltas: ColorDelta[] = [];

    for (let i = 0; i < frames.length; i++) {
      const sampleRes = await ChromaCore.sample(frames[i]!.imagePath, { gridSize: 50, maxColors: 10 });
      if (!sampleRes.ok) continue;

      const prev = perceived[i - 1];
      const delta = prev ? ChromaCore.diff(prev.sample, sampleRes.value) : undefined;
      if (delta) deltas.push(delta);

      perceived.push({
        timestamp: frames[i]!.timestamp,
        imagePath: frames[i]!.imagePath,
        sample: sampleRes.value,
        delta
      });
    }

    const latestChangeScore = deltas.length > 0
      ? deltas[deltas.length - 1]!.changeScore
      : 0;

    // Motion threshold: 15% palette shift = something visible changed
    const hasMotion = deltas.some(d => d.changeScore > 0.15);

    return ok({
      frames: perceived,
      deltas,
      hasMotion,
      latestChangeScore
    });
  }

  // ── Convenience: capture + analyze in one call ───────────────────────────

  async captureAndAnalyze(expectedPalette?: string[]): Promise<Result<PerceptionState>> {
    const captureRes = await this.capture();
    if (!captureRes.ok) return captureRes as any;
    return this.analyze(captureRes.value, expectedPalette);
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private computeDeltaFromBuffer(current: ChromaSampleResult): ColorDelta | undefined {
    const prev = this.frameBuffer[this.frameBuffer.length - 1];
    return prev ? ChromaCore.diff(prev.sample, current) : undefined;
  }

  private pushToBuffer(frame: PerceivedFrame): void {
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.BUFFER_SIZE) {
      this.frameBuffer.shift(); // evict oldest
    }
  }

  getBuffer(): PerceivedFrame[] {
    return [...this.frameBuffer];
  }

  clearBuffer(): void {
    this.frameBuffer = [];
  }

  public healthCheck(): { online: boolean; details: string } {
    return {
      online: true,
      details: `PerceptionLimb active | buffer: ${this.frameBuffer.length}/${this.BUFFER_SIZE} frames`
    };
  }
}

