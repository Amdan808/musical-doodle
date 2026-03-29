"""Waveform synthesis and FM synthesis."""

import math

import numpy as np

PHI = (1 + math.sqrt(5)) / 2
PI = math.pi


def generate_wave(
    freq: float,
    duration: float,
    wave_type: str,
    sample_rate: int,
    mod_index: float = 2.0,
) -> np.ndarray:
    """Generate pure waves and FM synthesis bells."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    if wave_type == "fm_glass":
        modulator = np.sin(2 * PI * (freq * PHI) * t) * mod_index
        return np.sin(2 * PI * freq * t + modulator)
    if wave_type == "fm_bell":
        modulator = np.sin(2 * PI * (freq * 1.5) * t) * (mod_index * np.linspace(1, 0, len(t)))
        return np.sin(2 * PI * freq * t + modulator)
    if wave_type == "sine":
        return np.sin(2 * PI * freq * t)
    if wave_type == "triangle":
        return 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
    if wave_type == "sawtooth":
        return 2 * (t * freq - np.floor(t * freq + 0.5)) * 0.5
    raise ValueError(f"Unknown wave_type: {wave_type}")


def clamp_frequency(freq: float, low: float = 55.0, high: float = 1760.0) -> float:
    """Fold a frequency into a musically useful register."""
    while freq < low:
        freq *= 2.0
    while freq > high:
        freq /= 2.0
    return freq


def fm_mod_index_for_note(freq: float, is_tension: bool) -> float:
    """Compute a tamed FM index, scaled by register and tension role."""
    base = np.random.uniform(0.45, 1.35)
    if freq < 220.0:
        register_scale = 0.85
    elif freq < 440.0:
        register_scale = 0.65
    else:
        register_scale = 0.50
    if is_tension:
        register_scale *= 0.55
    return max(0.25, base * register_scale)
