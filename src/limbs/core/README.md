# `src/limbs/core`

Heartbeat / neural primitives shared by all other limbs.

## Contents

| File | Purpose |
|------|---------|
| `TemporalHeartbeatLimb.ts` | Canonical 600 ms heartbeat orchestrator. Drives tick authority, hexagram UTF-8 transitions, hardware telemetry, persistence, and cascades to all registered limbs. |
| `NeuralLimb.ts` | General-purpose neural / ML inference primitive consumed by creative and spatial modules. |

## Usage

`TemporalHeartbeatLimb` is bootstrapped from `src/core/bootstrap.ts` and is the primary
entry-point for the POG2 clock domain.
