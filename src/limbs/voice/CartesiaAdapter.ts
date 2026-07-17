/**
 * CartesiaAdapter.ts
 *
 * Prosthetic voice adapter: translates the oracle's continuous 5-axis emotional
 * topology into Cartesia's discrete API constraints.
 *
 * Direction of dependency:
 *   OracleEngine → pure payload → THIS FILE → Cartesia API
 *
 * The oracle never imports Cartesia types. This adapter imports oracle types.
 * The adapter is isolated, audited, versioned, and swappable.
 *
 * Hard-coded mapping rationale: Cartesia's /tts/bytes supports only discrete
 * emotion tags + numeric speed via generation_config. Continuous latent control
 * is not exposed. This adapter is the minimum-necessary foreign body tolerated
 * because the system must speak through a throat that does not understand
 * continuous emotion.
 *
 * @see oracle-avatar-payload-spec.md §2.7, §6
 */

// ── Oracle types (pure payload surface) ────────────────────────────────
import type {
  EmotionalVector5,
  TemporalPhase,
  Trajectory,
  VECKey,
} from '../spatial/oracle-avatar-payload-spec';

// ── Adapter audit surface ───────────────────────────────────────────────
export interface AdapterAudit {
  timestamp: number;
  input_vector: EmotionalVector5;
  input_trajectory: Trajectory;
  input_agree_temporal: TemporalPhase;
  output_emotion: string;
  output_level: string;
  output_speed: number;
  mapping_version: string;
  oracle_hexagram_id?: number;
}

// ── Cartesia API surface (this adapter owns this, not the oracle) ────────
/**
 * Exact shape sent to POST https://api.cartesia.ai/tts/bytes
 * under header Cartesia-Version: 2026-03-01
 */
export interface CartesiaTTSRequest {
  model_id: 'sonic-3.5' | 'sonic-3' | 'sonic-latest';
  transcript: string;
  voice: {
    mode: 'id';
    id: string;
    __experimental_controls?: {
      speed?: 'slowest' | 'slow' | 'normal' | 'fast' | 'fastest';
      emotion?: string[];
    };
  };
  output_format: {
    container: 'raw' | 'wav' | 'mp3';
    sample_rate?: number;
    encoding?: string;
  };
  language?: string;
  generation_config?: {
    volume: number;
    speed: number;
  };
}

export interface CartesiaTTSResponse {
  audio: ArrayBuffer;
  voice_id: string;
  backend: 'cartesia';
  model: string;
  audit: AdapterAudit;
}

// ── Backend adapter interface ───────────────────────────────────────────
/**
 * Any TTS backend must implement this contract.
 *
 * Future backend with continuous latent controls would replace
 * CartesiaAdapter, not extend it.
 */
export interface TTSBackendAdapter {
  /** Adapter version for audit reproducibility. */
  readonly mapping_version: string;

  /** Translate pure oracle payload into backend-specific API call. */
  synthesize(
    text: string,
    vector: EmotionalVector5,
    trajectory: Trajectory,
    agree_temporal: TemporalPhase,
    baseVoiceId: string,
    baseSpeed: number,
  ): Promise<CartesiaTTSResponse>;

  /** Return the audit record from the most recent call. */
  lastAudit(): AdapterAudit | null;
}

// ── Mapping configuration ───────────────────────────────────────────────
/**
 * HARD-CODED MAPPING — FOREIGN BODY, TOLERATED.
 *
 * This table is the ONLY place where the oracle's continuous topology
 * touches Cartesia's discrete constraints. It is versioned, audited,
 * and isolated. The oracle never sees these labels. The adapter never
 * feeds back into emotional topology.
 *
 * If Cartesia adds continuous controls, replace this adapter class.
 * Do NOT remove or rename fields — bump mapping_version instead.
 */
const CARTESIA_EMOTION_MAP: Record<VECKey, { tag: string; levelThreshold: number }> = {
  // High chaos → expressive surprise
  chaos:      { tag: 'surprise',  levelThreshold: 0.5 },

  // High whimsy → exploratory curiosity
  whimsy:     { tag: 'curiosity', levelThreshold: 0.5 },

  // High darkTone → somber sadness
  darkTone:   { tag: 'sadness',   levelThreshold: 0.5 },

  // High coherence → stable positivity
  coherence:  { tag: 'positivity', levelThreshold: 0.5 },

  // High voiceWeight → authoritative anger (volume/weight)
  voiceWeight:{ tag: 'anger',     levelThreshold: 0.5 },
};

// threshold boundaries for level string
const LEVEL_THRESHOLDS = [
  { max: 0.2,  label: 'lowest'    },
  { max: 0.4,  label: 'low'       },
  { max: 0.7,  label: 'moderate'  },
  { max: 0.9,  label: 'high'      },
  { max: 1.01, label: 'highest'   }, // >0.9
];

// trajectory → speed modifier (numeric, for generation_config.speed)
// NOTE: base_speed = 1.12 is passed in; this is delta only
const TRAJECTORY_SPEED_DELTA: Record<Trajectory, number> = {
  still:      0.0,
  converging: 0.08,
  diverging: -0.12,
  cycling:    0.0, // oscillates at call time
};

// clamping
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ── Adapter implementation ──────────────────────────────────────────────
export class CartesiaAdapter implements TTSBackendAdapter {
  readonly mapping_version = 'cartesia-adapter-v1';

  private _audit: AdapterAudit | null = null;
  private _apiKey: string;
  private _apiBase = 'https://api.cartesia.ai';
  private _cartesiaVersion = '2026-03-01';
  private _model = 'sonic-3.5';

  constructor(apiKey: string) {
    this._apiKey = apiKey;
  }

  lastAudit(): AdapterAudit | null {
    return this._audit;
  }

  /**
   * Translate pure oracle emotional vector → Cartesia API call.
   *
   * Mapping logic (hard-coded, versioned, isolated):
   *
   * 1. Select dominant axis above threshold → emotion tag
   * 2. Map axis magnitude → emotion level (lowest/low/moderate/high/highest)
   * 3. compute speed from base_speed + trajectory_delta + emotional_velocity
   * 4. Emit audit record
   * 5. POST to Cartesia /tts/bytes
   *
   * No oracle types cross into Cartesia request body except voice_id + transcript.
   */
  async synthesize(
    text: string,
    vector: EmotionalVector5,
    trajectory: Trajectory,
    agree_temporal: TemporalPhase,
    baseVoiceId: string,
    baseSpeed: number,
  ): Promise<CartesiaTTSResponse> {
    if (!this._apiKey) {
      throw new Error('CARTESIA_API_KEY not set on CartesiaAdapter');
    }

    // ── 1. Select dominant axis above threshold ───────────────────
    const dominantAxis = this._selectDominantAxis(vector);

    // ── 2. Map axis magnitude → discrete level ────────────────────
    const axisValue = vector[dominantAxis];
    const emotionTag = CARTESIA_EMOTION_MAP[dominantAxis].tag;
    const emotionLevel = this._mapLevel(axisValue);

    // ── 3. Compute speed ───────────────────────────────────────────
    const trajectoryDelta = TRAJECTORY_SPEED_DELTA[trajectory];
    const emotionalVelocity = (vector.chaos + vector.whimsy - vector.darkTone) / 3;
    const clampedSpeed = clamp(baseSpeed + trajectoryDelta + emotionalVelocity * 0.1, -1.0, 1.0);

    // cycling trajectory oscillates speed ±0.05 from computed value
    const finalSpeed = trajectory === 'cycling'
      ? clamp(clampedSpeed + (Math.random() > 0.5 ? 0.05 : -0.05), -1.0, 1.0)
      : clampedSpeed;

    // normalize to -1..1 string/number for generation_config
    const speedForConfig = clamp(finalSpeed, -1.0, 1.0);

    // ── 4. Emit audit record BEFORE the call ───────────────────────
    const audit: AdapterAudit = {
      timestamp: Date.now(),
      input_vector: { ...vector },
      input_trajectory: trajectory,
      input_agree_temporal: agree_temporal,
      output_emotion: emotionTag,
      output_level: emotionLevel,
      output_speed: speedForConfig,
      mapping_version: this.mapping_version,
      oracle_hexagram_id: undefined, // caller can stamp if available
    };

    // ── 5. Build Cartesia request ──────────────────────────────────
    const controls: CartesiaTTSRequest['voice']['__experimental_controls'] = {
      speed: this._speedToLabel(speedForConfig),
      emotion: [`${emotionTag}:${emotionLevel}`],
    };

    const requestBody: CartesiaTTSRequest = {
      model_id: this._model,
      transcript: text,
      voice: {
        mode: 'id',
        id: baseVoiceId,
        __experimental_controls: controls,
      },
      output_format: {
        container: 'mp3',
        sample_rate: 24000,
        encoding: 'mp3',
      },
      language: 'en',
      generation_config: {
        volume: 1,
        speed: speedForConfig,
      },
    };

    // ── 6. Call Cartesia ───────────────────────────────────────────
    const audio = await this._postCartesia(requestBody);

    this._audit = { ...audit, oracle_hexagram_id: audit.oracle_hexagram_id };

    return {
      audio,
      voice_id: baseVoiceId,
      backend: 'cartesia',
      model: this._model,
      audit: this._audit,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────

  /**
   * Select dominant axis above threshold.
   * If none exceed threshold, fall back to coherence (default voice presence).
   */
  private _selectDominantAxis(vector: EmotionalVector5): VECKey {
    const axes: VECKey[] = ['chaos', 'whimsy', 'darkTone', 'coherence', 'voiceWeight'];
    let dominant: VECKey = 'coherence';
    let maxVal = 0;

    for (const axis of axes) {
      const v = vector[axis];
      if (v > CARTESIA_EMOTION_MAP[axis].levelThreshold && v > maxVal) {
        maxVal = v;
        dominant = axis;
      }
    }

    return dominant;
  }

  /**
   * Map continuous magnitude → discrete Cartesia level string.
   */
  private _mapLevel(value: number): string {
    for (const tier of LEVEL_THRESHOLDS) {
      if (value <= tier.max) return tier.label;
    }
    return 'highest';
  }

  /**
   * Numeric speed [-1..1] → Cartesia speed label.
   * Labels are coarse; generation_config carries the precise numeric value.
   */
  private _speedToLabel(speed: number): 'slowest' | 'slow' | 'normal' | 'fast' | 'fastest' {
    if (speed <= -0.6) return 'slowest';
    if (speed <= -0.2) return 'slow';
    if (speed <= 0.2)  return 'normal';
    if (speed <= 0.6)  return 'fast';
    return 'fastest';
  }

  /**
   * POST to Cartesia /tts/bytes. Returns raw audio ArrayBuffer.
   */
  private async _postCartesia(body: CartesiaTTSRequest): Promise<ArrayBuffer> {
    const resp = await fetch(`${this._apiBase}/tts/bytes`, {
      method: 'POST',
      headers: {
        'X-API-Key': this._apiKey,
        'Cartesia-Version': this._cartesiaVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Cartesia TTS failed [${resp.status}]: ${text}`);
    }

    return resp.arrayBuffer();
  }
}
