"""pog2.inference — VRAM-aware inference routing for POG2.

The ``overflow`` subpackage is the sidecar that the TypeScript TernaryRouter
calls into via :mod:`pog2.inference.overflow`. It is intentionally stdlib-only
so it can run anywhere the Ollama process is reachable.
"""
