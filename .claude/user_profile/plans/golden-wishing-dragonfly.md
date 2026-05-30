# Plan: Fix Beta Geometry Extraction Pipeline

## Context
The current geometry extraction pipeline for RS3 Beta kits is producing incomplete and sometimes malformed data. Specifically:
- `kit_420.json` is missing the required JSON wrapper (`normals`, `uvs`, `indices`, `metadata`) because it was extracted using a legacy script.
- Mesh topology (`indices`) is missing across all kits because the `renders` buffer decoding is not yet implemented in the Beta Opcoder.
- UV coordinates are being exported as large integers (fixed-point) instead of normalized floats [0, 1].
- The pipeline is inflexible, using hardcoded model IDs and a fixed `clientVersion`.

The goal is to unify the extraction process, fix data scaling, and provide a path toward full topology recovery.

## Implementation Approach

### 1. Unify and Robustify `extract_kit_pipeline.ts`
- **CLI Arguments**: Replace the hardcoded `enum711Keys` array with logic to accept model IDs via command line arguments (e.g., `node extract_kit_pipeline.ts 31149 12428 420`).
- **Version Flexibility**: If the `clientVersion` (currently 1149) is found to be causing opcode drift, I will investigate if it can be auto-detected or passed as an argument. (For now, I'll keep it but make it easier to change).
- **Cache Path**: Ensure the `CACHE_PATH` is consistently pointing to the Beta cache.

### 2. Fix Data Scaling in `buildBetaOpcoder`
- **UV Normalization**: In `buildBetaOpcoder`, divide all values in the `uvBuffer` by `65536.0` to convert from 16-bit fixed-point to normalized floats.
- **Consistency**: Ensure all extracted arrays are properly cast to standard JavaScript arrays for JSON serialization.

### 3. Fix `kit_420.json` (and other kits)
- Re-run the improved `extract_kit_pipeline.ts` for all target kits, including `420`. This will ensure they all follow the same structured JSON schema (including `metadata`, `normals`, and `uvs`).

### 4. Addressing Topology (Indices)
- The `indices` array is currently empty because `meshdata.renders` decoding is not yet reversed.
- I will add a diagnostic log in `buildBetaOpcoder` to dump the raw `renders` buffer for one of the kits. This will provide the data necessary to reverse-engineer the packing format in a future session.
- For now, the plan is to maintain the `indices: []` structure but ensure the other data is correct.

## Critical Files
- `scratch\extract_kit_pipeline.ts`: Main logic for extraction, decoding, and adaptation.
- `public\models\kit_*.json`: The output artifacts that need regeneration.

## Verification Plan
1. **Execution**: Run `node scratch/extract_kit_pipeline.ts 31149 12428 37641 420`.
2. **Format Check**: Verify `public\models\kit_420.json` now contains the full JSON object structure instead of just a positions array.
3. **Data Check**:
    - Check `public\models\kit_12428.json` to ensure UV values are now between 0 and 1.
    - Verify `vertexCount` in metadata matches the length of the `positions` array / 3.
4. **Renderer Check**: Confirm the PBR renderer can still load the files (they should be compatible as the schema hasn't changed, only the data quality has improved).
