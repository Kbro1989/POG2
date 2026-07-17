"""
overflow.py — VRAM-aware inference shim for POG2.

This module is the Python-side companion to ``src/api/ai/OverflowShim.ts``.
It probes the local GPU, estimates the memory footprint of a candidate
model at a given context window, and picks the first model in a fallback
chain that physically fits.

Pure stdlib — no third-party dependencies.

Tier table (active tier auto-detected from ``nvidia-smi`` free memory,
or set explicitly via ``POG2_VRAM_TIER``):

    mini      6 GB  Q4_K_M  32K default  64K max
    puppeteer 16 GB Q4_K_M  64K default  128K max
    pro       24 GB Q8_0    128K default 256K max
    cpu       0 GB  n/a     4K default   8K max

CLI:

    python -m pog2.inference.overflow probe
    python -m pog2.inference.overflow check <model> [--ctx N]
    python -m pog2.inference.overflow pick  <preferred> [--fallback a,b,c] [--ctx N]
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import subprocess
import sys
from typing import Any

logger = logging.getLogger("pog2.inference.overflow")

# ── Tier table ─────────────────────────────────────────────────────
#
# ctx_default is what we use when no ctx is specified.
# ctx_max is a hard ceiling — the model can't honestly handle more than
# this at the tier's VRAM budget, so we clamp rather than allow OOM.

VRAM_TIERS: dict[str, dict[str, Any]] = {
    "mini":      {"vram_gb": 6,  "quant": "Q4_K_M", "ctx_default": 32768, "ctx_max": 65536},
    "puppeteer": {"vram_gb": 16, "quant": "Q4_K_M", "ctx_default": 65536, "ctx_max": 131072},
    "pro":       {"vram_gb": 24, "quant": "Q8_0",   "ctx_default": 131072, "ctx_max": 262144},
    "cpu":       {"vram_gb": 0,  "quant": "Q2_K",   "ctx_default": 4096,  "ctx_max": 8192},
}

# Bytes-per-token for KV cache at a given parameter size. Calibrated against
# GQA architectures (Qwen2.5, Llama 3.x, Gemma 2) at fp16 KV. The shim
# rounds to the nearest 64K for headline numbers; the math is linear in ctx.
#
#   Model size  KV @ 64K    KV per 1K tokens
#   3B          ~0.6 GB     ~0.0094 GB
#   7B          ~1.0 GB     ~0.0156 GB
#   14B         ~1.6 GB     ~0.0250 GB
#   32B         ~3.2 GB     ~0.0500 GB
#   70B         ~7.0 GB     ~0.1100 GB
#
# MoE flag (e.g. Mixtral, Qwen3-MoE) adds a fixed overhead because
# expert weights are smaller but the routing tensors are larger.

KV_PER_1K_TOKENS: dict[str, float] = {
    "1B":  0.0035,
    "2B":  0.0060,
    "3B":  0.0094,
    "4B":  0.0110,
    "7B":  0.0156,
    "8B":  0.0180,
    "13B": 0.0230,
    "14B": 0.0250,
    "32B": 0.0500,
    "70B": 0.1100,
}

# Base weight footprint in GB for a model at a given parameter size and
# quantization. The "base" column is fp16 size; quant is a multiplier.
# These are conservative; ggml quantizations vary, so we lean a bit high.

WEIGHTS_BASE_GB: dict[str, float] = {
    "1B":  2.0,
    "2B":  4.0,
    "3B":  6.0,
    "4B":  8.0,
    "7B":  14.0,
    "8B":  16.0,
    "13B": 26.0,
    "14B": 28.0,
    "32B": 64.0,
    "70B": 140.0,
}

QUANT_MULTIPLIER: dict[str, float] = {
    "Q2_K":   0.18,
    "Q3_K_S": 0.24,
    "Q3_K_M": 0.27,
    "Q3_K_L": 0.30,
    "Q4_0":   0.32,
    "Q4_K_S": 0.34,
    "Q4_K_M": 0.36,
    "Q5_0":   0.42,
    "Q5_K_S": 0.44,
    "Q5_K_M": 0.48,
    "Q6_K":   0.55,
    "Q8_0":   0.70,
    "F16":    1.00,
    "F32":    2.00,
}

# MoE overhead: -0.5× weights (only active experts loaded) but +0.4× KV.
MOE_WEIGHTS_FACTOR = 0.5
MOE_KV_FACTOR = 1.4

# Hard ctx floor. Below this, generation is effectively useless.
CTX_FLOOR = 2048

# Headroom: we leave this fraction of VRAM unused to avoid OOM at
# exactly the moment Ollama tries to load the model.
VRAM_HEADROOM = 0.15


# ── GPU probing ────────────────────────────────────────────────────

def get_free_vram_mb() -> int:
    """Return free VRAM in MiB, or 0 on failure / CPU-only systems.

    Tries NVIDIA first (most common on POG2 hosts), then AMD ROCm.
    No-op exception paths return 0 so callers degrade gracefully.
    """
    # nvidia-smi — most common, fastest
    try:
        out = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=memory.free",
                "--format=csv,noheader,nounits",
            ],
            text=True,
            timeout=3,
        )
        # nvidia-smi returns one line per GPU. We pick the first with
        # the most free memory; multi-GPU routing is out of scope.
        rows = [line.strip() for line in out.strip().splitlines() if line.strip()]
        if rows:
            return int(rows[0])
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass

    # rocm-smi — AMD fallback
    try:
        out = subprocess.check_output(
            ["rocm-smi", "--showmeminfo", "vram", "--csv"],
            text=True,
            timeout=3,
        )
        # Parse the "Total VRAM" or "Free VRAM" column. Best-effort.
        for line in out.splitlines():
            if "free" in line.lower():
                match = re.search(r"(\d+)", line)
                if match:
                    mb = int(match.group(1))
                    # rocm-smi may report bytes; convert if too large.
                    return mb // (1024 * 1024) if mb > 100_000 else mb
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        pass

    return 0


# ── Tier detection ─────────────────────────────────────────────────

def detect_tier(free_mb: int | None = None, override: str | None = None) -> str:
    """Return the active tier name.

    If ``override`` (from ``POG2_VRAM_TIER``) is set and valid, use it.
    Otherwise infer from free VRAM:

        >= 20 GB → pro
        >= 12 GB → puppeteer
        >= 4 GB  → mini
        else     → cpu
    """
    if override and override in VRAM_TIERS:
        return override

    if free_mb is None:
        free_mb = get_free_vram_mb()

    free_gb = free_mb / 1024.0
    if free_gb >= 20:
        return "pro"
    if free_gb >= 12:
        return "puppeteer"
    if free_gb >= 4:
        return "mini"
    return "cpu"


# ── Model parsing ──────────────────────────────────────────────────

_SIZE_PATTERN = re.compile(r"(\d+\.?\d*)\s*[bB]\b", re.IGNORECASE)
_MOE_PATTERN = re.compile(r"moe|mixtral|qwen.*moe", re.IGNORECASE)
_QUANT_PATTERN = re.compile(r"(Q\d+_K(?:_[SML])?|Q\d+_\d+|F\d+)", re.IGNORECASE)

# Cache of `ollama show` results. Keyed by model name, value is the parsed
# dict. We hit ollama at most once per process per model; subsequent
# lookups are O(1) dict reads.
_OLLAMA_SHOW_CACHE: dict[str, dict[str, Any]] = {}


def _ollama_show(model_name: str) -> dict[str, Any] | None:
    """Best-effort fetch of a model's metadata from `ollama show`.

    Returns a dict with ``parameters_b`` (e.g. 8.0), ``quantization``
    (e.g. "Q4_K_M"), ``context_length`` (int), and ``architecture``.
    Returns None if ollama is unavailable or the model isn't installed.
    """
    if model_name in _OLLAMA_SHOW_CACHE:
        return _OLLAMA_SHOW_CACHE[model_name]

    try:
        out = subprocess.check_output(
            ["ollama", "show", model_name],
            text=True,
            timeout=5,
        )
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        _OLLAMA_SHOW_CACHE[model_name] = None or {}  # type: ignore[assignment]
        return None

    parsed: dict[str, Any] = {}
    for line in out.splitlines():
        stripped = line.strip()
        if stripped.startswith("parameters"):
            # "parameters          8.0B"
            num_match = re.search(r"(\d+\.?\d*)\s*[bB]", stripped)
            if num_match:
                parsed["parameters_b"] = float(num_match.group(1))
        elif stripped.startswith("quantization"):
            parsed["quantization"] = stripped.split()[1].upper()
        elif stripped.startswith("context length"):
            try:
                parsed["context_length"] = int(stripped.split()[2])
            except (IndexError, ValueError):
                pass
        elif stripped.startswith("architecture"):
            parsed["architecture"] = stripped.split()[1]

    _OLLAMA_SHOW_CACHE[model_name] = parsed if parsed else None
    return parsed or None


def extract_size(model_name: str) -> str:
    """Extract the parameter size bucket ("3B", "7B", ...) from a model name.

    Falls back to "7B" if nothing parses. Buckets are coarse so 6B/8B
    both land in "7B" for sizing purposes.

    Prefers ``ollama show`` data when available — gemma4:latest doesn't have
    a size in its name, so name-based parsing would guess wrong.
    """
    show = _ollama_show(model_name)
    if show and "parameters_b" in show:
        val = show["parameters_b"]
        if val <= 1.5: return "1B"
        if val <= 2.5: return "2B"
        if val <= 3.5: return "3B"
        if val <= 4.5: return "4B"
        if val <= 8.0: return "7B"
        if val <= 9.0: return "8B"
        if val <= 14.0: return "13B"
        if val <= 16.0: return "14B"
        if val <= 34.0: return "32B"
        return "70B"

    match = _SIZE_PATTERN.search(model_name)
    if not match:
        return "7B"
    val = float(match.group(1))
    if val <= 1.5: return "1B"
    if val <= 2.5: return "2B"
    if val <= 3.5: return "3B"
    if val <= 4.5: return "4B"
    if val <= 8.0: return "7B"   # 6B/7B/8B all ~same weight class
    if val <= 9.0: return "8B"
    if val <= 14.0: return "13B"
    if val <= 16.0: return "14B"
    if val <= 34.0: return "32B"
    return "70B"


def extract_quantization(model_name: str) -> str:
    """Extract the quantization tag from a model name. Default Q4_K_M.

    Prefers ``ollama show`` data when available.
    """
    show = _ollama_show(model_name)
    if show and "quantization" in show:
        return show["quantization"]
    match = _QUANT_PATTERN.search(model_name)
    if not match:
        return "Q4_K_M"
    return match.group(1).upper().replace("F16", "F16").replace("F32", "F32")


def is_moe(model_name: str) -> bool:
    show = _ollama_show(model_name)
    if show and "architecture" in show:
        arch = show["architecture"].lower()
        if any(s in arch for s in ("mixtral", "moe")):
            return True
    return bool(_MOE_PATTERN.search(model_name))


def get_ollama_disk_size_gb(model_name: str) -> float | None:
    """Return the on-disk size of a model in GB, from `ollama list`.

    Returns None if ollama is unavailable or the model isn't installed.
    This is ground truth: the actual bytes on disk after quantization,
    which is what VRAM pressure is measured against.
    """
    try:
        out = subprocess.check_output(
            ["ollama", "list"],
            text=True,
            timeout=5,
        )
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return None

    # ollama list output: NAME  ID  SIZE  MODIFIED
    # The SIZE column is human-readable, e.g. "4.7 GB" or "9.6 GB".
    for line in out.splitlines():
        if model_name in line:
            match = re.search(r"(\d+\.?\d*)\s*(GB|MB|KB)", line)
            if match:
                val = float(match.group(1))
                unit = match.group(2)
                if unit == "GB": return val
                if unit == "MB": return val / 1024.0
                if unit == "KB": return val / (1024.0 * 1024.0)
    return None


# ── Memory estimates ───────────────────────────────────────────────

def estimate_model_weights_gb(model_name: str, quantization: str | None = None) -> float:
    """Rough on-disk size in GB for the model's weights at the given quant.

    Prefers ground truth from ``ollama list`` (the actual bytes on disk)
    when available. Falls back to a name-based estimate for not-yet-pulled
    models, which is necessary because pick_fallback needs to evaluate
    models that aren't installed yet.
    """
    actual = get_ollama_disk_size_gb(model_name)
    if actual is not None:
        return actual

    size = extract_size(model_name)
    base = WEIGHTS_BASE_GB.get(size, 14.0)
    quant = (quantization or extract_quantization(model_name)).upper()
    mult = QUANT_MULTIPLIER.get(quant, 0.36)  # unknown quant → assume Q4_K_M
    footprint = base * mult
    if is_moe(model_name):
        footprint *= MOE_WEIGHTS_FACTOR
    return footprint


def estimate_kv_cache_gb(ctx_tokens: int, model_name: str) -> float:
    """Rough VRAM cost in GB of the KV cache for ``ctx_tokens`` tokens."""
    size = extract_size(model_name)
    per_k = KV_PER_1K_TOKENS.get(size, 0.0156)
    footprint = per_k * (ctx_tokens / 1024.0)
    if is_moe(model_name):
        footprint *= MOE_KV_FACTOR
    return footprint


# ── Fit computation ────────────────────────────────────────────────

def compute_fit(model_name: str, requested_ctx: int, tier: str) -> dict[str, Any]:
    """The core decision: can ``model_name`` serve at ``requested_ctx`` in ``tier``?

    Returns a dict with ``ctx`` (possibly clamped), ``num_gpu``, ``fit_status``,
    and ``reason``. The tier's ``ctx_max`` is the hard ceiling; the weights
    plus KV must fit within ``vram_gb * (1 - VRAM_HEADROOM)``.
    """
    config = VRAM_TIERS[tier]
    available_gb = config["vram_gb"] * (1 - VRAM_HEADROOM)

    weights_gb = estimate_model_weights_gb(model_name)
    requested_kv = estimate_kv_cache_gb(requested_ctx, model_name)

    # CPU tier: no GPU offload. num_gpu=0. ctx is clamped to ctx_max.
    if tier == "cpu" or config["vram_gb"] == 0:
        ctx = min(requested_ctx, config["ctx_max"])
        return {
            "model": model_name,
            "ctx": ctx,
            "num_gpu": 0,
            "tier": tier,
            "fit_status": "tight" if ctx < requested_ctx else "ok",
            "weights_gb": round(weights_gb, 2),
            "kv_gb": round(requested_kv, 2),
            "reason": "CPU-only fallback; ctx clamped to tier ceiling" if ctx < requested_ctx else None,
        }

    # First check: does it fit fully on GPU at all?
    if weights_gb > available_gb:
        return {
            "model": model_name,
            "ctx": min(requested_ctx, config["ctx_max"]),
            "num_gpu": 50,  # partial offload
            "tier": tier,
            "fit_status": "tight",
            "weights_gb": round(weights_gb, 2),
            "kv_gb": round(requested_kv, 2),
            "reason": f"weights {weights_gb:.1f} GB > {available_gb:.1f} GB available; partial offload",
        }

    # Second check: weights fit, but weights + KV at requested ctx?
    needed = weights_gb + requested_kv
    if needed > available_gb:
        # Clamp ctx to whatever KV budget we have left.
        budget_gb = available_gb - weights_gb
        per_token_gb = estimate_kv_cache_gb(1024, model_name) / 1024.0
        clamped_ctx = int(budget_gb / per_token_gb) if per_token_gb > 0 else CTX_FLOOR
        clamped_ctx = max(clamped_ctx, CTX_FLOOR)
        clamped_ctx = min(clamped_ctx, config["ctx_max"], requested_ctx)

        return {
            "model": model_name,
            "ctx": clamped_ctx,
            "num_gpu": 99,  # still on GPU, just smaller ctx
            "tier": tier,
            "fit_status": "clamped" if clamped_ctx < requested_ctx else "ok",
            "weights_gb": round(weights_gb, 2),
            "kv_gb": round(estimate_kv_cache_gb(clamped_ctx, model_name), 2),
            "reason": (f"clamped ctx {requested_ctx} → {clamped_ctx} "
                       f"to fit {needed:.1f} GB > {available_gb:.1f} GB")
                      if clamped_ctx < requested_ctx else None,
        }

    # Fits cleanly.
    return {
        "model": model_name,
        "ctx": min(requested_ctx, config["ctx_max"]),
        "num_gpu": 99,
        "tier": tier,
        "fit_status": "ok",
        "weights_gb": round(weights_gb, 2),
        "kv_gb": round(requested_kv, 2),
        "reason": None,
    }


# ── Fallback selection ─────────────────────────────────────────────

def pick_fallback(
    preferred: str,
    fallbacks: list[str],
    requested_ctx: int,
    tier: str | None = None,
) -> dict[str, Any]:
    """Walk the fallback chain; return the first model that fits.

    Walks ``[preferred, *fallbacks]`` in order. The first model whose fit
    status is anything other than "impossible" wins. Logs the skip
    reason for any model that doesn't make it.
    """
    if tier is None:
        tier_override = os.environ.get("POG2_VRAM_TIER")
        tier = detect_tier(override=tier_override if tier_override in VRAM_TIERS else None)

    chain = [preferred] + [f for f in fallbacks if f and f != preferred]
    last_result: dict[str, Any] | None = None

    for i, model in enumerate(chain):
        result = compute_fit(model, requested_ctx, tier)
        # If even at clamped ctx the model doesn't physically fit, mark
        # impossible and continue. compute_fit's "tight" means partial
        # offload, which is acceptable (model is still usable).
        weights_gb = result["weights_gb"]
        vram_gb = VRAM_TIERS[tier]["vram_gb"]
        if weights_gb > vram_gb * 1.5:  # way too big to even partial-offload
            result["fit_status"] = "impossible"
            result["reason"] = f"weights {weights_gb:.1f} GB too large for tier ({vram_gb} GB)"
            logger.info("overflow: skipping %s — %s", model, result["reason"])
            last_result = result
            continue

        # First workable model wins.
        if i == 0:
            # Preferred model is acceptable as-is. Pass through the
            # compute_fit result so the caller sees any clamping.
            return result
        else:
            logger.info(
                "overflow: preferred %s not viable; using fallback %s (%s)",
                preferred, model, result["fit_status"],
            )
            result["reason"] = result.get("reason") or f"overflowed from preferred {preferred}"
            return result

    # Nothing worked. Return the last impossible result, marked clearly.
    if last_result is not None:
        last_result["reason"] = (last_result.get("reason", "") +
                                 " | no fallback in chain fit at requested ctx").strip(" |")
        return last_result

    # Empty chain. Shouldn't happen, but degrade gracefully.
    return {
        "model": preferred,
        "ctx": CTX_FLOOR,
        "num_gpu": 0,
        "tier": tier,
        "fit_status": "impossible",
        "reason": "empty fallback chain",
    }


# ── CLI ────────────────────────────────────────────────────────────

def _configure_logging() -> None:
    level = logging.DEBUG if os.environ.get("POG2_OVERFLOW_DEBUG") == "1" else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )


def cmd_probe(_args: argparse.Namespace) -> int:
    free_mb = get_free_vram_mb()
    override = os.environ.get("POG2_VRAM_TIER")
    tier = detect_tier(free_mb, override)
    config = VRAM_TIERS[tier]
    result = {
        "free_vram_mb": free_mb,
        "free_vram_gb": round(free_mb / 1024.0, 2),
        "tier": tier,
        "tier_vram_gb": config["vram_gb"],
        "ctx_default": config["ctx_default"],
        "ctx_max": config["ctx_max"],
        "tier_override": override if override in VRAM_TIERS else None,
    }
    print(json.dumps(result, indent=2))
    return 0


def cmd_check(args: argparse.Namespace) -> int:
    override = os.environ.get("POG2_VRAM_TIER")
    tier = detect_tier(override=override if override in VRAM_TIERS else None)
    result = compute_fit(args.model, args.ctx, tier)
    print(json.dumps(result, indent=2))
    return 0


def cmd_pick(args: argparse.Namespace) -> int:
    fallbacks = [f.strip() for f in (args.fallback or "").split(",") if f.strip()]
    override = os.environ.get("POG2_VRAM_TIER")
    tier = detect_tier(override=override if override in VRAM_TIERS else None)
    result = pick_fallback(args.preferred, fallbacks, args.ctx, tier)
    print(json.dumps(result, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m pog2.inference.overflow",
        description="VRAM-aware inference overflow shim for POG2.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_probe = sub.add_parser("probe", help="Report current VRAM and active tier.")
    p_probe.set_defaults(func=cmd_probe)

    p_check = sub.add_parser("check", help="Check whether a model fits at a given ctx.")
    p_check.add_argument("model", help="Ollama model name, e.g. 'gemma4:latest'")
    p_check.add_argument("--ctx", type=int, default=32768, help="Requested context window in tokens.")
    p_check.set_defaults(func=cmd_check)

    p_pick = sub.add_parser("pick", help="Walk a fallback chain and pick a fitting model.")
    p_pick.add_argument("preferred", help="Preferred model name.")
    p_pick.add_argument("--fallback", default="", help="Comma-separated fallback models.")
    p_pick.add_argument("--ctx", type=int, default=32768, help="Requested context window in tokens.")
    p_pick.set_defaults(func=cmd_pick)

    return parser


def main(argv: list[str] | None = None) -> int:
    _configure_logging()
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
