"""
training_corpus.py — Bidirectional corpus bridge between Hermes trajectories
and POG2's pedagogy training corpus.

POG2's GhostTrainingLimb watches `~/.pog2-sovereign/memory/pedagogy_training_corpus.jsonl`
and auto-rebuilds `pog2-pedagogy:latest` in Ollama when ≥5 new instruction pairs
arrive (see src/limbs/pedagogy/GhostTrainingLimb.ts:22, :72).

Hermes's trajectory_compressor.py emits ShareGPT-format JSONL
(see hermes-agent/agent/trajectory.py::save_trajectory):
  {"conversations": [{"from": "human", "value": "..."},
                     {"from": "gpt",   "value": "..."}],
   "model": "...", "timestamp": "...", "completed": true}

POG2's training_corpus expects instruction/input/output fields (the shape
scripts/train_unsloth.py and GhostTrainingLimb both consume).

CLI surface (sibling to overflow.py's probe/check/pick):

  hermes-to-pog2 <input.jsonl>  [-o <output.jsonl>]
        Reads ShareGPT JSONL, writes instruction/input/output to the
        GhostTrainingLimb-watched path. Default output is the watched
        corpus path; --output overrides.

  pog2-to-hermes <input_dir>    [-o <output.jsonl>]
        Reads POG2 training/{interactions,history}/*.jsonl (each line a
        TrainingCollector record with {prompt, response, model, ...}),
        emits ShareGPT JSONL suitable for trajectory_compressor.py input.

  materialize [--base gemma4:latest]  [-o <modelfile_path>]
        Builds the Modelfile that GhostTrainingLimb would build internally
        when the corpus threshold is hit. Prints the path. Useful for
        inspecting what would happen without booting POG2.

Standalone module, stdlib-only (json, re, argparse, logging, os, sys).
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Iterable

logger = logging.getLogger("pog2.inference.training_corpus")

# ── Default paths ─────────────────────────────────────────────────
# These match the defaults in src/utils/SovereignPathResolver.ts
# (SOVEREIGN_HOME_ROOT = ~/.pog2-sovereign; MEMORY_D_PATH = ~/.pog2-sovereign/memory).
DEFAULT_CORPUS_PATH = Path.home() / ".pog2-sovereign" / "memory" / "pedagogy_training_corpus.jsonl"
DEFAULT_POG2_TRAINING_DIR = Path.home() / ".pog2-sovereign" / "training"

# ── JSONL helpers ────────────────────────────────────────────────

def _iter_jsonl(path: Path) -> Iterable[dict]:
    """Yield each non-empty line of a JSONL file as a parsed object."""
    with path.open("r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                logger.warning("Skipping malformed JSON at %s:%d — %s", path, line_num, e)


def _write_jsonl(path: Path, records: Iterable[dict]) -> int:
    """Write records to a JSONL file. Returns count written."""
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
    return count


# ── Hermes ShareGPT shape ────────────────────────────────────────
# See hermes-agent/agent/trajectory.py:30 — sharegpt format
HERMES_VALID_FROM = {"system", "human", "user", "gpt", "assistant", "tool"}

def _sharegpt_to_instruction_io(entry: dict) -> dict | None:
    """Convert one Hermes ShareGPT trajectory record to POG2 instruction/io.

    Mapping:
      system + first human  → instruction (system prompt folded into instruction)
      next human            → input
      first assistant       → output
    Other roles (tool, additional humans) are dropped — POG2's pedagogy
    format is single-turn instruction-tuned, not multi-turn agentic.

    Returns None if the record lacks a usable human/assistant pair.
    """
    convs = entry.get("conversations")
    if not isinstance(convs, list) or len(convs) < 2:
        return None

    system_text = ""
    human_text = ""
    assistant_text = ""
    input_text = ""

    for turn in convs:
        if not isinstance(turn, dict):
            continue
        role = turn.get("from", "")
        value = turn.get("value", "")
        if not isinstance(value, str):
            value = str(value)

        if role in ("system",) and not system_text:
            system_text = value
        elif role in ("human", "user"):
            if not human_text:
                human_text = value
            else:
                # Subsequent human turns become input (rare; usually multi-turn)
                input_text = value
        elif role in ("gpt", "assistant"):
            assistant_text = value
            break  # take the first assistant response

    if not human_text or not assistant_text:
        return None

    if system_text:
        instruction = f"{system_text}\n\n{human_text}"
    else:
        instruction = human_text

    rec = {"instruction": instruction, "output": assistant_text}
    if input_text:
        rec["input"] = input_text
    return rec


def cmd_hermes_to_pog2(args: argparse.Namespace) -> int:
    """Convert Hermes ShareGPT → POG2 instruction/io corpus."""
    input_path = Path(args.input)
    output_path = Path(args.output) if args.output else DEFAULT_CORPUS_PATH

    if not input_path.exists():
        logger.error("Input file not found: %s", input_path)
        return 1

    logger.info("Reading ShareGPT trajectories from %s", input_path)

    def gen():
        for entry in _iter_jsonl(input_path):
            converted = _sharegpt_to_instruction_io(entry)
            if converted is None:
                logger.debug("Skipping entry without human/assistant pair")
                continue
            # Preserve the model so GhostTrainingLimb can later use it for provenance
            if "model" in entry:
                converted["_source_model"] = entry["model"]
            yield converted

    written = _write_jsonl(output_path, gen())
    logger.info("Wrote %d instruction/io pairs to %s", written, output_path)
    if written > 0:
        print(f"wrote {written} pairs to {output_path}")
    return 0


# ── POG2 TrainingCollector shape ─────────────────────────────────
# See src/utils/TrainingCollector.ts:30 (InteractionRecord).
# Records are stored at training/{interactions,history,fprag}/*.jsonl

def _pog2_interaction_to_sharegpt(entry: dict) -> dict | None:
    """Convert a POG2 InteractionRecord to Hermes ShareGPT."""
    prompt = entry.get("prompt")
    response = entry.get("response")
    if not isinstance(prompt, str) or not isinstance(response, str):
        return None

    conversations = [
        {"from": "human", "value": prompt},
        {"from": "gpt", "value": response},
    ]
    out = {
        "conversations": conversations,
        "model": entry.get("model", "unknown"),
        "completed": bool(entry.get("success", True)),
    }
    if "timestamp" in entry:
        out["timestamp"] = entry["timestamp"]
    if "category" in entry:
        out["category"] = entry["category"]
    return out


def _pog2_history_to_sharegpt(entry: dict) -> dict | None:
    """Convert a POG2 session-history event into a ShareGPT record if it has
    prompt/response-shaped metadata. Most history events don't — this returns
    None for them and the caller logs a skip."""
    meta = entry.get("metadata")
    if not isinstance(meta, dict):
        return None
    prompt = meta.get("prompt")
    response = meta.get("response")
    if not isinstance(prompt, str) or not isinstance(response, str):
        return None
    return _pog2_interaction_to_sharegpt({
        "prompt": prompt,
        "response": response,
        "model": meta.get("model", "unknown"),
        "success": entry.get("event") != "error",
        "category": meta.get("category"),
        "timestamp": entry.get("timestamp"),
    })


def cmd_pog2_to_hermes(args: argparse.Namespace) -> int:
    """Convert POG2 training/{interactions,history}/*.jsonl → Hermes ShareGPT."""
    input_dir = Path(args.input)
    output_path = Path(args.output) if args.output else Path("trajectories_pog2.jsonl")

    if not input_dir.exists():
        logger.error("Input dir not found: %s", input_dir)
        return 1

    files = sorted(input_dir.rglob("*.jsonl"))
    if not files:
        logger.warning("No .jsonl files under %s", input_dir)
        print("no .jsonl files found")
        return 0

    logger.info("Scanning %d JSONL files under %s", len(files), input_dir)

    def gen():
        seen = 0
        skipped = 0
        for fp in files:
            for entry in _iter_jsonl(fp):
                # Distinguish record types by the keys present
                if "conversations" in entry:
                    # Already ShareGPT-shaped (rare; pass through)
                    yield entry
                    seen += 1
                elif "prompt" in entry and "response" in entry:
                    sg = _pog2_interaction_to_sharegpt(entry)
                    if sg is not None:
                        yield sg
                        seen += 1
                    else:
                        skipped += 1
                elif "metadata" in entry:
                    sg = _pog2_history_to_sharegpt(entry)
                    if sg is not None:
                        yield sg
                        seen += 1
                    else:
                        skipped += 1
                else:
                    skipped += 1
        logger.info("Converted %d records (%d skipped)", seen, skipped)

    written = _write_jsonl(output_path, gen())
    print(f"wrote {written} ShareGPT records to {output_path}")
    return 0


# ── Modelfile materialization ────────────────────────────────────
# Mirrors what GhostTrainingLimb.triggerOllamaSynthesis() does at
# src/limbs/pedagogy/GhostTrainingLimb.ts:91 (the actual implementation
# uses `ollama create pog2-pedagogy -f <modelfile>`). This CLI exposes
# the same Modelfile generation for manual use.

MODelfile_TEMPLATE = """# Auto-generated by training_corpus.py materialize
# Base: {base}
# Pairs: {count}
FROM {base}

SYSTEM \"\"\"You are a POG2 Pedagogy Engine. {pair_count} verified instruction pairs inform your behavior. Reference hexagram state where appropriate. Cite entity IDs. Flag uncertainty as [UNVERIFIED].\"\"\"

# Parameters (matching .env.ollama THINK tier)
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 32768
PARAMETER stop "USER:"
"""


def cmd_materialize(args: argparse.Namespace) -> int:
    """Build a Modelfile referencing the current corpus."""
    corpus_path = DEFAULT_CORPUS_PATH
    if not corpus_path.exists():
        logger.error("Corpus not found: %s", corpus_path)
        logger.error("Run `hermes-to-pog2` first or supply a corpus path.")
        return 1

    pair_count = 0
    with corpus_path.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                pair_count += 1

    base = args.base
    output = Path(args.output) if args.output else Path("Modelfile")
    output.write_text(MODelfile_TEMPLATE.format(base=base, count=pair_count, pair_count=pair_count), encoding="utf-8")
    print(f"wrote {output} (base={base}, pairs={pair_count})")
    print(f"to build: ollama create pog2-pedagogy -f {output}")
    return 0


# ── CLI ──────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="training_corpus",
        description="Bidirectional bridge between Hermes trajectories and POG2's pedagogy corpus.",
    )
    sub = p.add_subparsers(dest="command", required=True)

    p1 = sub.add_parser("hermes-to-pog2", help="Convert Hermes ShareGPT JSONL to POG2 instruction/io corpus.")
    p1.add_argument("input", help="Path to Hermes ShareGPT JSONL (e.g. trajectories_compressed.jsonl).")
    p1.add_argument("-o", "--output", help=f"Output path (default: {DEFAULT_CORPUS_PATH}).")
    p1.set_defaults(func=cmd_hermes_to_pog2)

    p2 = sub.add_parser("pog2-to-hermes", help="Convert POG2 TrainingCollector JSONL to Hermes ShareGPT.")
    p2.add_argument("input", help=f"Path to POG2 training dir (default lookup: {DEFAULT_POG2_TRAINING_DIR}).")
    p2.add_argument("-o", "--output", help="Output path (default: trajectories_pog2.jsonl).")
    p2.set_defaults(func=cmd_pog2_to_hermes)

    p3 = sub.add_parser("materialize", help="Generate a Modelfile from the current corpus.")
    p3.add_argument("--base", default="gemma4:latest", help="Base model (default: gemma4:latest).")
    p3.add_argument("-o", "--output", help="Modelfile output path (default: ./Modelfile).")
    p3.set_defaults(func=cmd_materialize)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    log_level = os.environ.get("POG2_OVERFLOW_DEBUG", "0") == "1" and logging.DEBUG or logging.INFO
    logging.basicConfig(level=log_level, format="%(levelname)s %(name)s — %(message)s")

    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
