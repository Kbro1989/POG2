# Data / Boss Templates

Wave-based boss encounter templates for the POG2 engine.

## Files

- `tzkal_zuk.json` — TzKal-Zuk (The Inferno) template.
  - 6 waves: Jad/Ranger/Mager/Jads, then 6-wave pillar/Zuk encounter.
  - Defines spawns, mechanics (`pray_flick_required`, `healer_mechanic`, `pillar_phase`, `spear_wall`, `enrage_at_25pct`), and world coordinates.
  - No player prescriptive logic; decisions come from `sovereign_state.json` + `CombatRotationEngine`.

## Usage

Load via `BossTemplateEngine` to drive wave spawning, mechanic triggers, and phase transitions in simulation.
