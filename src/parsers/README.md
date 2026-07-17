# src/parsers

POG2-native interface and protocol parsers.

Files:
- `InterfaceParser.ts` — POG2 replacement for the interface-specific portion of `rsmv/opdecoder.js`. Imports `rsmv_inspector/src/opcodes/typedef.jsonc` and `interfaces.jsonc`, builds a parser from `OpcodeReader`, and exposes a single static `read(state)` entrypoint expected by `HUDForensicsLimb`.

Notes:
- Depends on JSON module resolution (`resolveJsonModule`) and `rsmv_inspector` data files.
- Output is reconciled with HUD forensics consumers.