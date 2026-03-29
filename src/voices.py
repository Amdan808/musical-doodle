"""Voice definitions and chord building."""

import math
import random
from typing import Iterator

import numpy as np

PHI = (1 + math.sqrt(5)) / 2

CONSONANT_RATIOS = [1 / 1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8]
CONTROLLED_TENSION_RATIOS = [16 / 15, 7 / 6, 45 / 32]
TENSION_PROBABILITY = 0.08
PAD_HARMONICS = [1 / 1, 5 / 4, 3 / 2, 2 / 1]
PROGRESSION_RATIOS = [1 / 1, 9 / 8, 4 / 3, 5 / 3]


def get_current_root(time_sec: float, duration_seconds: float, base_freq: float) -> float:
    """Determine the current root note of the progression."""
    block = int(time_sec / (duration_seconds / len(PROGRESSION_RATIOS))) % len(PROGRESSION_RATIOS)
    return base_freq * PROGRESSION_RATIOS[block]


def build_chord_tones(root: float) -> list[tuple[float, bool]]:
    """Build mostly consonant tones with rare controlled tension and spacing guards."""
    target_voices = random.randint(2, 4)
    tones = [(root * 2.0, False)]
    attempts = 0

    while len(tones) < target_voices and attempts < 28:
        is_tension = random.random() < TENSION_PROBABILITY
        ratio_pool = CONTROLLED_TENSION_RATIOS if is_tension else CONSONANT_RATIOS
        ratio = random.choice(ratio_pool)
        octave = random.choice([1.0, 2.0, 2.0, 3.0])
        freq = root * ratio * octave

        while freq < 90.0:
            freq *= 2.0
        while freq > 1800.0:
            freq /= 2.0

        if any(abs(math.log2(freq / existing_freq)) < 0.13 for existing_freq, _ in tones):
            attempts += 1
            continue

        tones.append((freq, is_tension))
        attempts += 1

    return tones


def common_rhythms(beat: float) -> list[float]:
    """Common rhythmic values."""
    return [beat, beat / 2, beat / 4]


def uncommon_rhythms(beat: float, phi: float = PHI) -> list[float]:
    """Uncommon rhythmic values based on mathematical constants."""
    return [beat / phi, beat / 3, beat / 5]


def core_waveforms() -> list[str]:
    """Primary waveform types for melodic voices."""
    return ["fm_glass", "fm_bell", "triangle", "sine", "sine"]


def tension_waveforms() -> list[str]:
    """Waveform types for tension notes."""
    return ["sine", "triangle", "fm_bell"]
