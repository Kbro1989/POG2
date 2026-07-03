# POG2 App Handshake Contract

## Init visibility requirements

- Contract expects functional-knowledge files to be visible from POG2 init and manifests.
- Register these knowledge assets as part of POG2 runtime metadata/init binds:
  - `POG2_FUNCTIONAL_KNOWLEDGE.md`
  - `POG2_FUNCTIONAL_TETHER_MECHANICS.md`
  - `SKILLSLIMB_ASSIMILATION_MAP.md`
  - `POG2_DUAL_SUPPORT_POLICY.md`
- Each manifest/bootstrap surface must surface these docs as readable metadata sources, not write-off artifacts.

## Handshake

- Hermes initiates handshake.
- POG2 side must bind through `OrchestrateEngine.ts` at POG2 end.
- Include Hermes-init badge/topic in contract identification.

## Notes

- This update is currently scoped to scratch path as discovery only.
- If a dedicated POG2 manifest path is confirmed, migrate or mirror this contract there.
