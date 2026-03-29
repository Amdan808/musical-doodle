#!/usr/bin/env python3
"""Generate ratio-driven polyphonic music with rhythmic math and export as WAV."""

from __future__ import annotations

import argparse
import math
import random
import wave
from array import array
from dataclasses import dataclass
from pathlib import Path

GOLDEN_RATIO = (1.0 + math.sqrt(5.0)) / 2.0
WAVEFORMS = ("sine", "triangle", "saw", "square")

SIMPLE_RATIOS = (
    1.0,
    16.0 / 15.0,
    9.0 / 8.0,
    6.0 / 5.0,
    5.0 / 4.0,
    4.0 / 3.0,
    3.0 / 2.0,
    5.0 / 3.0,
    15.0 / 8.0,
    2.0,
)

ODD_RATIOS = (
    7.0 / 6.0,
    11.0 / 8.0,
    13.0 / 8.0,
    17.0 / 16.0,
    19.0 / 16.0,
)

COMMON_PATTERNS = ((4, 16), (5, 16), (3, 8), (7, 16))
UNCOMMON_PATTERNS = ((5, 13), (7, 19), (11, 23))

COMMON_DURATIONS = (0.5, 0.75, 1.0, 1.25)
UNCOMMON_DURATIONS = (1.0 / GOLDEN_RATIO, GOLDEN_RATIO / 2.0, GOLDEN_RATIO, 1.5)

HARMONY_SETS = (
    (1.0, 5.0 / 4.0, 3.0 / 2.0),
    (1.0, 6.0 / 5.0, 3.0 / 2.0),
    (1.0, 4.0 / 3.0, 2.0),
    (1.0, 1.0, 3.0 / 2.0),  # unison-inclusive voicing
    (1.0, 5.0 / 4.0, 2.0),
)


@dataclass
class NoteEvent:
    start: float
    duration: float
    frequency: float
    waveform: str
    harmony: tuple[float, ...]
    velocity: float


def euclidean_pattern(pulses: int, steps: int) -> list[int]:
    if steps <= 0:
        raise ValueError("steps must be > 0")
    if pulses <= 0:
        return [0] * steps
    pulses = min(pulses, steps)
    pattern: list[int] = []
    bucket = 0
    for _ in range(steps):
        bucket += pulses
        if bucket >= steps:
            bucket -= steps
            pattern.append(1)
        else:
            pattern.append(0)
    return pattern


def clamp_frequency(freq: float, low: float = 55.0, high: float = 1760.0) -> float:
    while freq < low:
        freq *= 2.0
    while freq > high:
        freq /= 2.0
    return freq


def choose_ratio(rng: random.Random, odd_probability: float) -> float:
    if rng.random() < odd_probability:
        return rng.choice(ODD_RATIOS)
    return rng.choice(SIMPLE_RATIOS)


def choose_harmony(rng: random.Random, voices: int) -> tuple[float, ...]:
    base = list(rng.choice(HARMONY_SETS))
    if rng.random() < 0.18:
        base.insert(1, 1.0)
    extension_cycle = (3.0 / 2.0, 2.0, 5.0 / 2.0)
    i = 0
    while len(base) < voices:
        base.append(extension_cycle[i % len(extension_cycle)])
        i += 1
    return tuple(base[:voices])


def trigger_probability(common_hits: int, uncommon_hit: bool, golden_gate: bool) -> float:
    probability = 0.18 + 0.22 * common_hits
    if uncommon_hit:
        probability += 0.22
    if golden_gate:
        probability += 0.08
    return min(0.95, probability)


def generate_events(
    duration: float,
    bpm: float,
    odd_probability: float,
    uncommon_probability: float,
    voices: int,
    base_min: float,
    base_max: float,
    rng: random.Random,
) -> list[NoteEvent]:
    step_seconds = 60.0 / bpm / 4.0
    total_steps = max(1, int(duration / step_seconds) + 1)

    common = [euclidean_pattern(p, s) for (p, s) in COMMON_PATTERNS]
    uncommon = [euclidean_pattern(p, s) for (p, s) in UNCOMMON_PATTERNS]

    events: list[NoteEvent] = []
    event_index = 0
    base_frequency = rng.uniform(base_min, base_max)
    active_uncommon: list[list[int]] = []

    for step in range(total_steps):
        start = step * step_seconds
        if start >= duration:
            break

        if step % 16 == 0:
            active_uncommon = [p for p in uncommon if rng.random() < uncommon_probability]

        common_hits = sum(pattern[step % len(pattern)] for pattern in common)
        uncommon_hit = any(pattern[step % len(pattern)] for pattern in active_uncommon)
        golden_gate = ((step * GOLDEN_RATIO) % 1.0) < 0.618

        if common_hits == 0 and not uncommon_hit:
            continue
        if rng.random() > trigger_probability(common_hits, uncommon_hit, golden_gate):
            continue

        ratio_1 = choose_ratio(rng, odd_probability)
        ratio_2 = choose_ratio(rng, odd_probability * (1.25 if uncommon_hit else 0.80))
        combined_ratio = (ratio_1 + ratio_2) / 2.0

        section_shape = math.sin((2.0 * math.pi * start) / max(1e-6, duration / GOLDEN_RATIO))
        local_base = base_frequency * (GOLDEN_RATIO ** (0.10 * section_shape))
        frequency = clamp_frequency(local_base * combined_ratio)

        duration_pool = UNCOMMON_DURATIONS if (uncommon_hit or rng.random() < 0.20) else COMMON_DURATIONS
        duration_scalar = rng.choice(duration_pool) * (GOLDEN_RATIO ** rng.uniform(-0.20, 0.20))
        note_duration = step_seconds * duration_scalar * (1.0 + 0.15 * common_hits)
        note_duration = max(0.06, min(note_duration, 2.5 * (60.0 / bpm)))

        waveform = WAVEFORMS[event_index % len(WAVEFORMS)]
        harmony = choose_harmony(rng, voices)
        velocity = min(1.0, 0.55 + 0.10 * common_hits + (0.12 if uncommon_hit else 0.0))

        events.append(
            NoteEvent(
                start=start,
                duration=note_duration,
                frequency=frequency,
                waveform=waveform,
                harmony=harmony,
                velocity=velocity,
            )
        )
        event_index += 1

    return events


def waveform_sample(waveform: str, phase: float) -> float:
    if waveform == "sine":
        return math.sin(2.0 * math.pi * phase)
    if waveform == "triangle":
        if phase < 0.25:
            return phase * 4.0
        if phase < 0.75:
            return 2.0 - phase * 4.0
        return phase * 4.0 - 4.0
    if waveform == "saw":
        return 2.0 * phase - 1.0
    if waveform == "square":
        return 1.0 if phase < 0.5 else -1.0
    raise ValueError(f"Unsupported waveform: {waveform}")


def add_note(
    buffer: list[float],
    start_index: int,
    sample_count: int,
    frequency: float,
    waveform: str,
    amplitude: float,
    sample_rate: int,
) -> None:
    if sample_count <= 0:
        return
    attack = max(1, int(0.008 * sample_rate))
    release = max(1, int(0.035 * sample_rate))
    last_index = min(len(buffer), start_index + sample_count)

    for absolute_idx in range(start_index, last_index):
        i = absolute_idx - start_index
        phase = ((i * frequency) / sample_rate) % 1.0
        sample = waveform_sample(waveform, phase)
        if i < attack:
            env = i / attack
        elif i >= sample_count - release:
            env = max(0.0, (sample_count - i) / release)
        else:
            env = 1.0
        buffer[absolute_idx] += sample * env * amplitude


def render_audio(events: list[NoteEvent], duration: float, sample_rate: int) -> array:
    total_samples = max(1, int(duration * sample_rate))
    buffer = [0.0] * total_samples

    for event in events:
        start_index = int(event.start * sample_rate)
        sample_count = int(event.duration * sample_rate)
        voice_count = max(1, len(event.harmony))

        for voice_idx, interval in enumerate(event.harmony):
            frequency = clamp_frequency(event.frequency * interval)
            waveform = WAVEFORMS[(WAVEFORMS.index(event.waveform) + voice_idx) % len(WAVEFORMS)]
            amplitude = (0.24 / voice_count) * event.velocity / (1.0 + 0.25 * voice_idx)
            add_note(
                buffer=buffer,
                start_index=start_index,
                sample_count=sample_count,
                frequency=frequency,
                waveform=waveform,
                amplitude=amplitude,
                sample_rate=sample_rate,
            )

    peak = max((abs(sample) for sample in buffer), default=0.0)
    scale = 0.0 if peak == 0.0 else 0.95 / peak
    return array(
        "h",
        (int(max(-1.0, min(1.0, sample * scale)) * 32767.0) for sample in buffer),
    )


def write_wav(path: Path, pcm_samples: array, sample_rate: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_samples.tobytes())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate ratio-based, golden-rhythm polyphonic music with alternating waveforms."
        )
    )
    parser.add_argument("--output", default="ratio_rhythm_music.wav", help="Output WAV path.")
    parser.add_argument("--duration", type=float, default=30.0, help="Track duration in seconds.")
    parser.add_argument("--bpm", type=float, default=96.0, help="Tempo in beats per minute.")
    parser.add_argument("--sample-rate", type=int, default=44100, help="Audio sample rate.")
    parser.add_argument("--voices", type=int, default=3, help="Voices per triggered event.")
    parser.add_argument(
        "--odd-probability",
        type=float,
        default=0.12,
        help="Probability of selecting an odd ratio per ratio draw.",
    )
    parser.add_argument(
        "--uncommon-probability",
        type=float,
        default=0.30,
        help="Probability each uncommon rhythm pattern is active per bar.",
    )
    parser.add_argument(
        "--base-min",
        type=float,
        default=110.0,
        help="Minimum base frequency before ratio transformations.",
    )
    parser.add_argument(
        "--base-max",
        type=float,
        default=220.0,
        help="Maximum base frequency before ratio transformations.",
    )
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.duration <= 0:
        raise ValueError("--duration must be > 0")
    if args.bpm <= 0:
        raise ValueError("--bpm must be > 0")
    if args.sample_rate <= 2000:
        raise ValueError("--sample-rate must be > 2000")
    if args.voices <= 0:
        raise ValueError("--voices must be > 0")
    if not (0.0 <= args.odd_probability <= 1.0):
        raise ValueError("--odd-probability must be in [0, 1]")
    if not (0.0 <= args.uncommon_probability <= 1.0):
        raise ValueError("--uncommon-probability must be in [0, 1]")
    if args.base_min <= 0 or args.base_max <= 0 or args.base_min > args.base_max:
        raise ValueError("Expected 0 < --base-min <= --base-max")

    rng = random.Random(args.seed)
    events = generate_events(
        duration=args.duration,
        bpm=args.bpm,
        odd_probability=args.odd_probability,
        uncommon_probability=args.uncommon_probability,
        voices=args.voices,
        base_min=args.base_min,
        base_max=args.base_max,
        rng=rng,
    )
    if not events:
        raise RuntimeError("No note events were generated; adjust tempo/duration/probabilities.")

    output_path = Path(args.output).expanduser()
    pcm = render_audio(events, args.duration, args.sample_rate)
    write_wav(output_path, pcm, args.sample_rate)

    print(f"Wrote {output_path} ({len(events)} events, {args.duration:.2f}s, seed={args.seed})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
