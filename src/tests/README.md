# src/tests

Integration and system-level test scripts for POG2 subsystems.

Key areas:
- pathfinding: `pathing_archaeologist*.ts`, `pathfinding_minimal.ts`, `pathfinding_barrows.ts`
- world/discovery: `bridge_navigation_c3.ts`, `global_discovery_c2.ts`, `world_walk_morytania.ts`, `UnifiedWorldProbe.ts`
- combat: `combat_stress_suite.ts`, `test_combat_visualization.ts`, `test_kbd_collision_validation.ts`, `probe_hitmarks.ts`, `necromancer_ai_demo.ts`
- state/sync: `test_world_synchronization.ts`, `test_variable_sync.ts`, `test_region_rebuild.ts`, `test_bootstrap.ts`
- substrate/vision: `test_ghostsplat_engine.ts`, `live_radar_experience.ts`, `WikiPlaceTest.ts`

Run / test: execute individual scripts with `npx tsx` or the project test runner; `.bak` files are stale backups.
