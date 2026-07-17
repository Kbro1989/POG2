# OracleAvatarHead Normalized Integration Spec

## Source Evidence
- `src/limbs/spatial/AvatarRenderLimb.ts` — Babylon.js `PointsCloudSystem` renderer; hardcoded skin RGB `12104087`; loads `/models/kit_<id>.json`; applies emotion via `applyEmotion()`.
- `src/limbs/spatial/GhostSplatLimb.ts` — Splat event emitter for `damage | xp | block | heal | poison | crit | emotion_aura`; consumes `RenderEmotionParameters`.
- `public/test_avatar.html` — Canonical point-cloud bootstrap: `PointsCloudSystem`, `ArcRotateCamera`, skin unpack from packed integer.
- `public/test_ghostsplat.html` — Same scene bootstrap, then mock combat loop driving `GhostSplatLimb.emit`.
- `public/models/kit_420.json`, `kit_31149.json`, `kit_12428.json` — Geometry payload: `positions: number[]`, empty `indices`, `metadata: { vertexCount, faceCount, betaFormat, betaVersion }`.
- `src/limbs/spatial/AvatarStateLimb.ts` — Morphology state machine; `AvatarConfiguration.morphology.appearanceIndices.skinColor` and semantic color tables (`SKIN_COLORS`); emits `varp_change` on write.
- `src/limbs/spatial/OracleEmotionAdapter.ts` — `OracleProvenance` → `RenderEmotionParameters` via `deriveRenderParameters`; defines `baseColor`, `emissiveColor`, `pointBrightnessBias`, `trajectory`, `tension`, `resolution`, `auraJitter`, `auraPulse`.

## Goal
Define a single concrete interface contract for `OracleAvatarHead`: a point-cloud avatar renderer that unifies kit geometry loading, skin color, oracle-derived emotion, and aura emission. No placeholders; every member maps to an existing runtime capability.

---

## 1. Geometry Input Contract

### `KitModelPayload`
Derived from `kit_<id>.json` structure as consumed by `AvatarRenderLimb.ts:115` and `test_avatar.html:64`.

```ts
export interface KitModelPayload {
  positions: number[]; // flat XYZ triplet array, length = vertexCount * 3
  indices?: number[];  // currently empty in all observed models
  metadata: {
    vertexCount: number;
    faceCount: number;
    betaFormat: number;
    betaVersion: number;
  };
}
```

**Invariants from real models:**
- `kit_420.json` — `vertexCount: 905`, `faceCount: 0`, `betaFormat: 2`, `betaVersion: 5`
- `kit_31149.json` — `vertexCount: 376`, `faceCount: 0`, `betaFormat: 2`, `betaVersion: 5`
- `kit_12428.json` — `vertexCount: 259`, `faceCount: 0`, `betaFormat: 2`, `betaVersion: 5`

Load path: `AvatarRenderLimb.loadMeshJson` fetches `/models/kit_${modelId}.json` (browser) or resolves `cache_pedagogy/models/kit_${modelId}.json` via `resolveSovereignPath` (Node).

---

## 2. Skin Color Input Contract

### `SkinColorPayload`
Observed constant: `const skinRgb = 12104087` in `AvatarRenderLimb.ts:50` and both HTML fixtures. Unpack logic:

```ts
// AvatarRenderLimb.ts:108-113
private unpackRgb(packed: number): Color3 {
  const r = ((packed >> 16) & 0xFF) / 255;
  const g = ((packed >> 8)  & 0xFF) / 255;
  const b = ( packed        & 0xFF) / 255;
  return new Color3(r, g, b);
}
```

Normalized interface:

```ts
export interface SkinColorPayload {
  packedRgb: number;  // e.g. 12104087 for Enum 1195
}
```

Default: `12104087` (Enum 1195 / "Sovereign Skin Tone" from `test_avatar.html:53`).

Alternative source: `AvatarStateLimb.ts:527` exposes `appearanceIndices.skinColor` (varbit 2827, mapped via `SKIN_COLORS` table), but no packed RGB derivation exists yet. `OracleAvatarHead` SHOULD accept either the packed int or accept an explicit color override from `AvatarStateLimb` after such mapping is implemented.

---

## 3. Emotion Input Contract

### `OracleProvenanceAdapterInput`
Re-exported from `OracleEmotionAdapter.ts:20-32`:

```ts
export interface OracleProvenance {
  hexagramId: number;
  hexagramName: string;
  agreeTemporal: 'past' | 'present' | 'future';
  agreement: number;
  spread: number;
  biasScore: number;
  winnerVector: EmotionalVector;
  tension: number;
  resolution: number;
  trajectory: 'converging' | 'diverging' | 'stable';
  dominantAxis: 'chaos' | 'whimsy' | 'darkTone' | 'coherence' | 'voiceWeight';
}

export interface EmotionalVector {
  chaos: number;
  whimsy: number;
  darkTone: number;
  coherence: number;
  voiceWeight: number;
}
```

### `RenderEmotionParameters`
Re-exported from `OracleEmotionAdapter.ts:34-48`. THIS is the type consumed by `GhostSplatLimb.setEmotion` and `AvatarRenderLimb.applyEmotion`:

```ts
export interface RenderEmotionParameters {
  dominantAxis: 'chaos' | 'whimsy' | 'darkTone' | 'coherence' | 'voiceWeight';
  temporal: 'past' | 'present' | 'future';
  trajectory: 'converging' | 'diverging' | 'stable';
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

export interface TemporalVectors {
  past:    { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
  present: { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
  future:  { chaos: number; whimsy: number; darkTone: number; coherence: number; voiceWeight: number };
}
```

---

## 4. Mutation Hooks

### `setProvenance(provenance: OracleProvenance): void`
Replaces `AvatarRenderLimb.setOracleProvenance` (`AvatarRenderLimb.ts:76-79`) and `GhostSplatLimb.setEmotion` validated convergence:

```ts
setProvenance(provenance: OracleProvenance): void
```

**Behavior:**
1. Derive `RenderEmotionParameters` via `deriveRenderParameters(provenance)`.
2. Apply point-cloud material/brightness immediately (`AvatarRenderLimb.applyEmotion`).
3. Emit `EmotionChangeEvent` with `previous` vs `current`.

### `setEmotion(emotion: RenderEmotionParameters): void`
Replaces `GhostSplatLimb.setEmotion` (`GhostSplatLimb.ts:28-30`):

```ts
setEmotion(emotion: RenderEmotionParameters): void
```

**Behavior:**
1. Override active emotion state without re-deriving from provenance.
2. Apply material changes if point cloud is already built.
3. Persist emotion for subsequent `emitAura` calls unless overridden.

### `emitAura(event: AuraEvent): void`
Normalizes `GhostSplatLimb.emit({ type: 'emotion_aura', ... })` (`GhostSplatLimb.ts:56-57`) plus `createEmotionAura` (`GhostSplatLimb.ts:63-116`):

```ts
emitAura(event: AuraEvent): void
```

**Behavior:**
1. Use `event.position` or fallback to canonical head position (currently `Vector3(0,100,0)` in `GhostSplatLimb.ts:223`, or bounding box center of the built PCS).
2. Use `event.emotion` OR active emotion from `setEmotion` / `setProvenance`.
3. Create billboard plane with `DynamicTexture` radial gradient driven by `emotion.emissiveColor` and alpha driven by `emotion.resolution` / `emotion.auraPulse` / `emotion.auraJitter` / `emotion.tension`.
4. Animate with `requestAnimationFrame` until alpha <= 0, then dispose.

---

## 5. Event Types

### `AuraEvent`
```ts
export interface AuraEvent {
  type: 'emotion_aura';
  position?: Vector3;  // defaults to head centroid
  emotion: RenderEmotionParameters; // required for aura visuals
}
```

### `OracleHeadSplatEvent`
Normalizes `GhostSplatLimb.SplatEvent` (`GhostSplatLimb.ts:8-16`) minus aura type:

```ts
export type SplatType = 'damage' | 'xp' | 'block' | 'heal' | 'poison' | 'crit';

export interface OracleHeadSplatEvent {
  type: SplatType;
  value?: number;
  skillId?: number;     // used for XP color mapping when type === 'xp'
  position?: Vector3;   // defaults to head position if omitted
  color?: string;       // hex color for damage/crit; skillId colors used for XP
}
```

Skill-to-color fallback from `GhostSplatLimb.ts:172-176`:
```ts
const SKILL_COLORS: Record<number, string> = {
  0: '#ff0000',
  1: '#00ff00',
  2: '#0000ff',
};
```

### `EmotionChangeEvent`
```ts
export interface EmotionChangeEvent {
  type: 'emotion_change';
  previous?: RenderEmotionParameters;
  current: RenderEmotionParameters;
  provenance: OracleProvenance;
}
```

### `OracleAvatarHeadEvent` (union)
```ts
export type OracleAvatarHeadEvent = OracleHeadSplatEvent | AuraEvent | EmotionChangeEvent;
```

---

## 6. `OracleAvatarHead` Concrete Interface

```ts
import {
  Engine, Scene, Vector3, PointsCloudSystem, Color3, Color4,
} from '@babylonjs/core';
import {
  OracleProvenance, RenderEmotionParameters,
  deriveRenderParameters, TemporalVectors,
} from './OracleEmotionAdapter.js';
import { AvatarConfiguration, AvatarStateLimb } from './AvatarStateLimb.js';

// --- Input payloads ---
export interface KitModelPayload {
  positions: number[];
  indices?: number[];
  metadata: {
    vertexCount: number;
    faceCount: number;
    betaFormat: number;
    betaVersion: number;
  };
}

export interface SkinColorPayload {
  packedRgb: number; // e.g. 12104087
}

// Emotional inputs
export interface OracleProvenanceAdapterInput {
  provenance: OracleProvenance;
}

export interface EmotionDirectInput {
  emotion: RenderEmotionParameters;
}

// --- Splat / Aura inputs ---
export type SplatType = 'damage' | 'xp' | 'block' | 'heal' | 'poison' | 'crit';
export interface OracleHeadSplatEvent {
  type: SplatType;
  value?: number;
  skillId?: number;
  position?: Vector3;
  color?: string;
}
export interface AuraEvent {
  type: 'emotion_aura';
  position?: Vector3;
  emotion: RenderEmotionParameters;
}
export interface EmotionChangeEvent {
  type: 'emotion_change';
  previous?: RenderEmotionParameters;
  current: RenderEmotionParameters;
  provenance: OracleProvenance;
}
export type OracleAvatarHeadEvent = OracleHeadSplatEvent | AuraEvent | EmotionChangeEvent;

// --- Head renderer contract ---
export interface IOracleAvatarHead {
  // Construction / lifecycle
  readonly engine: Engine | null;
  readonly scene: Scene | null;
  readonly pcs: PointsCloudSystem | null;
  initialize(): Promise<void>;
  dispose(): void;

  // Geometry + appearance input
  loadKitModel(modelId: number): Promise<void>;
  loadKitPayload(payload: KitModelPayload, modelId?: number): Promise<void>;
  setSkinColor(skin: SkinColorPayload): void;

  // Mutation hooks
  setProvenance(input: OracleProvenanceAdapterInput): void;
  setEmotion(input: EmotionDirectInput): void;
  emitAura(event: AuraEvent): void;

  // Emit generic head event
  emit(event: OracleAvatarHeadEvent): void;

  // Render loop
  renderLoop(): void;

  // State bridge
  bindAvatarState(stateLimb: AvatarStateLimb): void;
}
```

---

## 7. Behavior Derivations (Non-Negotiable from Source)

| Requirement | Source Evidence | Required Behavior |
|-------------|-----------------|-------------------|
| Point cloud uses `addPoints` with XYZ triples | `AvatarRenderLimb.ts:56-63`, `test_avatar.html:83-90` | `KitModelPayload.positions[i*3..i*3+2]` mapped to `Vector3` per vertex |
| Default particle alpha = 1 | `AvatarRenderLimb.ts:62`, `test_avatar.html:89` | `Color4(r,g,b,1)` |
| Material color field must respect `color` or `diffuseColor` | `AvatarRenderLimb.ts:88-95` | Apply `emotion.baseColor` to whichever field exists |
| Skin color is a packed int, not a string | `AvatarRenderLimb.ts:50`, `test_avatar.html:53` | Accept `packedRgb: number` and unpack internally |
| Emotion can come from `OracleProvenance` OR direct `RenderEmotionParameters` | `AvatarRenderLimb.setOracleProvenance` vs `GhostSplatLimb.setEmotion` | Hook MUST support both `setProvenance` and `setEmotion` |
| Aura visual uses `emissiveColor` and `resolution/tension/auraPulse/auraJitter` | `GhostSplatLimb.createEmotionAura:67-113` | PCS-independent overlay plane with `DynamicTexture` and `StandardMaterial` |
| Head position fallback | `GhostSplatLimb.ts:223` (`y=100`) + `test_ghostsplat.html:57` (`y=120`); PCS bbox center used in `test_avatar.html:95` and `AvatarRenderLimb.ts:68` | Prefer PCS mesh bbox center; fallback configurable default Y |
| Splat event types | `GhostSplatLimb.SplatEvent.type` | Must emit exactly `'damage' | 'xp' | 'block' | 'heal' | 'poison' | 'crit' | 'emotion_aura'`; for `OracleAvatarHead`, split aura into separate `emitAura` hook |
| Empty `indices` in current model fixtures | `kit_420.json:7248`, `kit_31149.json:3016`, `kit_12428.json:2080` | Renderer MUST NOT require indices; `PointsCloudSystem` renders without topology |
| Vertex count from metadata or `positions.length / 3` | `AvatarRenderLimb.ts:54` | `vertexCount` authoritative source; `positions.length / 3` acceptable fallback |

---

## 8. Integration Points with Existing Limbs

### `AvatarStateLimb` bridge
`AvatarStateLimb.getRenderState()` returns `AvatarConfiguration` containing `morphology.appearanceIndices.skinColor` (varbit 2827). `OracleAvatarHead.bindAvatarState()` SHOULD subscribe to state mutation so that when `AvatarStateLimb` commits a new broadcast signal, the head can optionally refresh skin or head-index geometry. `AvatarStateLimb.writeVarBit` emits `varp_change` (`AvatarStateLimb.ts:458`); `OracleAvatarHead` can either listen directly or read from `getRenderState()`.

### `GhostSplatLimb` delegation
`OracleAvatarHead` MAY hold an internal `GhostSplatLimb` for backward compatibility, OR implement a minimal internal splat renderer matching the same `Mesh` lifecycle: `Mesh.CreatePlane` → `StandardMaterial` with `disableLighting` + `useAlphaFromDiffuseTexture` → `requestAnimationFrame` fade → `mesh.dispose()`. If delegating, constructor signature is `private splatLimb: GhostSplatLimb`.

---

## 9. Unresolved Gaps in Current Substrate
1. Per-point temporal weighting: `AvatarRenderLimb.updatePointBrightness` (`AvatarRenderLimb.ts:101-106`) is a placeholder; `RenderEmotionParameters.pointBrightnessBias` exists but is not wired to vertex colors.
2. Skin color to packed RGB mapping: `AvatarStateLimb` defines `SKIN_COLORS` strings but no numeric RGB table; `OracleAvatarHead.setSkinColor` currently accepts only packed int.
3. Head centroid source: `test_ghostsplat.html:57` uses `y=120` for kit_31149 at scale 1; `AvatarRenderLimb.ts:68` uses PCS bbox center. A shared `getHeadPosition()` should normalize this.
