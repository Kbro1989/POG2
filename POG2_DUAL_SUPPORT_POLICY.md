# POG2 — Dual-Support Policy for WSL / Windows Build Paths

Current limits:
- This environment cannot execute BYOND compile steps.
- `.dme` rebuild should happen only on a Windows or WSL BYOND-equipped host.
- POG2 reachable here is through source/docs/config in `scratch/pog2`.

Dual-support intent:
- If `OS` resolves to `Windows_NT`:
  - prefer Windows paths
  - native `DreamDaemon` / `DreamMaker` / standard `.dme` includes
- If POG2 is launched from WSL or a Linux-equivalent runtime:
  - prefer `/mnt/c/Users/...` form paths
  - avoid Windows-only env values; use WSL-cross-compatible paths for storage/search/model roots
  - `putmask /=` and `putmask *=()` compile-determinism cases should be treated as two valid declarations of one intent:
    - `/=` => append-mode build resets
    - `*=()` => explicit empty-list rebuild
  - Implement whichever form matches the active toolchain and keep both documented

Preferred outcome:
- `POG2_FUNCTIONAL_KNOWLEDGE.md` becomes the shared reference for how Hermes should prefer or preserve each mode.
- No further speculative edit attempts on compile files until the user confirms BYOND/WSL availability on host.
