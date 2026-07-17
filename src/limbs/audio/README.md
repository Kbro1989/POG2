# `src/limbs/audio`

Audio substrate ingestion — converts raw cache audio buffers into structured learning events.

## Contents

| File | Purpose |
|------|---------|
| `AudioIngestionLimb.ts` | Singleton ingestor. Converts binary audio assets into `LearningEvent`s annotated with spatial, pedagogical, and behavioural metadata. Implements `OmniTrainingBridge`. |

## Domain Namespace

`audio_substrate`
