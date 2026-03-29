"""Main synthesis engine."""

import math
import random

import numpy as np
from scipy.io import wavfile

from .config import RuntimeConfig
from .dsp import (
    apply_envelope,
    apply_filter,
    apply_math_delay,
    pan_stereo,
)
from .synthesis import (
    clamp_frequency,
    fm_mod_index_for_note,
    generate_wave,
    PHI,
    PI,
)
from .voices import (
    build_chord_tones,
    common_rhythms,
    core_waveforms,
    get_current_root,
    PAD_HARMONICS,
    PROGRESSION_RATIOS,
    tension_waveforms,
    uncommon_rhythms,
)


class SynthEngine:
    """Main synthesis engine for generating math ambient audio."""

    def __init__(self, config: RuntimeConfig):
        self.cfg = config

    def generate(self) -> np.ndarray:
        """Generate the complete audio track."""
        pads = self._generate_breathing_pad()
        rhythms = self._generate_generative_rhythms()
        hats = self._generate_euclidean_percussion()
        kick = self._generate_snappy_kick()
        sub = self._generate_sub_bass()

        rhythms_delayed = apply_math_delay(
            rhythms,
            delay_time=(self.cfg.beat / PHI),
            sample_rate=self.cfg.sample_rate,
            feedback=0.6,
            mix=0.5,
        )
        rhythms_delayed = apply_filter(
            rhythms_delayed, cutoff=6200.0, btype="low", order=2, sample_rate=self.cfg.sample_rate
        )

        main_mix = (pads * 0.52) + (rhythms_delayed * 0.50) + hats
        main_mix = apply_filter(main_mix, cutoff=150.0, btype="high", order=4, sample_rate=self.cfg.sample_rate)
        main_mix = apply_filter(main_mix, cutoff=10000.0, btype="low", order=2, sample_rate=self.cfg.sample_rate)

        master = main_mix + kick + sub

        peak = np.max(np.abs(master))
        if peak > 0:
            master = (master / peak) * 0.95

        fade_len = min(int(self.cfg.sample_rate * 3), len(master))
        if fade_len > 0:
            fade_curve = np.linspace(1, 0, fade_len)[:, np.newaxis]
            master[-fade_len:] *= fade_curve

        return np.int16(master * 32767)

    def save(self, path: str | None = None) -> None:
        """Generate and save audio to WAV file."""
        output_path = path or self.cfg.output
        audio = self.generate()
        wavfile.write(output_path, self.cfg.sample_rate, audio)

    def _generate_breathing_pad(self) -> np.ndarray:
        """Generate stereo harmonic pads with a PHI-modulated wide filter sweep."""
        print("Synthesizing Breathing Pad Progression...")
        pad_buffer = np.zeros((self.cfg.total_samples, 2))
        section_count = len(PROGRESSION_RATIOS)
        section_duration = self.cfg.duration_seconds / section_count

        for i in range(section_count):
            start_s = int(i * section_duration * self.cfg.sample_rate)
            end_s = int((i + 1) * section_duration * self.cfg.sample_rate)
            if i == section_count - 1:
                end_s = self.cfg.total_samples
            root = self.cfg.base_freq * PROGRESSION_RATIOS[i]
            block_len = end_s - start_s
            block_duration = block_len / self.cfg.sample_rate
            block_pad = np.zeros((block_len, 2))

            for ratio in PAD_HARMONICS:
                freq = root * ratio
                w_l = generate_wave(freq * 0.995, block_duration, "sawtooth", self.cfg.sample_rate) * 0.3
                w_l += generate_wave(freq, block_duration, "sine", self.cfg.sample_rate) * 0.7
                w_r = generate_wave(freq * 1.005, block_duration, "sawtooth", self.cfg.sample_rate) * 0.3
                w_r += generate_wave(freq, block_duration, "sine", self.cfg.sample_rate) * 0.7
                block_pad[:, 0] += apply_envelope(w_l, self.cfg.sample_rate, block_duration, 0.2, 0.2)
                block_pad[:, 1] += apply_envelope(w_r, self.cfg.sample_rate, block_duration, 0.2, 0.2)

            pad_buffer[start_s:end_s] += block_pad

        t_full = np.linspace(0, self.cfg.duration_seconds, len(pad_buffer), False)
        lfo_speed = 0.1 + 0.05 * np.sin(2 * PI * (0.1 / PHI) * t_full)
        phase = np.cumsum(lfo_speed) / self.cfg.sample_rate
        lfo = ((np.sin(2 * PI * phase) + 1) / 2)[:, np.newaxis]

        pad_dark = apply_filter(pad_buffer, 600.0, "low", 2, self.cfg.sample_rate)
        pad_bright = apply_filter(pad_buffer, 10000.0, "low", 2, self.cfg.sample_rate)
        return pad_dark * (1 - lfo) + pad_bright * lfo

    def _generate_snappy_kick(self) -> np.ndarray:
        """Synthesize a snappy bass drum with pitch and amplitude envelopes."""
        print("Synthesizing Snappy Kick Drum...")
        kick_buffer = np.zeros((self.cfg.total_samples, 2))
        step_time = self.cfg.beat
        steps = int(self.cfg.duration_seconds / step_time)

        for i in range(steps):
            duration = 0.4
            t = np.linspace(0, duration, int(self.cfg.sample_rate * duration), False)
            freq_env = 40 + 110 * np.exp(-45 * t)
            phase = np.cumsum(freq_env) / self.cfg.sample_rate
            kick_mono = np.sin(2 * PI * phase)
            kick_mono *= np.exp(-12 * t)
            kick_mono += np.random.normal(0, 0.4, len(t)) * np.exp(-400 * t)

            start_s = int(i * step_time * self.cfg.sample_rate)
            end_s = start_s + len(kick_mono)
            if end_s < len(kick_buffer):
                kick_buffer[start_s:end_s] += pan_stereo(kick_mono, 0.0) * 0.85
        return kick_buffer

    def _generate_euclidean_percussion(self) -> np.ndarray:
        """Generate hi-hat noise using a Euclidean rhythm."""
        print("Synthesizing Euclidean Percussion...")
        perc_buffer = np.zeros((self.cfg.total_samples, 2))
        step_time = self.cfg.beat / 4
        steps = int(self.cfg.duration_seconds / step_time)
        pattern = [1 if (i * 5) % 16 < 5 else 0 for i in range(steps)]

        for i, hit in enumerate(pattern):
            if not hit:
                continue
            noise = np.random.normal(0, 0.3, int(self.cfg.sample_rate * 0.1))
            decay = np.exp(-np.linspace(0, 15, len(noise)))
            hat_mono = apply_filter(noise * decay, 6000.0, "high", 2, self.cfg.sample_rate)

            start_s = int(i * step_time * self.cfg.sample_rate)
            end_s = start_s + len(hat_mono)
            if end_s < len(perc_buffer):
                pan = random.uniform(-0.5, 0.5)
                perc_buffer[start_s:end_s] += pan_stereo(hat_mono, pan) * 0.18
        return perc_buffer

    def _generate_generative_rhythms(self) -> np.ndarray:
        """Mathematically driven, consonant polyphonic melody generator."""
        print("Synthesizing Consonant Generative Polyphony...")
        rhythm_buffer = np.zeros((self.cfg.total_samples, 2))
        current_time = 0.0

        while current_time < self.cfg.duration_seconds - 2.0:
            root = get_current_root(current_time, self.cfg.duration_seconds, self.cfg.base_freq)
            step_size = random.choice(common_rhythms(self.cfg.beat)) if random.random() < 0.78 else random.choice(
                uncommon_rhythms(self.cfg.beat)
            )
            duration = step_size * random.choice([1, PHI, PHI**2])

            chord = build_chord_tones(root)

            pan_position = random.uniform(-0.8, 0.8)
            for freq, is_tension in chord:
                note_duration = duration * (0.62 if is_tension else 1.0)
                note_duration = max(0.08, note_duration)

                wave_type = random.choice(tension_waveforms() if is_tension else core_waveforms())
                mod_index = fm_mod_index_for_note(freq, is_tension)
                raw_wave = generate_wave(freq, note_duration, wave_type, self.cfg.sample_rate, mod_index=mod_index)
                env_wave = apply_envelope(
                    raw_wave,
                    self.cfg.sample_rate,
                    note_duration,
                    attack_pct=0.008 if is_tension else 0.01,
                    release_pct=0.22 if is_tension else 0.32,
                )
                stereo_wave = pan_stereo(env_wave, pan_position * (0.7 if is_tension else 1.0))

                start_sample = int(current_time * self.cfg.sample_rate)
                end_sample = start_sample + len(env_wave)
                if end_sample < len(rhythm_buffer):
                    rhythm_buffer[start_sample:end_sample] += stereo_wave * (0.26 if is_tension else 0.42)
            current_time += step_size
        return rhythm_buffer

    def _generate_sub_bass(self) -> np.ndarray:
        """Generate mono-centered sub bass following the progression."""
        print("Synthesizing Sub-Bass Progression...")
        sub_buffer = np.zeros((self.cfg.total_samples, 2))
        section_count = len(PROGRESSION_RATIOS)
        section_duration = self.cfg.duration_seconds / section_count
        for i in range(section_count):
            start_s = int(i * section_duration * self.cfg.sample_rate)
            end_s = int((i + 1) * section_duration * self.cfg.sample_rate)
            if i == section_count - 1:
                end_s = self.cfg.total_samples
            block_duration = (end_s - start_s) / self.cfg.sample_rate
            root = (self.cfg.base_freq * PROGRESSION_RATIOS[i]) / 2

            sub_mono = generate_wave(root, block_duration, "sine", self.cfg.sample_rate)
            sub_mono = apply_envelope(sub_mono, self.cfg.sample_rate, block_duration, 0.1, 0.1)
            sub_buffer[start_s:end_s] += pan_stereo(sub_mono * 0.65, 0.0)
        return sub_buffer
