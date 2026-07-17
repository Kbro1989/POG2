# src/prompts

Sovereign system prompts and domain prompt fragments.

Files:
- `SystemPrompts.ts` — Defines `SOVEREIGN_SYSTEM_PROMPT` and `DOMAIN_PROMPTS`. The sovereign prompt sets hard rules: Win32-native command choice, no mocks/placeholders, strict typing, and reality checks. `DOMAIN_PROMPTS` provides per-`SovereignDomain` directives for CODE, SYSTEM, VISION, RESEARCH, FORGE, OBSERVE, SOCIAL, MOTOR, and SENSORY, including authorized/blocked tool lists.

Notes:
- The `.js` twin is a bundled/compiled copy.
- These prompts are injected into worker/model calls across the substrate.