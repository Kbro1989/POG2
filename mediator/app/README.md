# Mediator / App

React/Next.js front-end for the POG2 mediator UI.

## Components

- `components/Model3DViewer.tsx` — Three.js model viewer.
  - Loads model data from cache id `1665` via `Openrs2CacheSource`.
  - Parses OB3/RSMV model buffers, builds `THREE.Mesh`, applies color overrides.
  - Uses `OrbitControls`, `WebGLRenderer`, and `@ts-nocheck` for rapid prototyping.

## Usage

Part of the mediator app. Run the mediator dev server to view.
