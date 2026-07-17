# Memory

Post-mortem notes and persistent state for POG2 subsystems.

## Files

- `hudforensics-limb-fix.md` — Fix record for `HUDForensicsLimb`: replaced `.ts` requires with POG2-native `JagexCacheReader`/`POG2NativeCacheSource` imports; corrected `Record<number, number,number, string>` typo and `/I will s /I will siphon/i` regex.
- `global_offset.json` — Global cache/base offset values.

## Usage

Reference for debugging prior fixes; `global_offset.json` may be ingested by cache readers at init.
