# Diagnostic

Runtime diagnostics and integration tests for the POG2 sovereign/engine stack.

## Files

- `e2e-logic-test.ts` — End-to-end logic test for `TernaryRouter` consensus gating and `OrchestrateEngine` domain-lock enforcement.
- `branch-gc.ts` — Branch garbage-collection / cleanup utility.

## Usage

Run with `ts-node` / `npm run diagnostic` to validate domain isolation and router behavior.
