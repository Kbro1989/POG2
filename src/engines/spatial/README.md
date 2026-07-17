# src/engines/spatial

Spatial-awareness engines for autonomous observation and exploration in the game world. These modules build observation reports, manage automatic movement across observed mapsquares, and feed learning/grounding subsystems.

## Contents

- `ObservationEngine.ts` — World-awareness CNS that orchestrates sensing through `WorldForensicsLimb`, builds a local observation grid around a coordinate, and compares live cache mappings against pedagogical ground truth.
- `ExplorationEngine.ts` — Autonomous exploration controller that selects frontier tiles, pathfinds via `DirectionalPathfinder`, executes movement ticks, manages stuck blacklisting, and triggers async tile-level extraction/learning.

## Usage

These engines are consumed by higher-level substrates such as `SimulationHarness` and sovereign discovery/forensics workflows.
