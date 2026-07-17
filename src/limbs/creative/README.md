# `src/limbs/creative`

Content-generation limbs — audio, video, storyboards, synthesis, media forging.

## Contents

| File | Purpose |
|------|---------|
| `StoryboardLimbV2.ts` | Generates Born-Digital entity spot-anim sequences from narrative segments; manages 50 000–149 999 entity-ID range. |
| `SoundtrackLimb.ts` | Composes adaptive gameplay soundtracks. |
| `YouTubeLimb.ts` | YouTube content integration / ingestion. |
| `WebAppForgeLimb.ts` | Forges lightweight web-app shells for content delivery. |
| `VoiceLimb.ts` | Acts as voice-synthesis bridge. |
| `VideoAssemblerLimb.ts` | Assembles video output from media fragments. |
| `NeuralForgeLimb.ts` | Neural-network based content forge. |
| `MediaForgeLimb.ts` | Generic media (text/audio/image) forge. |
| `GutenbergLimb.ts` | Book/long-form content generation (Project Gutenberg-flavoured). |
| `sound/CacheSoundSource.ts` | Reads encoded sound from cache data. |
| `sound/SoundEventResolver.ts` | Resolves sound events to concrete asset IDs. |
| `sound/SovereignOpcodeParser.ts` | Parses sovereign (custom) audio opcodes. |
| `sound/SoundEffectDecoder.ts` | Decodes sound-effect payloads. |
| `sound/SoundTriggerRegistry.ts` | Registry mapping trigger IDs to sound events. |

## Usage

Creative limbs are called from gameplay/spatial events (e.g. `AvatarRenderLimb`,
`GameplaySovereigntyLimb`) when visual or audio feedback is required.
