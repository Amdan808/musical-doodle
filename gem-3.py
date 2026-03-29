import numpy as np
import random
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
import math

# --- CONFIGURATION ---
SAMPLE_RATE = 44100
DURATION_SECONDS = 30
BASE_FREQ = 220.0  # A3 (Base frequency)
SUB_FREQ = BASE_FREQ / 4  # 55Hz (A1) Root for the sub-bass
PHI = (1 + math.sqrt(5)) / 2  # The Golden Ratio
PI = math.pi

# --- MATHEMATICAL RATIOS ---
SIMPLE_RATIOS = [1/1, 5/4, 4/3, 3/2, 8/5, 2/1, 5/3, 9/8]
ODD_RATIOS = [7/5, 11/8, PHI, PI/2, math.e / 2]
# Harmonic ratios specific to the sustained pad
PAD_HARMONICS = [1/1, 5/4, 3/2, 2/1] # Root, Maj 3rd, Perf 5th, Octave

# --- DSP / FILTER FUNCTIONS ---
def apply_filter(data, cutoff, fs, btype, order):
    """Applies a Butterworth filter using Second-Order Sections (SOS) for stability."""
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    # btype can be 'low' or 'high'
    sos = butter(order, normal_cutoff, btype=btype, analog=False, output='sos')
    return sosfilt(sos, data)

def apply_envelope(signal, duration, attack_pct=0.05, release_pct=0.4):
    """Applies an Attack-Decay-Sustain-Release (ADSR) curve."""
    length = len(signal)
    attack_len = int(SAMPLE_RATE * min(duration * attack_pct, 2.0))
    release_len = int(SAMPLE_RATE * min(duration * release_pct, 4.0))
    
    # Quadratic curves for natural sound
    attack = np.linspace(0, 1, attack_len) ** 2  
    release = np.linspace(1, 0, release_len) ** 2 
    sustain_len = length - attack_len - release_len
    
    if sustain_len < 0:
        return signal * np.hanning(length)
        
    sustain = np.ones(sustain_len)
    envelope = np.concatenate([attack, sustain, release])
    return signal * envelope

def generate_wave(freq, duration, wave_type):
    """Generates a mathematical waveform."""
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    
    if wave_type == 'sine':
        sig = np.sin(2 * PI * freq * t)
    elif wave_type == 'square':
        sig = np.sign(np.sin(2 * PI * freq * t)) * 0.5
    elif wave_type == 'triangle':
        sig = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
    elif wave_type == 'sawtooth':
        sig = 2 * (t * freq - np.floor(t * freq + 0.5)) * 0.5
    else:
        sig = np.sin(2 * PI * freq * t)
        
    return sig

# --- GENERATOR FUNCTIONS ---
def generate_sustained_pad():
    """Generates a continuous polyphonic pad using harmonic ratios from root."""
    print("Synthesizing Sustained Harmonic Pad...")
    pad_buffer = np.zeros(SAMPLE_RATE * DURATION_SECONDS)
    
    for ratio in PAD_HARMONICS:
        freq = (BASE_FREQ / 2) * ratio # Shifted down 1 octave for body
        # Mix sawtooth and sine for a lush pad sound
        wave1 = generate_wave(freq, DURATION_SECONDS, 'sawtooth') * 0.3
        wave2 = generate_wave(freq, DURATION_SECONDS, 'sine') * 0.7
        pad_buffer += (wave1 + wave2)
        
    # Apply a very slow ambient envelope to the whole pad
    return apply_envelope(pad_buffer, DURATION_SECONDS, attack_pct=0.1, release_pct=0.2)

def generate_sub_bass():
    """Generates 1 single Sine or Square sub-bass to anchor the root."""
    print("Synthesizing Sub-Bass...")
    wave_type = random.choice(['sine', 'square'])
    
    sub = generate_wave(SUB_FREQ, DURATION_SECONDS, wave_type)
    
    # If square was chosen, round it off slightly so it acts strictly as sub
    if wave_type == 'square':
        sub = apply_filter(sub, 250, SAMPLE_RATE, 'low', order=2)
        
    return apply_envelope(sub * 0.8, DURATION_SECONDS, attack_pct=0.1, release_pct=0.2)

def get_rhythmic_frequencies(num_voices, odd_probability=0.15):
    """Calculates generative frequencies."""
    freqs = []
    for _ in range(num_voices):
        ratio = random.choice(ODD_RATIOS) if random.random() < odd_probability else random.choice(SIMPLE_RATIOS)
        octave_multiplier = random.choice([0.5, 1, 1, 2]) 
        freqs.append(BASE_FREQ * ratio * octave_multiplier)
    
    if random.random() < 0.4:
        freqs[0] = BASE_FREQ 
    return freqs

def generate_composition():
    total_samples = SAMPLE_RATE * DURATION_SECONDS
    rhythm_buffer = np.zeros(total_samples)
    
    bpm = 110
    beat = 60.0 / bpm
    common_rhythms = [beat, beat/2, beat/4]
    uncommon_rhythms = [beat/PHI, beat/3, beat/5]
    
    current_time = 0.0
    
    print("Synthesizing Generative Rhythms...")
    while current_time < DURATION_SECONDS - 2.0:
        if random.random() < 0.7:
            step_size = random.choice(common_rhythms)
        else:
            step_size = random.choice(uncommon_rhythms)
            
        duration = step_size * random.choice([1, PHI, PHI**2])
        num_voices = random.randint(1, 4)
        chord = get_rhythmic_frequencies(num_voices, odd_probability=0.2)
        waveforms = ['sine', 'square', 'triangle', 'sawtooth']
        
        for freq in chord:
            wave_type = random.choice(waveforms)
            raw_wave = generate_wave(freq, duration, wave_type)
            env_wave = apply_envelope(raw_wave, duration)
            
            start_sample = int(current_time * SAMPLE_RATE)
            end_sample = start_sample + len(env_wave)
            
            if end_sample < total_samples:
                rhythm_buffer[start_sample:end_sample] += env_wave
                
        current_time += step_size

    # --- MIXING AND ROUTING ---
    print("Applying Filters and Mastering...")
    
    # 1. Combine upper-frequency elements (Rhythm + Sustained Pads)
    pad_buffer = generate_sustained_pad()
    main_mix = rhythm_buffer * 0.7 + pad_buffer * 0.4
    
    # 2. Apply Filters to the main mix
    # Low pass at 4kHz (Smooth slope -> Order 2)
    main_mix = apply_filter(main_mix, cutoff=4000.0, fs=SAMPLE_RATE, btype='low', order=2)
    
    # High pass at 100Hz (Sharper slope -> Order 6)
    main_mix = apply_filter(main_mix, cutoff=100.0, fs=SAMPLE_RATE, btype='high', order=6)
    
    # 3. Generate Sub Bass (Unfiltered by the High-Pass to keep low end clean)
    sub_buffer = generate_sub_bass()
    
    # 4. Final Mixdown
    master_buffer = main_mix + sub_buffer

    # Normalize audio
    max_amp = np.max(np.abs(master_buffer))
    if max_amp > 0:
        master_buffer = (master_buffer / max_amp) * 0.9 # Peak at -1dBFS
        
    # Global fade out
    fade_len = int(SAMPLE_RATE * 2)
    master_buffer[-fade_len:] *= np.linspace(1, 0, fade_len)
    
    # Convert to 16-bit PCM
    return np.int16(master_buffer * 32767)

# Run and save
if __name__ == "__main__":
    audio = generate_composition()
    wavfile.write("layered_math_music.wav", SAMPLE_RATE, audio)
    print("Done! Saved as 'layered_math_music.wav'")