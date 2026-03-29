#!/usr/bin/env python3
"""Generate polished quadratonic math ambient audio.

This is the CLI entry point for the musical doodle synthesis engine.
For programmatic usage, import SynthEngine from src.
"""

import argparse
import math
import random

import numpy as np

from src.config import RuntimeConfig
from src.engine import SynthEngine

DEFAULT_SAMPLE_RATE = 44100
DEFAULT_DURATION_SECONDS = 32.0
DEFAULT_BASE_FREQ = 110.0
DEFAULT_BPM = 110.0
DEFAULT_OUTPUT = "quadratonic_math_ambient.wav"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate polished quadratonic math ambient audio.")
    parser.add_argument("--seed", type=int, default=None, help="Seed for reproducible randomness.")
    parser.add_argument(
        "--duration",
        type=float,
        default=DEFAULT_DURATION_SECONDS,
        help=f"Track duration in seconds (default: {DEFAULT_DURATION_SECONDS}).",
    )
    parser.add_argument(
        "--bpm",
        type=float,
        default=DEFAULT_BPM,
        help=f"Tempo in BPM (default: {DEFAULT_BPM}).",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"Output WAV path (default: {DEFAULT_OUTPUT}).",
    )
    return parser.parse_args()


def build_config_from_args(args: argparse.Namespace) -> RuntimeConfig:
    if args.duration <= 0:
        raise ValueError("--duration must be > 0")
    if args.bpm <= 0:
        raise ValueError("--bpm must be > 0")
    return RuntimeConfig(
        sample_rate=DEFAULT_SAMPLE_RATE,
        duration_seconds=args.duration,
        base_freq=DEFAULT_BASE_FREQ,
        bpm=args.bpm,
        output=args.output,
        seed=args.seed,
    )


def main() -> None:
    args = parse_args()
    cfg = build_config_from_args(args)

    if cfg.seed is not None:
        random.seed(cfg.seed)
        np.random.seed(cfg.seed % (2**32 - 1))

    engine = SynthEngine(cfg)
    engine.save()
    print(f"Done! Saved as '{cfg.output}' (seed={cfg.seed})")


if __name__ == "__main__":
    main()
