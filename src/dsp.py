"""Digital Signal Processing utilities."""

import math

import numpy as np
from scipy.signal import butter, sosfilt


def apply_filter(data: np.ndarray, cutoff: float, btype: str, order: int, sample_rate: int) -> np.ndarray:
    """Apply a Butterworth filter to mono (1D) or stereo (2D) arrays."""
    nyquist = 0.5 * sample_rate
    if cutoff <= 0 or cutoff >= nyquist:
        raise ValueError(f"cutoff must be between 0 and Nyquist ({nyquist:.1f})")
    sos = butter(order, cutoff / nyquist, btype=btype, output="sos")
    return sosfilt(sos, data, axis=0)


def apply_envelope(
    signal: np.ndarray,
    sample_rate: int,
    duration: float,
    attack_pct: float = 0.05,
    release_pct: float = 0.4,
) -> np.ndarray:
    """Apply a quadratic ADSR-style envelope."""
    length = len(signal)
    attack_len = int(sample_rate * min(duration * attack_pct, 2.0))
    release_len = int(sample_rate * min(duration * release_pct, 4.0))

    attack = np.linspace(0, 1, attack_len) ** 2
    release = np.linspace(1, 0, release_len) ** 2
    sustain_len = length - attack_len - release_len

    if sustain_len < 0:
        return signal * np.hanning(length)
    sustain = np.ones(sustain_len)
    return signal * np.concatenate([attack, sustain, release])


def pan_stereo(mono_signal: np.ndarray, pan_val: float) -> np.ndarray:
    """Constant-power stereo panning. pan_val: -1.0 (L) to 1.0 (R)."""
    if mono_signal.ndim != 1:
        raise ValueError("pan_stereo expects a mono (1D) signal")
    p = (pan_val + 1.0) / 2.0
    left_gain = math.cos(p * math.pi / 2.0)
    right_gain = math.sin(p * math.pi / 2.0)
    stereo = np.zeros((len(mono_signal), 2))
    stereo[:, 0] = mono_signal * left_gain
    stereo[:, 1] = mono_signal * right_gain
    return stereo


def apply_math_delay(
    signal: np.ndarray,
    delay_time: float,
    sample_rate: int,
    feedback: float = 0.5,
    mix: float = 0.4,
    echoes: int = 6,
) -> np.ndarray:
    """Vectorized delay for cascading echoes."""
    delay_samples = int(sample_rate * delay_time)
    wet_signal = np.zeros_like(signal)
    for i in range(1, echoes + 1):
        shift = delay_samples * i
        if shift >= len(signal):
            break
        wet_signal[shift:] += signal[:-shift] * (feedback**i)
    return signal * (1 - mix) + wet_signal * mix
