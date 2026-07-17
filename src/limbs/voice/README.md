# `src/limbs/voice`

Text-to-speech / voice-synthesis adapter.

## Contents

| File | Purpose |
|------|---------|
| `CartesiaAdapter.ts` | Bridge to the Cartesia TTS provider. Converts text payloads into audio buffers that feed `AudioIngestionLimb` or `SoundtrackLimb`. |

## Usage

```ts
import { CartesiaAdapter } from './limbs/voice/CartesiaAdapter';
const adapter = new CartesiaAdapter();
const buffer = await adapter.synthesize('Welcome, adventurer.');
```
