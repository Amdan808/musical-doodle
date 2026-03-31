# Ratio Engine (Musical Doodle)

Interactive math-inspired synthesis experiments in Web Audio + Python.

## Showcase

![Ratio Engine UI](assets/ratio-engine-ui.png)

## What this project includes

- Browser synth playground: `index.html`
- Standalone Python generator: `scripts/ratio_rhythm_music.py`

## Browser synth highlights

- 4 harmony oscillators with per-oscillator level controls
- Master + 6 analysis scopes (4 harmony, kick, hi-hat)
- Brown/white/pink noise with level and ON/OFF control
- Music ON/OFF and Noise ON/OFF toggles
- Mood Presets templates (Night Drive, Deep Focus, Warm Bloom, Aurora Mist)
- Shortcut keys: `M` = music toggle, `K` = kick toggle, `N` = noise toggle
- Auto hi-hat pattern switching every 8 bars
- Persistent UI settings via `localStorage`

## Mood Presets

Use the `MOOD PRESET` selector in the control row to instantly apply a full template for composition and mix behavior.

- `Night Drive`: faster, darker, punchier.
- `Deep Focus`: minimal, low-noise, steady.
- `Warm Bloom`: softer and more spacious.
- `Aurora Mist`: airy, slow, ambient.
- `Custom`: active when you manually tweak controls after loading a preset.

Preset choice and all related settings are persisted to `localStorage`.

## Quick start

### Run browser synth

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

### Python setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install numpy scipy
```

### Generate audio (Python)

```bash
python3 scripts/ratio_rhythm_music.py --seed 42 --duration 30 --bpm 96 --output ratio_rhythm_music.wav
```

## Next session TODO

- Improve typography
- Adjust colors to match standard contrast while keeping aesthetics
- Option to randomize kick pattern
- Option to mute kick or add kick level slider
