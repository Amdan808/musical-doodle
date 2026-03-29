"""Configuration for the synthesis engine."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RuntimeConfig:
    """Runtime configuration for audio synthesis."""

    sample_rate: int
    duration_seconds: float
    base_freq: float
    bpm: float
    output: str
    seed: int | None

    @property
    def beat(self) -> float:
        """Beat duration in seconds."""
        return 60.0 / self.bpm

    @property
    def total_samples(self) -> int:
        """Total number of audio samples."""
        return int(self.sample_rate * self.duration_seconds)
