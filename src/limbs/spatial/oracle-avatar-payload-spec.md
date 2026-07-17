# Oracle → Avatar Payload Canonical Data Contract (Corrected)

> **Status:** canonical v2  
> **Consumers:** `AvatarRenderLimb`, `GhostSplatLimb`, `VoiceBackend`  
> **Producers:** Oracle committee (`temporal_emotional_engine.py`), `KingWenEmotionProvider` (OpenJarvis)  
> **Scope:** single unified payload type exchanged between the oracle engine and every downstream consumer.  
> **Constraint:** continuous emotional topology only. No semantic labels. No hard-coded lookup tables. No trajectory math.

---

## 1. Core design principles

| Principle | Rule |
|-----------|------|
| **Flat, no circular refs** | JSON-serialisable at every level. No class instances or cyclic objects. |
| **All numbers are clamped to [0, 1]** | Every scalar emotion/render/voice float is a `number` with documented bounds. NaN / ±∞ = 0. |
| **Snake_case in JSON / camelCase in TS** | JSON wire format uses snake_case. TS types map via a lightweight adapter layer. |
| **Extensible via `meta` bag** | Unknown extra fields from a producer go into `oracle_meta`; consumers ignore unknown keys. |
| **Deterministic session token** | The `call_sign` field is the stable identity marker for a consult. |
| **Continuous vector, not buckets** | Voice and render modulation consume raw 5-axis floats. No semantic archetypes. No bucket lookup. |
| **Trajectory is a state label** | `trajectory` is categorical enum only. Render/animation reads it directly. No numeric multiplication, no float conversion. |

---

## 2. Canonical JSON wire format

### 2.1 Top-level envelope

```jsonc
{
  // ── Session identity ──────────────────────────────────────────────
  "session_id":   "string — caller-supplied session key",
  "call_sign":    "KW:3:2:openjarvis:abcdef01 — King Wen call sign",
  "request_text": "What is the nature of this moment?",

  // ── Hexagram identity ─────────────────────────────────────────────
  "hexagram":     { /* see §2.2 */ },

  // ── Provenance / consensus ────────────────────────────────────────
  "provenance":   { /* see §2.3 */ },

  // ── Temporal vectors (5-axis × 3 phases) ─────────────────────────
  "temporal_vectors": { /* see §2.4 */ },

  // ── Committee consensus (all-64 or subset) ────────────────────────
  "global_consensus": { /* see §2.5, optional */ },

  // ── Render parameters (AvatarRenderLimb + GhostSplatLimb) ─────────
  "render_params":    { /* see §2.6 */ },

  // ── Voice parameters (VoiceBackend) ───────────────────────────────
  "voice_params":     { /* see §2.7 */ },

  // ── Oracle Console block (text) ───────────────────────────────────
  "oracle_console":   "string — pre-rendered Oracle Console text block",

  // ── Extensibility ─────────────────────────────────────────────────
  "oracle_meta":      {} — opaque bag for future / producer-specific fields
}
```

---

### 2.2 `hexagram` object

Derived from `temporal_emotional_engine.py` → `hexagram_symbols` and `inject_site`, combined with the `kingwen.py` registry shape.

```jsonc
{
  "id":                 1,            // 1–64
  "name":               "䷀",          // native name string
  "unicode_char":       "\u4DC0",     // CJK Unified I Ching block U+4DC0–u4DFF
  "chinese":            "乾",          // optional CJK name
  "pinyin":             "qián",       // optional romanisation
  "category":           "creative",   // lower-case snake_case
  "action":             "assert",     // assert / yield / adapt / wait
  "upper_trigram":      "天",
  "lower_trigram":      "天",
  "binary_bottom_to_top": "111111",
  "binary_top_to_bottom": "111111",
  "upper_idx":          7,            // 0–7 trigram index
  "lower_idx":          7,
  "secondary_hexagram": null | {       // optional, when ternary entry differs
    "id":   2,
    "name": "䷁",
    "unicode_char": "\u4DC1"
  },
  "inject_site": {
    "primary_pool":    "string",
    "secondary_pool":  "string",
    "porosity":        0.35,          // 0–1 float
    "porosity_label":  "string",
    "porosity_window": [0.0, 1.0],
    "porosity_description": "string",
    "reason":          "string"
  },
  "yao_vocabulary":    {              // 9-entry map: yao_key → display label
    "young_yin":       "string",
    "old_yin":         "string",
    "stable_yin":      "string",
    "new_yao":         "string",
    "old_yao":         "string",
    "stable_yao":      "string",
    "old_yang":         "string",
    "new_yang":         "string",
    "stable_yang":      "string"
  },
  "ternary_lines_top_to_bottom": [],  // e.g. [0, 2, 1, 0, 2, 1]
  "phase_changing_lines": [],         // 1-based line indices
  "phase_bits":         0,            // 0–7 deterministic phase slot
  "phase_temporal":     "past",       // temporal label for current phase
  "ternary_str":        "021|021",    // encoded ternary representation
  "reaction_frame":     "Reaction\nPhase: transition\n..."
}
```

---

### 2.3 `provenance` object

**No semantic labels. No bucket mapping.** Only continuous consensus state plus categorical trajectory.

```jsonc
{
  // The winning temporal phase: which state won the committee vote
  "agree_temporal":    "past",        // "past" | "present" | "future"

  // Consensus quality
  "agreement":         0.82,          // 0–1, higher = stronger temporal consensus
  "spread":            0.14,          // 0–1, lower = tighter consensus

  // Emotional distance
  "tension":           0.21,          // 0–1, sum of pairwise vector distances (normalised)
  "resolution":        0.79,          // 1 - tension

  // Categorical state label — no numeric conversion. Render/animation reads this directly.
  "trajectory":        "converging",  // "still" | "converging" | "diverging" | "cycling"

  // The 5-axis axis that carried the consensus; for render diagnostics only.
  // Voice modulation does NOT branch on this label.
  "dominant_axis":     "coherence",   // one of 5 VEC_KEYS

  // Active emotional state at the winning temporal: meta_vector[agree_temporal]
  "winner_vector": {
    "chaos":      0.06,
    "whimsy":     0.14,
    "darkTone":   0.03,
    "coherence":  0.72,
    "voiceWeight":0.32
  },

  // Full 3-phase emotional field
  "meta_vector": {
    "past": {
      "chaos":      0.03,
      "whimsy":     0.09,
      "darkTone":   0.24,
      "coherence":  0.54,
      "voiceWeight":0.31
    },
    "present": {
      "chaos":      0.46,
      "whimsy":     0.38,
      "darkTone":   0.12,
      "coherence":  0.55,
      "voiceWeight":0.42
    },
    "future": {
      "chaos":      0.22,
      "whimsy":     0.47,
      "darkTone":   0.05,
      "coherence":  0.68,
      "voiceWeight":0.61
    }
  },

  // Composite pairwise distances
  "distances": {
    "past_present":     0.08,
    "present_future":   0.06,
    "past_future":      0.12
  },

  // Human-readable summary
  "description":
    "converging; high emotional consensus across time; dominant axis: coherence",

  // Selection algorithm: spread-bias selector with table-derived weights
  "selection_algorithm": "bias_plus_spread"
}
```

**Removed from v1:** `bias_score` numeric breakdown, `spread_by_temporal`, and any implied trajectory math. These are internal engine details; they do not belong in the runtime payload.

---

### 2.4 `temporal_vectors` object

Direct output of `temporal_emotions` from the engine (each axis float 0–1).

```jsonc
{
  "past": {
    "chaos":      0.03,
    "whimsy":     0.09,
    "darkTone":   0.24,
    "coherence":  0.54,
    "voiceWeight":0.31
  },
  "present": {
    "chaos":      0.46,
    "whimsy":     0.38,
    "darkTone":   0.12,
    "coherence":  0.55,
    "voiceWeight":0.42
  },
  "future": {
    "chaos":      0.22,
    "whimsy":     0.47,
    "darkTone":   0.05,
    "coherence":  0.68,
    "voiceWeight":0.61
  }
}
```

---

### 2.5 `global_consensus` object

Produced by `_global_hexagram_consensus()` — committee-level summary.

```jsonc
{
  "winner_counts": {
    "past":     18,
    "present":  31,
    "future":   15
  },
  "mean_agreement": 0.71,
  "min_agreement":  0.44,
  "max_agreement":  0.95,
  "dominant_temporal": "present",
  "trajectory_distribution": {
    "past":     0.28,
    "present":  0.49,
    "future":   0.23
  }
}
```

---

### 2.6 `render_params` object

Consumed by `AvatarRenderLimb` and `GhostSplatLimb`. All `Color4` values serialised as `{r,g,b,a}` objects. No Babylon.js class instances cross the wire.

```jsonc
{
  // Selected phase to display
  "temporal":            "present",

  // Categorical state label for animation behavior
  "trajectory":          "converging",  // "still" | "converging" | "diverging" | "cycling"

  // Emotional distance scalars
  "tension":             0.21,          // 0–1
  "resolution":          0.79,          // 0–1

  // Derived colours (serialised from Babylon Color4)
  "base_color":    { "r": 0.45, "g": 0.51, "b": 0.48, "a": 1.0 },
  "emissive_color":{ "r": 0.30, "g": 0.51, "b": 0.54, "a": 1.0 },

  // Per-phase lightness bias for point-brightness shader
  "point_brightness_bias": {
    "past":     0.74,
    "present":  1.0,
    "future":   0.91
  },

  // Active emotional vector at the winning temporal
  "emotional_vector": {
    "chaos":      0.06,
    "whimsy":     0.14,
    "darkTone":   0.03,
    "coherence":  0.72,
    "voiceWeight":0.32
  },

  // Full temporal vector set
  "temporal_vectors": {
    "past":    { "chaos": 0.03, "whimsy": 0.09, "darkTone": 0.24, "coherence": 0.54, "voiceWeight": 0.31 },
    "present": { "chaos": 0.46, "whimsy": 0.38, "darkTone": 0.12, "coherence": 0.55, "voiceWeight": 0.42 },
    "future":  { "chaos": 0.22, "whimsy": 0.47, "darkTone": 0.05, "coherence": 0.68, "voiceWeight": 0.61 }
  }
}
```

**Removed from v1:** `speed`, `aura_jitter`, `aura_pulse`. Those are voice-layer or render-layer derived constants, not payload-level state. The payload carries raw emotion; the consumer derives behavior.

---

### 2.7 `voice_params` object

Consumed by the TTS voice backend. **Continuous injection only.** No semantic buckets. No voice archetype labels.

```jsonc
{
  // Fixed base voice configuration
  "base_voice_id": "c8f7835e-28a3-4f0c-80d7-c1302ac62aae",
  "base_speed":    1.12,

  // The only selectors: raw 5-axis emotional vector at the winning temporal
  "emotional_vector": {
    "chaos":      0.06,
    "whimsy":     0.14,
    "darkTone":   0.03,
    "coherence":  0.72,
    "voiceWeight":0.32
  },

  // Continuous modulation parameters derived from emotional vector
  // These are the actual API knobs or audio-pipeline hints
  "modulation": {
    "pitch_variance":     0.12,  // ← chaos + tension
    "speech_rate_variation": 0.08,  // ← whimsy
    "timbre_depth":       0.65,  // ← darkTone + resolution
    "prosodic_smoothness":0.92,  // ← coherence
    "volume_scaling":     0.82   // ← voiceWeight
  },

  // Categorical trajectory for render/animation timing
  "trajectory": "converging",

  // Which temporal state won
  "agree_temporal": "future"
}
```

**Removed from v1:** `voice_id` bucket selection, `speed` computed from trajectory, `tier` metadata, `backend` selection, `dominant_axis` semantic mapping. The base voice is fixed. The emotional vector modulates.

---

### 2.8 `oracle_console` field

Pre-rendered multi-section text block suitable for direct display. Produced by `KingWenEmotionProvider.format_oracle_console()` / `format_oracle_console_with_tongue()`.

```
Oracle Console

Past
young yin
Present
present yao
Future
old yang
Resolved Emotion

0.71
CONSULT
Response
640ms
Past Reflection
<text>
Present Reflection
<text>
Future Reflection
<text>
Hexagram Sequence
The Creative → The Receiving
Reaction Frame
Reaction
Phase: transition
Changing lines: [3, 4]
...

Unified Oracle Weave
<text>
Emotional Tongue
{"hexagram_id": 1, "porosity": 0.35, ...}
Porosity
0.35
Direction
assert
Training Weight Vectors
{"voiceWeight": 0.82, ...}
```

---

## 3. Canonical TypeScript type definition

```typescript
/**
 * oracle-avatar-payload-spec.ts
 *
 * Canonical payload type flowing from Oracle Committee
 * → AvatarRenderLimb + GhostSplatLimb + VoiceBackend.
 *
 * Wire format: snake_case JSON. This file uses camelCase for TS surface;
 * producers/consumers map at the boundary (see adapter layer).
 *
 * v2: removed semantic labels, trajectory numerification, winner_vector precedence.
 *     Continuous vector only. Trajectory is categorical enum.
 */

// ── Primitive token types ────────────────────────────────────────────
export type TemporalPhase = 'past' | 'present' | 'future';
export type Trajectory    = 'still' | 'converging' | 'diverging' | 'cycling';
export type Direction     = 'assert' | 'yield' | 'adapt' | 'wait' | 'neutral';
export type VECKey        = 'chaos' | 'whimsy' | 'darkTone' | 'coherence' | 'voiceWeight';
export type TTSBackend    = 'openai_tts' | 'cartesia' | 'kokoro';
export type TierLabel     = 'low' | 'mid' | 'high';

// ── Numeric bounded scalar ───────────────────────────────────────────
export interface Bounded01 {
  /** Clamped 0–1 float. NaN or ±∞ is treated as 0 by all consumers. */
  value: number;
}
export function bounded01(v: number): number {
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}

// ── 5-axis emotional vector ──────────────────────────────────────────
export interface EmotionalVector5 {
  chaos:      number; // 0–1
  whimsy:     number; // 0–1
  darkTone:   number; // 0–1
  coherence:  number; // 0–1
  voiceWeight:number; // 0–1
}

export interface TemporalVectors {
  past:    EmotionalVector5;
  present: EmotionalVector5;
  future:  EmotionalVector5;
}

// ── Hexagram identity ────────────────────────────────────────────────
export interface HexagramIdentity {
  id:                 number;          // 1–64
  name:               string;
  unicode_char:       string;          // single CJK char U+4DC0+id-1
  chinese:            string;          // optional
  pinyin:             string;          // optional
  category:           string;
  action:             string;
  upper_trigram:      string;
  lower_trigram:      string;
  binary_bottom_to_top: string;       // "011001"
  binary_top_to_bottom: string;
  upper_idx:          number;          // 0–7
  lower_idx:          number;          // 0–7
}

export interface SecondaryHexagram {
  id:          number | null;
  name:        string | null;
  unicode_char:string | null;
}

export interface InjectSite {
  primary_pool:          string;
  secondary_pool:        string;
  porosity:              number;        // 0–1
  porosity_label:        string;
  porosity_window:       [number, number];
  porosity_description:  string;
  reason:                string;
}

export interface YaoVocabulary {
  young_yin:    string;
  old_yin:      string;
  stable_yin:   string;
  new_yao:       string;
  old_yao:       string;
  stable_yao:    string;
  old_yang:      string;
  new_yang:      string;
  stable_yang:   string;
}

export interface HexagramPayload {
  hexagram:                 HexagramIdentity;
  secondary_hexagram:       SecondaryHexagram | null;
  inject_site:              InjectSite;
  yao_vocabulary:           YaoVocabulary;
  ternary_lines_top_to_bottom: number[];   // 0|1|2 × 6
  phase_changing_lines:     number[];      // 1-based indices
  phase_bits:               number;        // 0–7
  phase_temporal:           TemporalPhase;
  ternary_str:              string;
  reaction_frame:           string;
  save_string:              string;        // "unicode|porosity|chaos|whimsy|darkTone|coherence|voiceWeight"
}

// ── Provenance (OracleProvenance + temporal_resolution merged) ────────
export interface OracleProvenance {
  agree_temporal:    TemporalPhase;
  agreement:         number;   // 0–1
  spread:            number;   // 0–1
  tension:           number;   // 0–1
  resolution:        number;   // 0–1
  trajectory:        Trajectory; // categorical only
  dominant_axis:     VECKey;   // for render diagnostics only
  winner_vector:     EmotionalVector5; // meta_vector[agree_temporal]
  meta_vector:       TemporalVectors;  // full 3-phase field
  distances: {
    past_present:    number;
    present_future:  number;
    past_future:     number;
  };
  description:       string;
  selection_algorithm: 'bias_plus_spread';
}

// ── Committee consensus (global) ─────────────────────────────────────
export interface GlobalConsensus {
  winner_counts:           Record<TemporalPhase, number>;
  mean_agreement:          number;
  min_agreement:           number;
  max_agreement:           number;
  dominant_temporal:       TemporalPhase;
  trajectory_distribution: Record<TemporalPhase, number>;
}

// ── Render parameters (AvatarRenderLimb + GhostSplatLimb) ────────────
export interface RGBA {
  r: number; g: number; b: number; a: number;
}

export interface RenderParams {
  temporal:                TemporalPhase;
  trajectory:              Trajectory; // categorical only
  tension:                 number;   // 0–1
  resolution:              number;   // 0–1
  emotional_vector:        EmotionalVector5; // active frame
  temporal_vectors:        TemporalVectors;  // full field
  point_brightness_bias:   Record<TemporalPhase, number>;
  base_color:              RGBA;
  emissive_color:          RGBA;
  aura_jitter:             number;   // = tension * 1.6
  aura_pulse:              number;   // = resolution * 0.9 + 0.1
}

// ── Voice parameters (TTS backend) ───────────────────────────────────
export interface ModulationParams {
  pitch_variance:       number;  // 0–1 ← chaos + tension
  speech_rate_variation: number; // 0–1 ← whimsy
  timbre_depth:         number;  // 0–1 ← darkTone + resolution
  prosodic_smoothness:  number;  // 0–1 ← coherence
  volume_scaling:       number;  // 0–1 ← voiceWeight
}

export interface VoiceParams {
  base_voice_id:        string;
  base_speed:           number;           // 1.0–1.12 fixed baseline
  emotional_vector:     EmotionalVector5; // raw 5-axis at winning temporal
  modulation:           ModulationParams; // continuous derived controls
  trajectory:           Trajectory;       // categorical, for timing hints only
  agree_temporal:       TemporalPhase;
}

// ── Oracle Console text block ────────────────────────────────────────
export interface OracleConsolePayload {
  console_text: string;                 // pre-rendered multi-section text
  canonical_tick_ms: number;            // 640.0 default response latency
  oracle_label:       string;           // "Oracle Console"
}

// ── Master envelope ──────────────────────────────────────────────────
export interface OracleAvatarPayload {
  // Identity
  session_id:   string;
  call_sign:    string;
  request_text: string;

  // Hexagram state
  hexagram:     HexagramPayload;

  // Provenance / consensus
  provenance:   OracleProvenance;

  // Temporal vectors (full 5-axis × 3 phases)
  temporal_vectors: TemporalVectors;

  // Committee output (optional for single-hex queries; required at committee exit)
  global_consensus?: GlobalConsensus;

  // Render (AvatarRenderLimb + GhostSplatLimb)
  render_params: RenderParams;

  // Voice (TTS backend)
  voice_params:  VoiceParams;

  // Oracle Console text
  oracle_console: OracleConsolePayload;

  // Extension hooks — consumer must ignore unknown keys
  oracle_meta: Record<string, unknown>;
}
```

---

## 4. Type ↔ JSON mapping reference

| TS type | JSON key | Notes |
|---------|----------|-------|
| `TemporalPhase` | `temporal` | three values only |
| `Trajectory` | `trajectory` | four categorical values: `still`, `converging`, `diverging`, `cycling` |
| `VECKey` | `dominant_axis` | one of five axis names; used for render diagnostics only |
| `EmotionalVector5` | `emotional_vector`, `winner_vector`, `meta_vector` | all five axes present |
| `TemporalVectors` | `temporal_vectors`, `meta_vector` | keyed by phase |
| `RGBA` | `base_color`, `emissive_color` | `{r,g,b,a}` object |
| `Color4` (Babylon) | *never crosses wire* | convert to `RGBA` JSON before serialising |
| `call_sign` | top-level `call_sign` | format `KW:<hex_id>:<phase_bits>:<session_id>:<hash8>` |
| `save_string` | `hexagram.save_string` | pipe-delimited: `unicode|porosity|chaos|whimsy|darkTone|coherence|voiceWeight` |

---

## 5. Render color derivation contract (AvatarRenderLimb)

`deriveRenderParameters()` in `OracleEmotionAdapter.ts` is the reference implementation.
Producers may supply raw vector values; the renderer applies the colour mapping.

```ts
// selected = temporal_vectors[provenance.agree_temporal]
baseColor.r = clamp( selected.chaos      * 0.7  + selected.voiceWeight * 0.3 )
baseColor.g = clamp( selected.coherence  * 0.75 + selected.whimsy      * 0.25 )
baseColor.b = clamp( selected.darkTone   * 0.7  + selected.coherence   * 0.3 )

emissiveColor.r = clamp( selected.voiceWeight * 0.9 + selected.chaos      * 0.1 )
emissiveColor.g = clamp( selected.coherence   * 0.85+ selected.whimsy     * 0.15 )
emissiveColor.b = clamp( selected.darkTone    * 0.85+ selected.voiceWeight* 0.15 )
```

---

## 6. Voice modulation contract (continuous injection)

**Base voice:** `c8f7835e-28a3-4f0c-80d7-c1302ac62aae`, speed `1.12`  
**Modulation:** raw 5-axis vector only. No semantic labels. No bucket lookup.

| Emotional axis | Modulation target | Source field |
|----------------|-------------------|--------------|
| `chaos` | pitch variance | `emotional_vector.chaos` |
| `whimsy` | speech rate variation | `emotional_vector.whimsy` |
| `darkTone` | timbre depth | `emotional_vector.darkTone` |
| `coherence` | prosodic smoothness | `emotional_vector.coherence` |
| `voiceWeight` | volume scaling | `emotional_vector.voiceWeight` |

**Trajectory:** categorical enum for render/animation timing only.  
**Agree temporal:** which phase won; used to select `winner_vector` from `meta_vector`.

```ts
// winner_vector = meta_vector[agree_temporal]
const winner: EmotionalVector5 = payload.provenance.meta_vector[payload.provenance.agree_temporal];
```

---

## 7. Canonical JSON example

```json
{
  "session_id": "session-2026-07-05-001",
  "call_sign":  "KW:1:2:openjarvis:a1b2c3d4",
  "request_text": "What is the creative power at work?",

  "hexagram": {
    "hexagram": {
      "id": 1,
      "name": "The Creative",
      "unicode_char": "䷀",
      "chinese": "乾",
      "pinyin": "qián",
      "category": "creative",
      "action": "assert",
      "upper_trigram": "天",
      "lower_trigram": "天",
      "binary_bottom_to_top": "111111",
      "binary_top_to_bottom": "111111",
      "upper_idx": 7,
      "lower_idx": 7
    },
    "secondary_hexagram": null,
    "inject_site": {
      "primary_pool": "Default",
      "secondary_pool": "Yang",
      "porosity": 0.35,
      "porosity_label": "low bleed",
      "porosity_window": [0.0, 0.25],
      "porosity_description": "tight seal, minimal phase crossover",
      "reason": "high-order hexagram, low emotional spread"
    },
    "yao_vocabulary": {
      "young_yin": "softening yin",
      "old_yin": "exhausted yin",
      "stable_yin": "resting yin",
      "new_yao": "emerging line",
      "old_yao": "residual line",
      "stable_yao": "holding line",
      "old_yang": "exhausted yang",
      "new_yang": "rising yang",
      "stable_yang": "firm yang"
    },
    "ternary_lines_top_to_bottom": [1, 1, 1, 1, 1, 1],
    "phase_changing_lines": [],
    "phase_bits": 2,
    "phase_temporal": "present",
    "ternary_str": "111|111",
    "reaction_frame": "Reaction\nPhase: actionable\nChanging lines: []\nRecovering lines: []\nDeepened lines: [1,2,3,4,5,6]\nSpeech cadence: steady, coherent delivery",
    "save_string": "䷀|0.3500|0.030000|0.080000|0.020000|0.710000|0.300000"
  },

  "provenance": {
    "agree_temporal":     "present",
    "agreement":          0.82,
    "spread":             0.14,
    "tension":            0.21,
    "resolution":         0.79,
    "trajectory":         "converging",
    "dominant_axis":      "coherence",
    "winner_vector": {
      "chaos":       0.06,
      "whimsy":      0.14,
      "darkTone":    0.03,
      "coherence":   0.72,
      "voiceWeight": 0.82
    },
    "meta_vector": {
      "past":    { "chaos": 0.03, "whimsy": 0.09, "darkTone": 0.24, "coherence": 0.54, "voiceWeight": 0.31 },
      "present": { "chaos": 0.46, "whimsy": 0.38, "darkTone": 0.12, "coherence": 0.55, "voiceWeight": 0.42 },
      "future":  { "chaos": 0.22, "whimsy": 0.47, "darkTone": 0.05, "coherence": 0.68, "voiceWeight": 0.61 }
    },
    "distances": {
      "past_present":   0.08,
      "present_future": 0.06,
      "past_future":    0.12
    },
    "description":
      "converging; high emotional consensus across time; dominant axis: coherence",
    "selection_algorithm": "bias_plus_spread"
  },

  "temporal_vectors": {
    "past":    { "chaos": 0.03, "whimsy": 0.09, "darkTone": 0.24, "coherence": 0.54, "voiceWeight": 0.31 },
    "present": { "chaos": 0.46, "whimsy": 0.38, "darkTone": 0.12, "coherence": 0.55, "voiceWeight": 0.42 },
    "future":  { "chaos": 0.22, "whimsy": 0.47, "darkTone": 0.05, "coherence": 0.68, "voiceWeight": 0.61 }
  },

  "global_consensus": {
    "winner_counts": {
      "past":     18,
      "present":  31,
      "future":   15
    },
    "mean_agreement": 0.71,
    "min_agreement":  0.44,
    "max_agreement":  0.95,
    "dominant_temporal": "present",
    "trajectory_distribution": {
      "past":     0.28,
      "present":  0.49,
      "future":   0.23
    }
  },

  "render_params": {
    "temporal":            "present",
    "trajectory":          "converging",
    "tension":             0.21,
    "resolution":          0.79,
    "emotional_vector": {
      "chaos":       0.23,
      "whimsy":      0.33,
      "darkTone":    0.13,
      "coherence":   0.65,
      "voiceWeight": 0.45
    },
    "temporal_vectors": {
      "past":    { "chaos": 0.03, "whimsy": 0.09, "darkTone": 0.24, "coherence": 0.54, "voiceWeight": 0.31 },
      "present": { "chaos": 0.46, "whimsy": 0.38, "darkTone": 0.12, "coherence": 0.55, "voiceWeight": 0.42 },
      "future":  { "chaos": 0.22, "whimsy": 0.47, "darkTone": 0.05, "coherence": 0.68, "voiceWeight": 0.61 }
    },
    "point_brightness_bias": {
      "past":     0.74,
      "present":  1.0,
      "future":   0.91
    },
    "base_color":    { "r": 0.45, "g": 0.51, "b": 0.48, "a": 1.0 },
    "emissive_color":{ "r": 0.30, "g": 0.51, "b": 0.54, "a": 1.0 },
    "aura_jitter":  0.34,
    "aura_pulse":   0.29
  },

  "voice_params": {
    "base_voice_id": "c8f7835e-28a3-4f0c-80d7-c1302ac62aae",
    "base_speed":    1.12,
    "emotional_vector": {
      "chaos":       0.06,
      "whimsy":      0.14,
      "darkTone":    0.03,
      "coherence":   0.72,
      "voiceWeight": 0.82
    },
    "modulation": {
      "pitch_variance":      0.12,
      "speech_rate_variation": 0.08,
      "timbre_depth":        0.65,
      "prosodic_smoothness": 0.92,
      "volume_scaling":      0.82
    },
    "trajectory":    "converging",
    "agree_temporal":"future"
  },

  "oracle_console": {
    "console_text": "Oracle Console\n...",
    "canonical_tick_ms": 640.0,
    "oracle_label": "Oracle Console"
  }
}
```

---

## 8. Migration notes for existing consumers

- `AvatarRenderLimb.setOracleProvenance()` input is unchanged.
- `GhostSplatLimb.setEmotion()` now receives `RenderParams.emotional_vector` directly; remove any dependency on semantic `dominant_axis` labels.
- `VoiceBackend.synthesize()` receives `VoiceParams` with fixed `base_voice_id` + `base_speed`; modulation floats are passed through as metadata or future API fields.
- `KingWenEmotionProvider.format_voice_section()` must be updated to emit continuous modulation floats, not semantic bucket names.
- Any external spec referencing `winner_vector`, `bias_score`, `spread_by_temporal`, `voice_id` bucket selection, or trajectory numerification is **stale** and must be re-derived from this spec.
