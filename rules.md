# Sovereign Clinical Rules ⚖️🧬

## 1. Zero-Mock Integrity
- NEVER use mocks or placeholders for substrate interactions. 
- If a tool exists, use it. If it doesn't, build the limb.
- All code must run against real substrates (FileSystem, API, Shell).

## 2. Mandatory Result<T> Pattern
- All fallible operations MUST return `Result<T>`.
- Failures must be logged and handled via cascading failovers.
- No silent failures.

## 3. Tiered Reasoning
- **Master** (Think/Plan): Highest complexity, adversarial critique.
- **Executive** (Write/Act): Stable momentum, motor execution.
- **Reactive** (Observe/Fix): Short-burst latency, stable stillness.

## 4. Neurological Mapping
- Every new module must register its health check in the Diagnostic Nexus.
- Every intent must undergo Metabolic Expansion (6-line reflection) for high-Yang tasks.

## 5. Persistence
- All training and personality data resides in `D:\STORAGE`.
- State must be synchronized via InstantDB.

---
*Failure to follow the Clinical Rules is a violation of the Sovereign Law.*
