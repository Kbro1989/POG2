import { Color3, Color4, Vector3 } from '@babylonjs/core';

export type Temporal = 'past' | 'present' | 'future';
export type Trajectory = 'converging' | 'diverging' | 'stable';

export interface TemporalVectors {
  past: { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
  present: { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
  future: { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
}

export interface EmotionalVector {
  chaos: number;
  whimsy: number;
  darkTone: number;
  coherence: number;
  voiceWeight: number;
}

export interface OracleProvenance {
  hexagramId: number;
  hexagramName: string;
  agreeTemporal: Temporal;
  agreement: number;
  spread: number;
  biasScore: number;
  winnerVector: EmotionalVector;
  tension: number;
  resolution: number;
  trajectory: Trajectory;
  dominantAxis: 'chaos' | 'whimsy' | 'darkTone' | 'coherence' | 'voiceWeight';
}

export interface RenderEmotionParameters {
  dominantAxis: 'chaos' | 'whimsy' | 'darkTone' | 'coherence' | 'voiceWeight';
  temporal: Temporal;
  trajectory: Trajectory;
  tension: number;
  resolution: number;
  metaVector: TemporalVectors;
  baseColor: Color4;
  emissiveColor: Color4;
  pointBrightnessBias: { past: number; present: number; future: number };
  speed: number;
  auraJitter: number;
  auraPulse: number;
  provenance: OracleProvenance;
}

export function clamp01(value: number): number {
  if (Number.isFinite(value)) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
  }
  return 0;
}

export function vectorToColor(v: { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number }): Color3 {
  const r = clamp01(v.chaos * 0.85 + v.voiceWeight * 0.15);
  const g = clamp01(v.coherence * 0.75 + v.whimsy * 0.25);
  const b = clamp01(v.darkTone * 0.70 + v.coherence * 0.30);
  return new Color3(r, g, b);
}

function pickVector(vectors: TemporalVectors, temporal: Temporal) {
  return vectors[temporal];
}

export function deriveRenderParameters(provenance: OracleProvenance): RenderEmotionParameters {
  const v = provenance.winnerVector;
  const meta = provenance.winnerVector as TemporalVectors;
  const dominantAxis = provenance.dominantAxis;
  const temporal = provenance.agreeTemporal;
  const trajectory = provenance.trajectory;
  const tension = clamp01(provenance.tension);
  const selected = pickVector(meta, temporal);
  const resolution = provenance.resolution;

  const baseColor = new Color4(
    clamp01(selected.chaos * 0.7 + selected.voiceWeight * 0.3),
    clamp01(selected.coherence * 0.75 + selected.whimsy * 0.25),
    clamp01(selected.darkTone * 0.7 + selected.coherence * 0.3),
    1,
  );

  const emissiveColor = new Color4(
    clamp01(selected.voiceWeight * 0.9 + selected.chaos * 0.1),
    clamp01(selected.coherence * 0.85 + selected.whimsy * 0.15),
    clamp01(selected.darkTone * 0.85 + selected.voiceWeight * 0.15),
    1,
  );

  const pastBase = clamp01(meta.past.coherence + meta.past.voiceWeight * 0.5);
  const presentBase = clamp01(meta.present.coherence + meta.present.voiceWeight * 0.5);
  const futureBase = clamp01(meta.future.coherence + meta.future.voiceWeight * 0.5);
  const maxBase = Math.max(pastBase, presentBase, futureBase, 0.0001);
  const pointBrightnessBias = {
    past: pastBase / maxBase,
    present: presentBase / maxBase,
    future: futureBase / maxBase,
  };

  const speed = trajectory === 'converging' ? 1.12 : trajectory === 'diverging' ? 0.95 : 1.0;
  const auraJitter = tension * 1.6;
  const auraPulse = resolution * 0.9 + 0.1;

  return {
    dominantAxis,
    temporal,
    trajectory,
    tension,
    resolution,
    metaVector: meta,
    baseColor,
    emissiveColor,
    pointBrightnessBias,
    speed,
    auraJitter,
    auraPulse,
    provenance,
  };
}
