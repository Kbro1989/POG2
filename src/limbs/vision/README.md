# `src/limbs/vision`

Screen-capture, image processing, and colour-validation pipeline.

## Contents

| File | Purpose |
|------|---------|
| `VisionRouterLimb.ts` | Routes captured game frames through the correct image-processor pipeline. |
| `ImageProcessorLimb.ts` | Core image-processing primitives (colour quantisation, region detection). |
| `ChromaValidator.ts` | Validates chroma key / colour-gamut constraints on processed frames. |
| `run_vision_pipeline_local.cjs` | Local runner shell — calls `process()` on a given limb against a screenshot and prints qutrit region distribution. |

## Usage

```shell
node run_vision_pipeline_local.cjs <modulePath> <imagePath> [maxColors]
```

Returns `{ paletteSize, regionCount, qDist, top6 }` per frame.
