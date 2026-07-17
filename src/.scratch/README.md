# `src/.scratch`

Experimental and throwaway scripts — not part of the production build.

## Contents

| File | Purpose |
|------|---------|
| `run_vision_pipeline.ts` | TypeScript runner: imports a limb module, calls `process(imagePath)`, reports qutrit region distribution. |
| `run_vision_pipeline.mjs` | ESM entry pointing the same pipeline runner. |

## Notes

Use these for ad-hoc vision-ingredient testing only. They are not imported by any production entry.
