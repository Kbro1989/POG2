# Plan: Implementation of Sovereign Training Ground Visualizer

## Context
The goal is to transform the `RSMV Viewer` (specifically `rsmv_inspector`) into a "Sovereign Training Ground". This involves overlaying the "Sovereign" pedagogical residues (Ground Truth) and gameplay logic onto the 3D world representation. This allows for the visual audit of what the AI "sees" and "learns", creating a feedback loop between the 3D substrate and the pedagogy distillation pipeline.

## Proposed Architecture: The Sovereign Overlay

We will implement a three-layered visual system on top of the existing `SovereignObjectRenderer`.

### 1. The Influence Layer (GhostSplat)
- **Concept**: A visual "aura" or "heatmap" around entities that represents their "Sovereign Value" or "Training Signal".
- **Sovereign Predictive Window**: Implements a **66x66 tile buffer** centered on the avatar. This window determines the "next map area" to be rendered, triggering the pre-fetching of grounding manifests and authentic spawns from `D:\POG2\public`.
- **Implementation**: 
    - Create `SovereignSplatRenderer.ts`. (Completed)
    - Use a semi-transparent, pulsating sphere or "splat" mesh centered on `SovereignObjectRenderer`'s spawned objects.
    - **Color Coding**:
        - `Cyan`: High Training Value (Active Pedagogy Target).
        - `Magenta`: Logic Trigger (Varbit/Sovereign Bridge linked).
        - `Yellow`: Ground Truth Verified (Sovereign Memory match).

### 2. The Grounding Layer (Collision & Boundaries)
- **Concept**: Visualizing the "World Truth" boundaries used by the model for navigation and interaction.
- **Implementation**:
    - Create `SovereignGroundingOverlay.ts`. (Completed)
    - Iterate through `SovereignGroundingStream.ChunkMeshManifest.collisionMatrix`.
    - Render the `CollisionEntry` (walkable vs non-walkable) as a 3D grid of low-poly boxes (e.g., `BoxGeometry` with `Wireframe` enabled).
    - **Color Coding**:
        - `Green`: Walkable.
        - `Red`: Collision/Blocked.

### 3. The Semantic Layer (Sovereign HUD)
- **Concept**: Contextual "Knowledge" overlays for every object/NPC.
- **Implementation**:
    - Refactor `SovereignTrainingHUD.tsx`:
        - Transition from a fixed-position panel to floating 3D labels using `CSS2DRenderer`.
        - Ensure labels follow the target entity in 3D space.
        - Render pedagogy-enriched fields: `learningNote`, `confidence`, and `suggestedAction`.
    - **Sovereign Resolution Chain (Server-Side)**:
        - In `POG2WorldDO.ts`, implement `REQUEST_PEDAGOGY` WebSocket handler:
            - `resolve(id)` $\rightarrow$ `enrich(id, basicData)` $\rightarrow$ `ws.send({ type: 'ENTITY_DATA', ... })`.
        - Initialize `SovereignEntityResolver` and `SovereignPedagogyBridge` in the DO constructor.
    - **Type Alignment**:
        - Unify `EntityHUDData` definitions between `SovereignEntityResolver.ts` and `SovereignTrainingHUD.tsx`.

## Sovereign Truth Refinements (Logic Layer)

To ensure the visualizer reflects "Sovereign Truth," the following logic must be implemented in the resolution chain:

### 1. Manifest Layering & Inference
- **Contiguous Layering**: In `SovereignEntityResolver.resolve`, implement logic to treat contiguous entries with the same name or unnamed entries following a named one as property "layers" of the preceding entity.
- **Model Versioning**: In `ModelRolodex`, implement a resolution strategy that identifies model versions (e.g., using a regex for `-v\d+`) and always resolves to the latest version for consistency across arrays.

### 2. Item & Object Variants
- **Representational Variants**: Implement a mapping system in `SovereignEntityResolver` to distinguish between Inventory, Bank, Shop, and Trade versions of items.
- **Context-Aware Resolution**: Use the `interaction_vocabulary.json` and current interaction context (e.g., `Wield` $\rightarrow$ Inventory, `Withdraw` $\rightarrow$ Bank) to select the correct variant ID.
- **Bank-Note Logic**: Specifically detect "Note" versions of non-stackable items and map them to their stackable representational counterparts.
- **Dual-ID Handling**: Resolve world-objects that function as both static NPCs and items by checking both ID lists.

### 3. Authentic Entity Classification
- **Common-Sovereign Anchors**: Maintain a static registry of "Authentic" entities (e.g., Bankers, Guards, General Store Assistants). These are treated as base truth constants across all map areas.

## Critical Files to Modify/Create

### Server-Side (Durable Objects):
- `D:\POG2\src\durable-objects\POG2WorldDO.ts`: Add WebSocket handler for pedagogy requests and integrate resolver/bridge.

### Client-Side (Viewer):
- `D:\POG2\rsmv_inspector\src\viewer\SovereignTrainingHUD.tsx`: Refactor to floating labels and update data mapping.
- `D:\POG2\rsmv_inspector\src\viewer\SovereignObjectRenderer.ts`: Ensure objects are tagged correctly for HUD raycasting.
- `D:\POG2\rsmv_inspector\src\viewer\index.tsx`: Integrate HUD and render layers into the main loop.

### Support Logic:
- `D:\POG2\src\services\SovereignEntityResolver.ts`: Implement layering, variant mapping, and authentic classification.
- `D:\POG2\src\services\SovereignPedagogyBridge.ts`: Integrate model versioning consistency.
- `D:\POG2\src\api\ai\ModelRolodex.ts`: Implement "latest version" resolution for model names.

## Verification Plan
1. **Splat Verification**: Spawn an object via `SovereignObjectRenderer` and verify the "GhostSplat" aura appears and changes color based on training value.
2. **Collision Verification**: Load a `ChunkMeshManifest` and verify that the collision grid aligns with the physical mesh boundaries.
3. **HUD End-to-End**: 
    - Hover over an entity in the 3D viewer.
    - Verify `REQUEST_PEDAGOGY` is sent via WebSocket.
    - Verify `POG2WorldDO` resolves data via Resolver $\rightarrow$ Bridge $\rightarrow$ Model.
    - Verify a floating label appears with correct pedagogical notes and a "Suggested Action".
4. **Sovereign Truth Verification**:
    - Hover over a "Note" item and verify it is correctly identified as a variant.
    - Hover over a common NPC (e.g., Guard) in two different areas and verify they share the same "Authentic" grounding.
    - Verify a multi-layered manifest entry is collapsed into a single entity with merged properties.
5. **Performance**: Confirm that pedagogy requests (which involve AI inference) are cached via KV to prevent HUD lag on repeated hovers.
