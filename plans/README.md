# Plans

Design and implementation plans for POG2 subsystems.

## Files

- `sharded-roaming-alpaca.md` — Vision-actuation race-condition fix plan.
  - Problem: `edge_radar.html` canvas resize clears the drawing buffer during `TransientObserver` screenshots, causing OCR/template failures ("txt not found on html").
  - Solution: "Vision Lock Gate" — WebSocket handshake between `TransientObserver` and `edge_radar.html` to defer canvas resize during vision capture.

## Usage

Reference only. Implementation status tracked in parent `POG2_GLOBAL_INDEX.md`.
