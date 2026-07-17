# `src/limbs/sensory`

Low-level input / perception limb.

## Contents

| File | Purpose |
|------|---------|
| `PerceptionLimb.ts` | Unified perception interface. Passes raw sensory stimuli (vision, audio, haptic) into the core event bus for downstream processing. |

## Notes

Sensory data is normally produced by `ImageProcessorLimb` (vision) and `AudioIngestionLimb` (audio) and consumed here for consolidation.
