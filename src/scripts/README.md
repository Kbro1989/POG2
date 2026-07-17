# src/scripts

One-off executable/research scripts for running, validating, probing, and synthesizing POG2 subsystems. This folder is intentionally script-harness oriented rather than reusable library code.

## Contents

Operational/research scripts observed on disk, grouped by likely intent:

- Validation/self-healing:
  - `self_healing_direct.ts`, `validate_grounding.ts`, `validate_diagonal_edges.ts`, `testActuation.ts`, `stressTest.ts`, `visualize_deltas.ts`
- Research/probing/data access:
  - `probe_tables.ts`, `probe_dbrows.ts`, `probe_jagex_tables.ts`, `probe_ms_npcs.ts`, `probe_object_114.ts`, `probe_rs3_archives.ts`
  - `research_player_ranks.ts`, `research_params.ts`, `research_animation_group.ts`, `pullHans.ts`
  - `find_table.ts`, `identify_table_39.ts`, `find_vorkath.ts`, `extract_vorkath_range.ts`
- Extraction/synthesis:
  - `sovereign_world_extract.ts`, `sovereign_npc_extract.ts`, `sovereign_player_forensic.ts`, `sovereign_unified_synthesis.ts`
  - `synthesize_visual_truth.ts`, `synthesize_behavioral_truth.ts`, `synthesize_teleport_grounding.ts`, `synthesize_teleport_grounding.ts`
  - `synthesis_verification.ts`, `unify_container_taxonomy.ts`, `pedagogy_synthesis.ts`, `populate_pedagogy.ts`, `pog2_pedagogy_store.ts`, `generate_pedagogy_corpus.ts`
  - `semantic_mapper.ts`, `semantic_diagnostic.ts`, `semantic_achievements.ts`, `trace_provenance.ts`
  - `extract_all_sequences.ts`, `extract_base_avatars.ts`, `extract_kbd_assets.ts`, `extract_script_behavior.ts`, `extract_rs3_visuals.ts`, `extract_inventories.ts`, `extract_direct_handlers.ts`, `extract_cache_logic.ts`, `extract_database_truth.ts`, `extract_teleport_hierarchy.ts`, `extract_all_spawns.ts`, `extract_sovereign_subsystems.ts`
- Vision/cinema/UI:
  - `liveVisionLoop.ts`, `photo_booth_investigation.ts`, `kbd_roar_cinema.ts`, `kbd_roar_cinema_v2.ts`, `kbd_multi_arena_v1.ts`, `interface_decomposer.ts`, `intercept_beta_config.ts`
- Runtime/runners:
  - `run_phase25_romeo_juliet.ts`, `spawn_kbd_legion.ts`, `update_hexagram_gameplay.cjs`
- Parsing/manifest:
  - `parse_manifest.ts`, `parse_kbd_sequence.ts`, `npc_handler_links.ts`, `inverted_script_search.ts`
- Misc/tooling:
  - `ping.ts`, `prune_archives.ts`, `system_sharder.ts`, `photo_booth_investigation.ts`, `fix_css.cjs`
  - `audit_log.txt`, `movement_parity_snapshot.json`
  - `hunt_ribbon.ts`, `hunt_ribbon.mjs`, `hunt_ribbon.js`, `hunt_ribbon_targeted.mjs`, `download_ribbon.mjs`, `download_wiki_hitmarks.mjs`
