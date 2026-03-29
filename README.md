# Ratio Engine (Musical Doodle)

Interactive math-inspired synthesis experiments in Web Audio + Python.

## Showcase

![Ratio Engine UI](assets/ratio-engine-ui.png)

## What this project includes

- Browser synth playground: `index.html`
- Python synthesis engine: `chaos-musical.py` + `src/`
- Extra generators: `5.3-codex.py`, `gem-3.py`

## Browser synth highlights

- 4 harmony oscillators with per-oscillator level controls
- Master + 6 analysis scopes (4 harmony, kick, hi-hat)
- Brown/white/pink noise with level and ON/OFF control
- Music ON/OFF and Noise ON/OFF toggles
- Shortcut keys: `M` = music toggle, `N` = noise toggle
- Auto hi-hat pattern switching every 8 bars
- Persistent UI settings via `localStorage`

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
python3 chaos-musical.py --seed 42 --duration 32 --bpm 110 --output quadratonic_math_ambient.wav
python3 5.3-codex.py --seed 42 --duration 30 --bpm 96 --output ratio_rhythm_music.wav
python3 gem-3.py
```

## Next session TODO

- Improve typography
- Adjust colors to match standard contrast while keeping aesthetics
- Option to randomize kick pattern
- Option to mute kick or add kick level slider
