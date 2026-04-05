const PHI = 1.6180339887498948;

function ratio(n, d, l) {
  return { n, d, l };
}

function buildDegrees(mode) {
  const major = {
    I: ratio(1, 1, "I"),
    II: ratio(9, 8, "II"),
    III: ratio(5, 4, "III"),
    IV: ratio(4, 3, "IV"),
    V: ratio(3, 2, "V"),
    VI: ratio(5, 3, "VI"),
    VII: ratio(15, 8, "VII"),
  };
  const minor = {
    I: ratio(1, 1, "i"),
    II: ratio(9, 8, "ii"),
    III: ratio(6, 5, "bIII"),
    IV: ratio(4, 3, "iv"),
    V: ratio(3, 2, "v"),
    VI: ratio(8, 5, "bVI"),
    VII: ratio(16, 9, "bVII"),
  };
  
  const sev = {
    Imaj7: ratio(15, 8, "Imaj7"),
    IIm7: ratio(9, 5, "ii7"),
    III7: ratio(15, 8, "III7"),
    IVmaj7: ratio(8, 5, "IVmaj7"),
    V7: ratio(9, 4, "V7"),
    VIm7: ratio(5, 3, "vi7"),
    VIIm7b5: ratio(7, 4, "viim7b5"),
    im7: ratio(9, 8, "im7"),
    iv7: ratio(32, 15, "iv7"),
    VIImaj7: ratio(15, 8, "VII7"),
  };
  
  const ext = {
    Imaj9: ratio(15, 8, "Imaj9"),
    IIm9: ratio(45, 32, "ii9"),
    V9: ratio(9, 4, "V9"),
    V13: ratio(15, 8, "V13"),
    IVadd9: ratio(9, 4, "IVadd9"),
  };
  
  const sus = {
    Isus2: ratio(9, 8, "Isus2"),
    Isus4: ratio(8, 7, "Isus4"),
    I7sus4: ratio(21, 16, "Isus4"),
    IVsus2: ratio(9, 8, "IVsus2"),
    IVsus4: ratio(8, 7, "IVsus4"),
  };
  
  const modalBorrow = {
    bIII: ratio(6, 5, "bIII"),
    bVI: ratio(8, 5, "bVI"),
    bVII: ratio(16, 9, "bVII"),
    sharpIV: ratio(7, 5, "#IV"),
    bII: ratio(16, 15, "bII"),
  };
  
  return mode === "minor" 
    ? { ...minor, ...sev, ...ext, ...sus, ...modalBorrow, LEAD: minor.VII }
    : { ...major, ...sev, ...ext, ...sus, ...modalBorrow, LEAD: major.VII };
}

function buildHarmonyCycle(deg, mode) {
  const lead = deg.LEAD || deg.VII;
  const gentleColor = mode === "minor" ? [deg.VI, deg.IV] : [deg.VI, deg.II];
  return [
    {
      fn: "TONIC",
      chord: [deg.I, deg.III, deg.V],
      color: gentleColor,
      passing: [deg.II],
    },
    {
      fn: "TONIC",
      chord: [deg.I, deg.V, ratio(2, 1, "I8")],
      color: [deg.III, deg.II],
      passing: [deg.IV],
    },
    {
      fn: "PREDOM",
      chord: [deg.IV, deg.VI, ratio(2, 1, "I8")],
      color: [deg.II, deg.V],
      passing: [deg.III],
    },
    {
      fn: "DOMINANT",
      chord: [deg.V, lead, deg.II],
      color: [deg.IV, deg.III],
      passing: [deg.II],
    },
    {
      fn: "TONIC",
      chord: [deg.I, deg.III, deg.V],
      color: gentleColor,
      passing: [deg.II],
    },
    {
      fn: "PREDOM",
      chord: [deg.II, deg.IV, deg.VI],
      color: [deg.I, deg.V],
      passing: [deg.III],
    },
    {
      fn: "DOMINANT",
      chord: [deg.V, lead, deg.IV],
      color: [deg.II, deg.III],
      passing: [deg.II],
    },
    {
      fn: "TONIC",
      chord: [deg.I, deg.III, ratio(2, 1, "I8")],
      color: [deg.V, deg.VI],
      passing: [deg.II],
    },
  ];
}

const ODD_COLORS = [
  ratio(5, 4, "III"),
  ratio(7, 6, "7:6"),
  ratio(9, 8, "II"),
  ratio(6, 5, "iii"),
];

const SUM_ADDITIONS = [
  ratio(9, 8, "II"),
  ratio(6, 5, "ii"),
  ratio(5, 4, "III"),
];

const SUS_CHORDS = [
  ratio(9, 8, "sus2"),
  ratio(10, 9, "sus4"),
  ratio(7, 6, "7sus4"),
  ratio(45, 32, "add9"),
  ratio(5, 3, "add11"),
];

const HAT_PATTERNS = {
  fibonacci: {
    label: "Fibonacci",
    steps: [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    swingPush: 0,
    open: [8],
  },
  swing: {
    label: "Swing",
    steps: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    swingPush: 0.14,
    open: [14],
  },
  euclid5: {
    label: "Euclid-5",
    steps: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    swingPush: 0,
    open: [12],
  },
  tresillo: {
    label: "Tresillo",
    steps: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    swingPush: 0.05,
    open: [10],
  },
  syncopated: {
    label: "Syncopated",
    steps: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    swingPush: 0.08,
    open: [6, 14],
  },
};

const DEFAULT_SOUND_SETTINGS = {
  kickBusGain: 0.34,
  hatBusGain: 0.44,
  kickHPFreq: 36,
  kickHPQ: 0.55,
  kickMidFreq: 250,
  kickMidQ: 2.5,
  kickMidGain: -6,
  kickLPFreq: 145,
  kickLPQ: 0.55,
  kickBodyPeak: 0.56,
  kickBodySustain: 0.30,
  kickBodySustainTime: 0.082,
  kickBodyReleaseTime: 0.36,
  kickBodyStopTime: 0.42,
  kickClickPeak: 0.024,
  kickClickHold: 0.011,
};

const MOOD_PRESETS = {
  custom: {
    label: "Custom",
  },
  nightDrive: {
    label: "Night Drive",
    base: 58,
    bpm: 112,
    odd: 0.08,
    scale: "minor",
    hatMode: "syncopated",
    noiseType: "pink",
    noiseLevel: 0.03,
    reverb: 0.38,
    oscLevels: [1.0, 0.9, 0.72, 0.58],
    musicEnabled: true,
    kickEnabled: true,
    noiseEnabled: true,
    sound: {
      kickBusGain: 0.36,
      hatBusGain: 0.40,
      kickHPFreq: 40,
      kickMidFreq: 260,
      kickMidQ: 2.8,
      kickMidGain: -7,
      kickClickPeak: 0.028,
      kickClickHold: 0.012,
    },
  },
  deepFocus: {
    label: "Deep Focus",
    base: 55,
    bpm: 74,
    odd: 0.01,
    scale: "minor",
    hatMode: "swing",
    noiseType: "off",
    noiseLevel: 0.0,
    reverb: 0.56,
    oscLevels: [0.9, 0.84, 0.54, 0.46],
    musicEnabled: true,
    kickEnabled: true,
    noiseEnabled: false,
    sound: {
      kickBusGain: 0.31,
      hatBusGain: 0.34,
      kickMidFreq: 245,
      kickMidQ: 2.9,
      kickMidGain: -6,
      kickBodyPeak: 0.52,
      kickBodySustain: 0.26,
      kickBodySustainTime: 0.074,
      kickBodyReleaseTime: 0.32,
      kickBodyStopTime: 0.38,
    },
  },
  warmBloom: {
    label: "Warm Bloom",
    base: 62,
    bpm: 68,
    odd: 0.03,
    scale: "major",
    hatMode: "fibonacci",
    noiseType: "brown",
    noiseLevel: 0.05,
    reverb: 0.78,
    oscLevels: [0.96, 0.86, 0.58, 0.50],
    musicEnabled: true,
    kickEnabled: true,
    noiseEnabled: true,
    sound: {
      kickBusGain: 0.32,
      hatBusGain: 0.36,
      kickHPFreq: 34,
      kickMidFreq: 235,
      kickMidQ: 2.1,
      kickMidGain: -5,
      kickBodyReleaseTime: 0.42,
      kickBodyStopTime: 0.48,
      kickClickPeak: 0.02,
      kickClickHold: 0.009,
    },
  },
  auroraMist: {
    label: "Aurora Mist",
    base: 70,
    bpm: 60,
    odd: 0.02,
    scale: "major",
    hatMode: "euclid5",
    noiseType: "brown",
    noiseLevel: 0.07,
    reverb: 0.88,
    oscLevels: [0.86, 0.76, 0.5, 0.44],
    musicEnabled: true,
    kickEnabled: true,
    noiseEnabled: true,
    sound: {
      kickBusGain: 0.28,
      hatBusGain: 0.32,
      kickHPFreq: 42,
      kickMidFreq: 250,
      kickMidQ: 2.3,
      kickMidGain: -6,
      kickLPFreq: 132,
      kickBodyPeak: 0.48,
      kickBodySustain: 0.24,
      kickBodySustainTime: 0.07,
      kickBodyReleaseTime: 0.30,
      kickBodyStopTime: 0.36,
      kickClickPeak: 0.018,
      kickClickHold: 0.008,
    },
  },
};

let SCALE_MODE = "major";
let HAT_MODE = "fibonacci";
let MOOD_PRESET = "custom";
const HAT_PATTERN_KEYS = Object.keys(HAT_PATTERNS);
let autoHatIndex = Math.max(0, HAT_PATTERN_KEYS.indexOf(HAT_MODE));
let DEG = buildDegrees(SCALE_MODE);
let HARMONY_CYCLE = buildHarmonyCycle(DEG, SCALE_MODE);
let RESOLVE_POOL = [DEG.I, DEG.III, DEG.V, ratio(2, 1, "I8")];

const VOICE_RULES = [
  { maxLeap: 4, colorProb: 0.01, allowTension: false, octaveVariants: [-1, 0, 0, 1] },
  { maxLeap: 6, colorProb: 0.03, allowTension: false, octaveVariants: [0, 0, 1] },
  { maxLeap: 8, colorProb: 0.07, allowTension: true, octaveVariants: [0, 1, 1] },
  { maxLeap: 9, colorProb: 0.09, allowTension: true, octaveVariants: [0, 1] },
];

const VOICE_FREQ_BOUNDS = [
  { low: 40, high: 260 },
  { low: 95, high: 1650 },
  { low: 150, high: 4700 },
  { low: 220, high: 2000 },
];

const VD = [
  {
    nm: "DRONE",
    wv: "sine",
    oct: 0,
    pat: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pn: "E(1x16)",
    dur: (b) => b * PHI * PHI,
    gn: 0.18,
    at: 0.24,
    rl: 1.2,
    ft: "lowpass",
    ff: 300,
    fq: 0.6,
  },
  {
    nm: "HARMONY",
    wv: "triangle",
    oct: 1,
    pat: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    pn: "E(3x16)",
    dur: (b) => b * PHI,
    gn: 0.10,
    at: 0.05,
    rl: 0.5,
    ft: "bandpass",
    ff: 840,
    fq: 1.5,
  },
  {
    nm: "PULSE",
    wv: "triangle",
    oct: 2,
    pat: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    pn: "E(5x16)",
    dur: (b) => b / PHI,
    gn: 0.038,
    at: 0.012,
    rl: 0.09,
    ft: "highpass",
    ff: 280,
    fq: 0.9,
  },
  {
    nm: "TEXTURE",
    wv: "sawtooth",
    oct: 2,
    pat: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    pn: "RND(2x16)",
    dur: (b) => b * PHI,
    gn: 0.041,
    at: 0.04,
    rl: 0.82,
    ft: "lowpass",
    ff: 1200,
    fq: 1.0,
  },
];

const KICK_PATTERN = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

let BASE = 55;
let BPM = 72;
let ODD_SL = 0.03;
let NOISE_TYPE = "brown";
let NOISE_LVL = 0.05;
let SOUND_SETTINGS = { ...DEFAULT_SOUND_SETTINGS };
const OSC_LVLS = [1.00, 1.00, 0.65, 0.65];
const SAW_LEGATO_VOICE_INDEX = 3;
const SAW_MONO_GLIDE_SECONDS = 0.095;
const SAW_START_ATTACK_SECONDS = 0.22;
const SAW_START_FILTER_SWELL_SECONDS = 0.20;
let actx = null;
let mGain = null;
let kickBus = null;
let hatBus = null;
let noiseBus = null;
let melodyGate = null;
let kickGate = null;
let hatGate = null;
let musicMuted = false;
let kickMuted = false;
let noiseEnabled = true;
let noiseNode = null;
let melodyHP = null;
let melodyLP = null;
let kickHP = null;
let kickMidDip = null;
let kickLP = null;
let dGain = null;
let rGain = null;
let anlz = null;
const voiceAnalyzers = Array.from({ length: 4 }, () => null);
let kickAnalyser = null;
let hatAnalyser = null;
let conv = null;
let hatNoiseBuffer = null;
let sawLegatoVoice = null;
let playing = false;
let tid = null;
let globalStep = 0;
let nextStepTime = 0;
const SETTINGS_KEY = "ratioEngineSettingsV1";
let persistSuppressed = false;
let focusModeEnabled = false;
let focusTimerMinutes = 25;
let focusTimerRunning = false;
let focusTimerEndsAtMs = 0;
let focusTimerIntervalId = null;
let focusTodoItems = [];
let focusTimerEditing = false;
const TIMER_START_SOUND_PATH = "assets/timer-start.mp3";
const TIMER_END_SOUND_PATH = "assets/timer-end.mp3";
const focusTimerStartSound = new Audio(TIMER_START_SOUND_PATH);
const focusTimerEndSound = new Audio(TIMER_END_SOUND_PATH);
focusTimerStartSound.preload = "auto";
focusTimerEndSound.preload = "auto";

const vcur = [{}, {}, {}, {}];
const voiceState = Array.from({ length: 4 }, () => ({
  lastFreq: null,
  pendingResolution: null,
}));

const STEPS_PER_BAR = 16;

function gcd(a, b) {
  return b < 1 ? a : gcd(b, a % b);
}

function reduceFraction(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: n / g, d: d / g };
}

function cloneRatio(r) {
  return { n: r.n, d: r.d, l: r.l };
}

function ratioValue(r) {
  return r.n / r.d;
}

function transposeRatio(source, octShift) {
  if (!octShift) {
    return cloneRatio(source);
  }
  let n = source.n;
  let d = source.d;
  if (octShift > 0) {
    n *= 2 ** octShift;
  } else {
    d *= 2 ** Math.abs(octShift);
  }
  const reduced = reduceFraction(n, d);
  const suffix = octShift > 0 ? `+${octShift}8` : `${octShift}8`;
  return { n: reduced.n, d: reduced.d, l: `${source.l}${suffix}` };
}

function foldRatioNear(reference, source) {
  const refVal = ratioValue(reference);
  let n = source.n;
  let d = source.d;
  let val = n / d;
  while (val < refVal / 1.45) {
    n *= 2;
    val *= 2;
  }
  while (val > refVal * 1.45) {
    d *= 2;
    val /= 2;
  }
  const reduced = reduceFraction(n, d);
  return { n: reduced.n, d: reduced.d, l: source.l };
}

function weightedPick(items) {
  if (!items.length) {
    throw new Error("weightedPick called with empty items");
  }
  const total = items.reduce((sum, item) => sum + Math.max(0.0001, item.weight || 1), 0);
  let needle = Math.random() * total;
  for (const item of items) {
    needle -= Math.max(0.0001, item.weight || 1);
    if (needle <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

function uniqueRatios(ratios) {
  const map = new Map();
  for (const r of ratios) {
    const key = `${r.n}/${r.d}`;
    if (!map.has(key)) {
      map.set(key, r);
    }
  }
  return Array.from(map.values());
}

function getHarmonyContext(step) {
  const bar = Math.floor(step / STEPS_PER_BAR);
  const stepInBar = step % STEPS_PER_BAR;
  const slot = HARMONY_CYCLE[bar % HARMONY_CYCLE.length];
  const prevSlot = HARMONY_CYCLE[(bar - 1 + HARMONY_CYCLE.length) % HARMONY_CYCLE.length];
  return {
    bar,
    stepInBar,
    fn: slot.fn,
    chord: slot.chord,
    color: slot.color,
    passing: slot.passing,
    root: slot.chord[0],
    isCadenceResolution: slot.fn === "TONIC" && prevSlot.fn === "DOMINANT" && stepInBar < 4,
  };
}

function semitoneDistance(a, b) {
  return Math.abs(12 * Math.log2(a / b));
}

function toFrequency(vi, ratioObj) {
  const bounds = VOICE_FREQ_BOUNDS[vi] || { low: 50, high: 7600 };
  let freq = BASE * ratioValue(ratioObj) * Math.pow(2, VD[vi].oct);
  while (freq < bounds.low) {
    freq *= 2;
  }
  while (freq > bounds.high) {
    freq /= 2;
  }
  return Math.min(bounds.high, Math.max(bounds.low * 0.85, freq));
}

function addCandidateVariants(candidates, ratioObj, weight, octaveVariants) {
  for (const shift of octaveVariants) {
    const shade = shift === 0 ? 1 : 1 / (1 + Math.abs(shift) * 0.45);
    candidates.push({ ratio: transposeRatio(ratioObj, shift), weight: weight * shade });
  }
}

function buildVoiceCandidates(vi, ctx) {
  const rule = VOICE_RULES[vi];
  const candidates = [];

  if (vi === 0) {
    addCandidateVariants(candidates, ctx.root, 8, rule.octaveVariants);
    addCandidateVariants(candidates, ctx.chord[2] || ctx.chord[1], 3, [-1, 0, 0]);
    addCandidateVariants(candidates, ctx.chord[1], 1.8, [-1, 0]);
    return candidates;
  }

  ctx.chord.forEach((r, idx) => addCandidateVariants(candidates, r, idx === 0 ? 3 : 4, rule.octaveVariants));
  ctx.color.forEach((r) => addCandidateVariants(candidates, r, 1.2, rule.octaveVariants));

  const colorChance = rule.colorProb + (ctx.fn === "PREDOM" ? 0.02 : 0);
  if (Math.random() < colorChance) {
    ctx.color.forEach((r) => addCandidateVariants(candidates, r, 1.4, rule.octaveVariants));
    ctx.passing.forEach((r) => addCandidateVariants(candidates, r, 1.1, rule.octaveVariants));
  }

  if (ctx.fn === "DOMINANT" && vi >= 2) {
    addCandidateVariants(candidates, DEG.LEAD || DEG.VII, 1.8, rule.octaveVariants);
  }

  return candidates;
}

function chooseByVoiceLeading(vi, candidates, maxLeap) {
  const state = voiceState[vi];
  if (!state.lastFreq) {
    return cloneRatio(weightedPick(candidates).ratio);
  }

  const scored = candidates.map((item) => {
    const freq = toFrequency(vi, item.ratio);
    const leap = semitoneDistance(freq, state.lastFreq);
    const weight = (item.weight || 1) / (1 + leap * 0.34);
    return { item, leap, weight };
  });

  const inRange = scored.filter((entry) => entry.leap <= maxLeap);
  const pool = inRange.length ? inRange : scored.sort((a, b) => a.leap - b.leap).slice(0, 4);

  const picked = weightedPick(
    pool.map((entry) => ({
      ratio: entry.item.ratio,
      weight: Math.max(0.02, entry.weight),
    }))
  );
  return cloneRatio(picked.ratio);
}

function tensionProbability(ctx, vi) {
  const base = 0.002 + ODD_SL * 0.06;
  let adjusted = base;
  if (ctx.fn === "DOMINANT") {
    adjusted *= 1.25;
  }
  if (ctx.fn === "TONIC") {
    adjusted *= 0.2;
  }
  if (vi < 2) {
    adjusted *= 0.15;
  }
  return Math.min(0.06, adjusted);
}

function chooseOddColor(baseRatio) {
  const base = ratioValue(baseRatio);
  const options = ODD_COLORS.map((odd) => {
    const fitted = foldRatioNear(baseRatio, odd);
    const diff = Math.abs(Math.log2(ratioValue(fitted) / base));
    return {
      ratio: fitted,
      weight: 1 / (1 + diff * 8),
    };
  });
  return cloneRatio(weightedPick(options).ratio);
}

function chooseSumColor(baseRatio) {
  const addition = weightedPick(SUM_ADDITIONS.map((r) => ({ ratio: r, weight: 1 }))).ratio;
  const rawN = baseRatio.n * addition.d + addition.n * baseRatio.d;
  const rawD = baseRatio.d * addition.d;
  const reduced = reduceFraction(rawN, rawD);
  const fitted = foldRatioNear(baseRatio, {
    n: reduced.n,
    d: reduced.d,
    l: `${baseRatio.n}/${baseRatio.d}+${addition.n}/${addition.d}`,
  });
  fitted.l = `${baseRatio.n}/${baseRatio.d}+${addition.n}/${addition.d}`;
  return fitted;
}

function chooseResolutionTarget(vi, ctx) {
  if (vi === 0) {
    return cloneRatio(DEG.I);
  }
  const pool = ctx.fn === "TONIC" ? ctx.chord : RESOLVE_POOL;
  return cloneRatio(pool[Math.min(vi, pool.length - 1)]);
}

function getFreq(vi, ctx, stepState) {
  const rule = VOICE_RULES[vi];
  const state = voiceState[vi];

  let selected;
  let mt = "PURE";

  if (state.pendingResolution) {
    const resolvePool = uniqueRatios([state.pendingResolution, ...ctx.chord, ...RESOLVE_POOL]);
    selected = chooseByVoiceLeading(
      vi,
      resolvePool.map((r, idx) => ({ ratio: r, weight: idx === 0 ? 5 : 2 })),
      rule.maxLeap + 2
    );
    state.pendingResolution = null;
  } else {
    selected = chooseByVoiceLeading(vi, buildVoiceCandidates(vi, ctx), rule.maxLeap);
  }

  if (ctx.isCadenceResolution && vi === 0) {
    selected = cloneRatio(DEG.I);
    mt = "PURE";
    state.pendingResolution = null;
  }

  const canUseTension =
    rule.allowTension &&
    !state.pendingResolution &&
    !ctx.isCadenceResolution &&
    ctx.fn === "DOMINANT" &&
    ctx.stepInBar >= 6 &&
    stepState.tensionCount < 1 &&
    !(vi >= 2 && stepState.upperTensionUsed);

  if (canUseTension && Math.random() < tensionProbability(ctx, vi)) {
    if (Math.random() < 0.08 + ODD_SL * 0.10) {
      selected = chooseSumColor(selected);
      mt = "SUM";
    } else {
      selected = chooseOddColor(selected);
      mt = "ODD";
    }
    stepState.tensionCount += 1;
    if (vi >= 2) {
      stepState.upperTensionUsed = true;
    }
    state.pendingResolution = chooseResolutionTarget(vi, ctx);
  }

  const freq = toFrequency(vi, selected);
  state.lastFreq = freq;

  return {
    f: freq,
    n: selected.n,
    d: selected.d,
    l: selected.l,
    mt,
  };
}

function resetMusicalState() {
  stopSawLegatoVoice(actx ? actx.currentTime : 0);
  globalStep = 0;
  nextStepTime = 0;
  for (let i = 0; i < voiceState.length; i++) {
    voiceState[i].lastFreq = null;
    voiceState[i].pendingResolution = null;
    vcur[i] = {};
  }
}

function applyScale(mode) {
  if (mode !== "major" && mode !== "minor") {
    return;
  }
  SCALE_MODE = mode;
  DEG = buildDegrees(SCALE_MODE);
  HARMONY_CYCLE = buildHarmonyCycle(DEG, SCALE_MODE);
  RESOLVE_POOL = [DEG.I, DEG.III, DEG.V, ratio(2, 1, "I8")];

  for (let i = 0; i < voiceState.length; i++) {
    voiceState[i].lastFreq = null;
    voiceState[i].pendingResolution = null;
  }

  const label = SCALE_MODE === "major" ? "Major" : "Minor";
  const scaleVal = document.getElementById("scaleVal");
  if (scaleVal) {
    scaleVal.textContent = label;
  }

  if (playing) {
    setRunningStatus(globalStep);
  }
}

function applyHatPattern(mode) {
  if (!HAT_PATTERNS[mode]) {
    return;
  }
  HAT_MODE = mode;
  const patternIndex = HAT_PATTERN_KEYS.indexOf(mode);
  if (patternIndex >= 0) {
    autoHatIndex = patternIndex;
  }
  const hatVal = document.getElementById("hatVal");
  if (hatVal) {
    hatVal.textContent = HAT_PATTERNS[mode].label;
  }

  if (playing) {
    setRunningStatus(globalStep);
  }
}

function statusModeSuffix() {
  const tags = [];
  if (musicMuted) {
    tags.push("NO MUSIC");
  }
  if (kickMuted) {
    tags.push("NO KICK");
  }
  if (!noiseEnabled) {
    tags.push("NO NOISE");
  }
  return tags.length ? ` · ${tags.join(" · ")}` : "";
}

function setRunningStatus(step = globalStep) {
  const ctx = getHarmonyContext(step);
  document.getElementById("stat").innerHTML =
    `STATUS: <em>RUNNING</em> · ${ctx.fn} · ${SCALE_MODE.toUpperCase()} · ${HAT_PATTERNS[HAT_MODE].label}${statusModeSuffix()}`;
}

function setIdleStatus() {
  document.getElementById("stat").textContent = `— IDLE —${statusModeSuffix()}`;
}

function applyMusicMuteState() {
  const gateValue = musicMuted ? 0 : 1;
  if (melodyGate) {
    melodyGate.gain.value = gateValue;
  }
  if (kickGate) {
    kickGate.gain.value = musicMuted || kickMuted ? 0 : 1;
  }
  if (hatGate) {
    hatGate.gain.value = gateValue;
  }
  if (playing) {
    setRunningStatus(globalStep);
  } else {
    setIdleStatus();
  }
}

function syncToggleButtons() {
  const musicBtn = document.getElementById("musicToggleBtn");
  if (musicBtn) {
    musicBtn.textContent = musicMuted ? "MUSIC OFF" : "MUSIC ON";
    musicBtn.className = `toggle-btn ${musicMuted ? "off" : "on"}`;
  }
  const kickBtn = document.getElementById("kickToggleBtn");
  if (kickBtn) {
    kickBtn.textContent = kickMuted ? "KICK OFF" : "KICK ON";
    kickBtn.className = `toggle-btn ${kickMuted ? "off" : "on"}`;
  }
  const noiseBtn = document.getElementById("noiseToggleBtn");
  if (noiseBtn) {
    noiseBtn.textContent = noiseEnabled ? "NOISE ON" : "NOISE OFF";
    noiseBtn.className = `toggle-btn ${noiseEnabled ? "on" : "off"}`;
  }
}

function setControlValue(id, value) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.value = `${value}`;
}

function setControlLabel(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = text;
}

function sanitizeSoundSettings(source) {
  const next = { ...DEFAULT_SOUND_SETTINGS };
  if (!source || typeof source !== "object") {
    return next;
  }
  for (const key of Object.keys(next)) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      next[key] = value;
    }
  }
  return next;
}

function applySoundSettingsToEngine() {
  if (kickBus) {
    kickBus.gain.value = SOUND_SETTINGS.kickBusGain;
  }
  if (hatBus) {
    hatBus.gain.value = SOUND_SETTINGS.hatBusGain;
  }
  if (kickHP) {
    kickHP.frequency.value = SOUND_SETTINGS.kickHPFreq;
    kickHP.Q.value = SOUND_SETTINGS.kickHPQ;
  }
  if (kickMidDip) {
    kickMidDip.frequency.value = SOUND_SETTINGS.kickMidFreq;
    kickMidDip.Q.value = SOUND_SETTINGS.kickMidQ;
    kickMidDip.gain.value = SOUND_SETTINGS.kickMidGain;
  }
  if (kickLP) {
    kickLP.frequency.value = SOUND_SETTINGS.kickLPFreq;
    kickLP.Q.value = SOUND_SETTINGS.kickLPQ;
  }
}

function syncMoodPresetControl() {
  const moodCtrl = document.getElementById("moodPresetCtrl");
  const moodVal = document.getElementById("moodPresetVal");
  if (moodCtrl) {
    moodCtrl.value = MOOD_PRESET;
  }
  if (moodVal) {
    moodVal.textContent = MOOD_PRESETS[MOOD_PRESET]?.label || MOOD_PRESETS.custom.label;
  }
}

function markMoodPresetCustom() {
  if (MOOD_PRESET === "custom") {
    return;
  }
  MOOD_PRESET = "custom";
  syncMoodPresetControl();
}

function applyMoodPreset(presetKey) {
  const preset = MOOD_PRESETS[presetKey];
  if (!preset || presetKey === "custom") {
    MOOD_PRESET = "custom";
    syncMoodPresetControl();
    persistSettings();
    return;
  }

  const prevSuppress = persistSuppressed;
  persistSuppressed = true;
  try {
    SOUND_SETTINGS = sanitizeSoundSettings({ ...DEFAULT_SOUND_SETTINGS, ...(preset.sound || {}) });

    if (typeof preset.base === "number") {
      BASE = Math.max(55, Math.min(220, preset.base));
      setControlValue("baseCtrl", BASE);
      setControlLabel("baseVal", `${BASE} Hz`);
    }
    if (typeof preset.bpm === "number") {
      BPM = Math.max(40, Math.min(140, preset.bpm));
      setControlValue("bpmCtrl", BPM);
      setControlLabel("bpmVal", `${BPM} BPM`);
    }
    if (typeof preset.odd === "number") {
      ODD_SL = Math.max(0, Math.min(0.6, preset.odd));
      const oddPct = Math.round(ODD_SL * 100);
      setControlValue("oddCtrl", oddPct);
      setControlLabel("oddVal", `${oddPct}%`);
    }
    if (preset.scale === "major" || preset.scale === "minor") {
      setControlValue("scaleCtrl", preset.scale);
      applyScale(preset.scale);
    }
    if (preset.hatMode && HAT_PATTERNS[preset.hatMode]) {
      setControlValue("hatCtrl", preset.hatMode);
      applyHatPattern(preset.hatMode);
    }
    if (preset.noiseType && ["off", "white", "pink", "brown"].includes(preset.noiseType)) {
      NOISE_TYPE = preset.noiseType;
      const noiseCtrl = document.getElementById("noiseCtrl");
      if (noiseCtrl) {
        noiseCtrl.value = NOISE_TYPE;
        setControlLabel("noiseVal", noiseCtrl.options[noiseCtrl.selectedIndex].text);
      }
    }
    if (typeof preset.noiseLevel === "number") {
      NOISE_LVL = Math.max(0, Math.min(1, preset.noiseLevel));
      const noisePct = Math.round(NOISE_LVL * 100);
      setControlValue("noiseLvlCtrl", noisePct);
      setControlLabel("noiseLvlVal", `${noisePct}%`);
    }
    if (Array.isArray(preset.oscLevels)) {
      for (let i = 0; i < OSC_LVLS.length; i++) {
        const value = preset.oscLevels[i];
        if (typeof value === "number") {
          OSC_LVLS[i] = Math.max(0, Math.min(1, value));
        }
      }
      bindOscLevelControls();
    }
    if (typeof preset.reverb === "number") {
      const reverbValue = Math.max(0, Math.min(1, preset.reverb));
      setControlValue("revCtrl", Math.round(reverbValue * 100));
      setControlLabel("revVal", `${Math.round(reverbValue * 100)}%`);
      if (rGain) {
        rGain.gain.value = reverbValue;
      }
      if (dGain) {
        dGain.gain.value = Math.max(0.24, 0.78 - reverbValue * 0.32);
      }
    }

    applySoundSettingsToEngine();

    if (typeof preset.musicEnabled === "boolean") {
      setMusicEnabled(preset.musicEnabled, { markCustom: false });
    }
    if (typeof preset.kickEnabled === "boolean") {
      setKickEnabled(preset.kickEnabled, { markCustom: false });
    }
    if (typeof preset.noiseEnabled === "boolean") {
      setNoiseEnabled(preset.noiseEnabled, { markCustom: false });
    } else {
      updateNoise();
    }

    MOOD_PRESET = presetKey;
  } finally {
    persistSuppressed = prevSuppress;
  }
  syncMoodPresetControl();
  persistSettings();
}

function setNoiseEnabled(enabled, options = {}) {
  const { markCustom = true } = options;
  if (markCustom) {
    markMoodPresetCustom();
  }
  noiseEnabled = enabled;
  const noiseSelect = document.getElementById("noiseCtrl");
  if (noiseSelect) {
    noiseSelect.disabled = !enabled;
  }
  const noiseLevel = document.getElementById("noiseLvlCtrl");
  if (noiseLevel) {
    noiseLevel.disabled = !enabled;
  }
  if (!noiseEnabled && noiseNode) {
    noiseNode.stop();
    noiseNode.disconnect();
    noiseNode = null;
  }
  if (noiseBus) {
    noiseBus.gain.value = !noiseEnabled || NOISE_TYPE === "off" || !playing ? 0 : NOISE_LVL;
  }
  if (noiseEnabled) {
    updateNoise();
  }
  syncToggleButtons();
  if (playing) {
    setRunningStatus(globalStep);
  } else {
    setIdleStatus();
  }
  persistSettings();
}

function setMusicEnabled(enabled, options = {}) {
  const { markCustom = true } = options;
  if (markCustom) {
    markMoodPresetCustom();
  }
  musicMuted = !enabled;
  if (musicMuted) {
    stopSawLegatoVoice(actx ? actx.currentTime : 0);
  }
  applyMusicMuteState();
  syncToggleButtons();
  persistSettings();
}

function setKickEnabled(enabled, options = {}) {
  const { markCustom = true } = options;
  if (markCustom) {
    markMoodPresetCustom();
  }
  kickMuted = !enabled;
  applyMusicMuteState();
  syncToggleButtons();
  persistSettings();
}

function syncFocusModeButton() {
  const focusBtn = document.getElementById("focusModeBtn");
  if (!focusBtn) {
    return;
  }
  focusBtn.textContent = focusModeEnabled ? "FOCUS ON" : "FOCUS OFF";
  focusBtn.className = `toggle-btn focus ${focusModeEnabled ? "on" : "off"}`;
  focusBtn.setAttribute("aria-pressed", focusModeEnabled ? "true" : "false");
}

function setFocusMode(enabled, options = {}) {
  const { persist = true } = options;
  focusModeEnabled = !!enabled;
  document.body.classList.toggle("focus-mode", focusModeEnabled);
  const focusLayout = document.getElementById("focusLayout");
  if (focusLayout) {
    focusLayout.setAttribute("aria-hidden", focusModeEnabled ? "false" : "true");
  }
  syncFocusModeButton();
  rsz();
  if (persist) {
    persistSettings();
  }
}

function formatFocusDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function playFocusTimerStartSound() {
  focusTimerStartSound.currentTime = 0;
  focusTimerStartSound.play().catch(() => {});
}

function playFocusTimerEndSound() {
  focusTimerEndSound.currentTime = 0;
  focusTimerEndSound.play().catch(() => {});
}

function setFocusTimerError(message = "") {
  const errorEl = document.getElementById("focusTimerError");
  if (!errorEl) {
    return;
  }
  errorEl.textContent = message;
}

function openFocusTimerEditor() {
  if (focusTimerEditing) {
    return;
  }
  focusTimerEditing = true;
  const editWrap = document.getElementById("focusTimerEdit");
  const input = document.getElementById("focusTimerTextInput");
  if (editWrap) {
    editWrap.hidden = false;
  }
  if (input) {
    input.value = `${focusTimerMinutes}`;
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  }
  setFocusTimerError("");
}

function closeFocusTimerEditor() {
  focusTimerEditing = false;
  const editWrap = document.getElementById("focusTimerEdit");
  if (editWrap) {
    editWrap.hidden = true;
  }
}

function applyTypedFocusTimerMinutes(rawValue) {
  const parsed = Number.parseInt(`${rawValue || ""}`.trim(), 10);
  if (!Number.isFinite(parsed)) {
    setFocusTimerError("Enter minutes as a number (5-60).");
    return false;
  }
  if (parsed < 5 || parsed > 60) {
    setFocusTimerError("Minutes must be between 5 and 60.");
    return false;
  }
  focusTimerMinutes = parsed;
  const minutesCtrl = document.getElementById("focusTimerMinutesCtrl");
  if (minutesCtrl) {
    minutesCtrl.value = `${focusTimerMinutes}`;
  }
  if (focusTimerRunning) {
    pauseFocusTimer({ preserveMinutes: true });
  } else {
    renderFocusTimer();
    persistSettings();
  }
  setFocusTimerError("");
  closeFocusTimerEditor();
  return true;
}

function renderFocusTimer() {
  const display = document.getElementById("focusTimerDisplay");
  const startBtn = document.getElementById("focusTimerStartBtn");
  const minutesVal = document.getElementById("focusTimerMinutesVal");
  if (minutesVal) {
    minutesVal.textContent = `${focusTimerMinutes} MIN`;
  }
  if (startBtn) {
    startBtn.textContent = focusTimerRunning ? "PAUSE" : "START";
    startBtn.className = `focus-btn ${focusTimerRunning ? "on" : ""}`.trim();
  }
  if (!display) {
    return;
  }
  if (!focusTimerRunning) {
    display.textContent = formatFocusDuration(focusTimerMinutes * 60);
    return;
  }
  const remainingMs = Math.max(0, focusTimerEndsAtMs - Date.now());
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  display.textContent = formatFocusDuration(remainingSeconds);
  if (remainingSeconds <= 0) {
    playFocusTimerEndSound();
    focusTimerRunning = false;
    focusTimerEndsAtMs = 0;
    if (focusTimerIntervalId) {
      clearInterval(focusTimerIntervalId);
      focusTimerIntervalId = null;
    }
    renderFocusTimer();
    persistSettings();
  }
}

function startFocusTimer() {
  focusTimerRunning = true;
  focusTimerEndsAtMs = Date.now() + focusTimerMinutes * 60 * 1000;
  if (focusTimerIntervalId) {
    clearInterval(focusTimerIntervalId);
  }
  focusTimerIntervalId = setInterval(renderFocusTimer, 250);
  renderFocusTimer();
  playFocusTimerStartSound();
  persistSettings();
}

function pauseFocusTimer(options = {}) {
  const { preserveMinutes = false } = options;
  if (!focusTimerRunning) {
    return;
  }
  if (!preserveMinutes) {
    const remainingMs = Math.max(0, focusTimerEndsAtMs - Date.now());
    focusTimerMinutes = Math.max(5, Math.min(60, Math.ceil(remainingMs / 60000)));
  }
  focusTimerRunning = false;
  focusTimerEndsAtMs = 0;
  if (focusTimerIntervalId) {
    clearInterval(focusTimerIntervalId);
    focusTimerIntervalId = null;
  }
  if (!preserveMinutes) {
    const minutesCtrl = document.getElementById("focusTimerMinutesCtrl");
    if (minutesCtrl) {
      minutesCtrl.value = `${focusTimerMinutes}`;
    }
  }
  renderFocusTimer();
  persistSettings();
}

function resetFocusTimer() {
  focusTimerRunning = false;
  focusTimerEndsAtMs = 0;
  if (focusTimerIntervalId) {
    clearInterval(focusTimerIntervalId);
    focusTimerIntervalId = null;
  }
  const minutesCtrl = document.getElementById("focusTimerMinutesCtrl");
  if (minutesCtrl) {
    minutesCtrl.value = `${focusTimerMinutes}`;
  }
  renderFocusTimer();
  persistSettings();
}

function renderFocusTodoList() {
  const list = document.getElementById("focusTodoList");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  for (let i = 0; i < focusTodoItems.length; i++) {
    const item = focusTodoItems[i];
    const li = document.createElement("li");
    li.className = `focus-todo-item${item.done ? " done" : ""}`;
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "focus-todo-toggle";
    toggle.checked = !!item.done;
    toggle.addEventListener("change", () => {
      focusTodoItems[i].done = toggle.checked;
      renderFocusTodoList();
      persistSettings();
    });
    const text = document.createElement("span");
    text.className = "focus-todo-text";
    text.textContent = item.text;
    li.appendChild(toggle);
    li.appendChild(text);
    list.appendChild(li);
  }
}

function addFocusTodo(raw) {
  const text = `${raw || ""}`.trim();
  if (!text) {
    return;
  }
  focusTodoItems.unshift({ text: text.slice(0, 120), done: false });
  if (focusTodoItems.length > 20) {
    focusTodoItems = focusTodoItems.slice(0, 20);
  }
  renderFocusTodoList();
  persistSettings();
}

function bindFocusModeControls() {
  const focusBtn = document.getElementById("focusModeBtn");
  if (focusBtn) {
    focusBtn.addEventListener("click", () => setFocusMode(!focusModeEnabled));
  }

  const timerStartBtn = document.getElementById("focusTimerStartBtn");
  if (timerStartBtn) {
    timerStartBtn.addEventListener("click", () => {
      if (focusTimerRunning) {
        pauseFocusTimer();
      } else {
        startFocusTimer();
      }
    });
  }

  const timerResetBtn = document.getElementById("focusTimerResetBtn");
  if (timerResetBtn) {
    timerResetBtn.addEventListener("click", resetFocusTimer);
  }

  const timerDisplayBtn = document.getElementById("focusTimerDisplay");
  if (timerDisplayBtn) {
    timerDisplayBtn.addEventListener("click", () => {
      openFocusTimerEditor();
    });
  }

  const timerTextInput = document.getElementById("focusTimerTextInput");
  const timerApplyBtn = document.getElementById("focusTimerApplyBtn");
  if (timerApplyBtn && timerTextInput) {
    timerApplyBtn.addEventListener("click", () => {
      applyTypedFocusTimerMinutes(timerTextInput.value);
    });
  }
  if (timerTextInput) {
    timerTextInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyTypedFocusTimerMinutes(timerTextInput.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeFocusTimerEditor();
        setFocusTimerError("");
      }
    });
  }

  const timerMinutesCtrl = document.getElementById("focusTimerMinutesCtrl");
  if (timerMinutesCtrl) {
    let wasRunningOnPointerDown = false;
    timerMinutesCtrl.addEventListener("pointerdown", () => {
      wasRunningOnPointerDown = focusTimerRunning;
      if (focusTimerRunning) {
        pauseFocusTimer({ preserveMinutes: true });
      }
    });
    timerMinutesCtrl.addEventListener("input", (e) => {
      focusTimerMinutes = Math.max(5, Math.min(60, +e.target.value || 25));
      renderFocusTimer();
      if (wasRunningOnPointerDown) {
        setFocusTimerError("Timer paused while adjusting. Press START to resume.");
      } else {
        setFocusTimerError("");
      }
      persistSettings();
    });
  }

  const todoInput = document.getElementById("focusTodoInput");
  const todoAddBtn = document.getElementById("focusTodoAddBtn");
  const submitTodo = () => {
    if (!todoInput) {
      return;
    }
    addFocusTodo(todoInput.value);
    todoInput.value = "";
  };
  if (todoAddBtn) {
    todoAddBtn.addEventListener("click", submitTodo);
  }
  if (todoInput) {
    todoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitTodo();
      }
    });
  }

  const notesEl = document.getElementById("focusNotes");
  if (notesEl) {
    notesEl.addEventListener("input", () => persistSettings());
  }

  syncFocusModeButton();
  renderFocusTodoList();
  renderFocusTimer();
}

function applyControlTooltips() {
  const tips = [
    ["playBtn", "Start or stop playback"],
    ["musicToggleBtn", "Toggle music layer on/off"],
    ["kickToggleBtn", "Mute or unmute the kick (Shortcut: K)"],
    ["noiseToggleBtn", "Toggle noise layer on/off (Shortcut: N)"],
    ["focusModeBtn", "Toggle focus mode layout (Shortcut: F)"],
    ["baseCtrl", "Base frequency in Hz"],
    ["moodPresetCtrl", "Mood template preset"],
    ["scaleCtrl", "Harmony scale mode"],
    ["hatCtrl", "Hi-hat pattern (auto cycles every 8 bars)"],
    ["bpmCtrl", "Tempo in BPM"],
    ["oddCtrl", "Odd-ratio probability"],
    ["noiseCtrl", "Noise color"],
    ["noiseLvlCtrl", "Noise level"],
    ["revCtrl", "Reverb amount"],
  ];
  for (const [id, title] of tips) {
    const el = document.getElementById(id);
    if (el) {
      el.title = title;
    }
  }
}

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

function persistSettings() {
  try {
    if (persistSuppressed) {
      return;
    }
    const payload = {
      base: BASE,
      bpm: BPM,
      odd: ODD_SL,
      moodPreset: MOOD_PRESET,
      scale: SCALE_MODE,
      hatMode: HAT_MODE,
      noiseType: NOISE_TYPE,
      noiseLevel: NOISE_LVL,
      reverb: rGain
        ? rGain.gain.value
        : Math.max(0, Math.min(1, +(document.getElementById("revCtrl")?.value || 80) / 100)),
      soundSettings: { ...SOUND_SETTINGS },
      oscLevels: OSC_LVLS.slice(),
      musicEnabled: !musicMuted,
      kickEnabled: !kickMuted,
      noiseEnabled,
      focusModeEnabled,
      focusTimerMinutes,
      focusTimerRunning,
      focusTimerEndsAtMs,
      focusTodoItems,
      focusNotes: document.getElementById("focusNotes")?.value || "",
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

function applyStoredSettings() {
  const saved = readSettings();
  if (!saved) {
    SOUND_SETTINGS = sanitizeSoundSettings(DEFAULT_SOUND_SETTINGS);
    applySoundSettingsToEngine();
    syncMoodPresetControl();
    syncToggleButtons();
    setFocusMode(false, { persist: false });
    renderFocusTimer();
    renderFocusTodoList();
    return;
  }

  persistSuppressed = true;
  try {
    if (saved.moodPreset && MOOD_PRESETS[saved.moodPreset]) {
      MOOD_PRESET = saved.moodPreset;
    } else {
      MOOD_PRESET = "custom";
    }

    if (typeof saved.base === "number") {
      BASE = Math.max(55, Math.min(220, saved.base));
    }
    const baseCtrl = document.getElementById("baseCtrl");
    const baseVal = document.getElementById("baseVal");
    if (baseCtrl && baseVal) {
      baseCtrl.value = `${BASE}`;
      baseVal.textContent = `${BASE} Hz`;
    }

    if (typeof saved.bpm === "number") {
      BPM = Math.max(40, Math.min(140, saved.bpm));
    }
    const bpmCtrl = document.getElementById("bpmCtrl");
    const bpmVal = document.getElementById("bpmVal");
    if (bpmCtrl && bpmVal) {
      bpmCtrl.value = `${BPM}`;
      bpmVal.textContent = `${BPM} BPM`;
    }

    if (typeof saved.odd === "number") {
      ODD_SL = Math.max(0, Math.min(0.6, saved.odd));
    }
    const oddCtrl = document.getElementById("oddCtrl");
    const oddVal = document.getElementById("oddVal");
    if (oddCtrl && oddVal) {
      oddCtrl.value = `${Math.round(ODD_SL * 100)}`;
      oddVal.textContent = `${Math.round(ODD_SL * 100)}%`;
    }

    if (saved.scale === "major" || saved.scale === "minor") {
      const scaleCtrl = document.getElementById("scaleCtrl");
      if (scaleCtrl) {
        scaleCtrl.value = saved.scale;
      }
      applyScale(saved.scale);
    }

    if (saved.hatMode && HAT_PATTERNS[saved.hatMode]) {
      const hatCtrl = document.getElementById("hatCtrl");
      if (hatCtrl) {
        hatCtrl.value = saved.hatMode;
      }
      applyHatPattern(saved.hatMode);
    }

    if (saved.noiseType && ["off", "white", "pink", "brown"].includes(saved.noiseType)) {
      NOISE_TYPE = saved.noiseType;
    }
    const noiseCtrl = document.getElementById("noiseCtrl");
    const noiseVal = document.getElementById("noiseVal");
    if (noiseCtrl && noiseVal) {
      noiseCtrl.value = NOISE_TYPE;
      noiseVal.textContent = noiseCtrl.options[noiseCtrl.selectedIndex].text;
    }

    if (typeof saved.noiseLevel === "number") {
      NOISE_LVL = Math.max(0, Math.min(1, saved.noiseLevel));
    }
    const noiseLvlCtrl = document.getElementById("noiseLvlCtrl");
    const noiseLvlVal = document.getElementById("noiseLvlVal");
    if (noiseLvlCtrl && noiseLvlVal) {
      noiseLvlCtrl.value = `${Math.round(NOISE_LVL * 100)}`;
      noiseLvlVal.textContent = `${Math.round(NOISE_LVL * 100)}%`;
    }

    if (saved.soundSettings) {
      SOUND_SETTINGS = sanitizeSoundSettings(saved.soundSettings);
    } else if (MOOD_PRESETS[MOOD_PRESET] && MOOD_PRESET !== "custom") {
      SOUND_SETTINGS = sanitizeSoundSettings({
        ...DEFAULT_SOUND_SETTINGS,
        ...(MOOD_PRESETS[MOOD_PRESET].sound || {}),
      });
    } else {
      SOUND_SETTINGS = sanitizeSoundSettings(DEFAULT_SOUND_SETTINGS);
    }

    if (Array.isArray(saved.oscLevels)) {
      for (let i = 0; i < OSC_LVLS.length; i++) {
        const v = saved.oscLevels[i];
        if (typeof v === "number") {
          OSC_LVLS[i] = Math.max(0, Math.min(1, v));
        }
      }
    }
    bindOscLevelControls();

    const reverbValue = typeof saved.reverb === "number" ? Math.max(0, Math.min(1, saved.reverb)) : 0.8;
    const revCtrl = document.getElementById("revCtrl");
    const revVal = document.getElementById("revVal");
    if (revCtrl && revVal) {
      revCtrl.value = `${Math.round(reverbValue * 100)}`;
      revVal.textContent = `${Math.round(reverbValue * 100)}%`;
    }
    if (rGain) {
      rGain.gain.value = reverbValue;
    }
    if (dGain) {
      dGain.gain.value = Math.max(0.24, 0.78 - reverbValue * 0.32);
    }

    applySoundSettingsToEngine();
    syncMoodPresetControl();

    if (typeof saved.musicEnabled === "boolean") {
      setMusicEnabled(saved.musicEnabled, { markCustom: false });
    } else {
      syncToggleButtons();
    }
    if (typeof saved.kickEnabled === "boolean") {
      setKickEnabled(saved.kickEnabled, { markCustom: false });
    } else {
      syncToggleButtons();
    }
    if (typeof saved.noiseEnabled === "boolean") {
      setNoiseEnabled(saved.noiseEnabled, { markCustom: false });
    }

    if (typeof saved.focusModeEnabled === "boolean") {
      setFocusMode(saved.focusModeEnabled, { persist: false });
    } else {
      setFocusMode(false, { persist: false });
    }

    if (typeof saved.focusTimerMinutes === "number") {
      focusTimerMinutes = Math.max(5, Math.min(60, Math.round(saved.focusTimerMinutes)));
    } else {
      focusTimerMinutes = 25;
    }
    const timerCtrl = document.getElementById("focusTimerMinutesCtrl");
    if (timerCtrl) {
      timerCtrl.value = `${focusTimerMinutes}`;
    }

    focusTodoItems = Array.isArray(saved.focusTodoItems)
      ? saved.focusTodoItems
          .filter((item) => item && typeof item.text === "string")
          .slice(0, 20)
          .map((item) => ({
            text: item.text.slice(0, 120),
            done: !!item.done,
          }))
      : [];
    renderFocusTodoList();

    const notesEl = document.getElementById("focusNotes");
    if (notesEl && typeof saved.focusNotes === "string") {
      notesEl.value = saved.focusNotes;
    }

    const savedEndsAt = typeof saved.focusTimerEndsAtMs === "number" ? saved.focusTimerEndsAtMs : 0;
    if (saved.focusTimerRunning && savedEndsAt > Date.now()) {
      focusTimerRunning = true;
      focusTimerEndsAtMs = savedEndsAt;
      if (focusTimerIntervalId) {
        clearInterval(focusTimerIntervalId);
      }
      focusTimerIntervalId = setInterval(renderFocusTimer, 250);
    } else {
      focusTimerRunning = false;
      focusTimerEndsAtMs = 0;
      if (focusTimerIntervalId) {
        clearInterval(focusTimerIntervalId);
        focusTimerIntervalId = null;
      }
    }
    renderFocusTimer();
  } finally {
    persistSuppressed = false;
  }
}

function createNoiseBuffer(ctx, durationSeconds) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function initAudio() {
  actx = new (window.AudioContext || window.webkitAudioContext)();

  mGain = actx.createGain();
  mGain.gain.value = 0.58;
  kickBus = actx.createGain();
  kickBus.gain.value = SOUND_SETTINGS.kickBusGain;
  hatBus = actx.createGain();
  hatBus.gain.value = SOUND_SETTINGS.hatBusGain;
  noiseBus = actx.createGain();
  noiseBus.gain.value = 0;
  noiseNode = null;

  melodyHP = actx.createBiquadFilter();
  melodyHP.type = "highpass";
  melodyHP.frequency.value = 78;
  melodyHP.Q.value = 0.72;

  melodyLP = actx.createBiquadFilter();
  melodyLP.type = "lowpass";
  melodyLP.frequency.value = 7800;
  melodyLP.Q.value = 0.78;

  kickHP = actx.createBiquadFilter();
  kickHP.type = "highpass";
  kickHP.frequency.value = SOUND_SETTINGS.kickHPFreq;
  kickHP.Q.value = SOUND_SETTINGS.kickHPQ;

  kickMidDip = actx.createBiquadFilter();
  kickMidDip.type = "peaking";
  kickMidDip.frequency.value = SOUND_SETTINGS.kickMidFreq;
  kickMidDip.Q.value = SOUND_SETTINGS.kickMidQ;
  kickMidDip.gain.value = SOUND_SETTINGS.kickMidGain;

  kickLP = actx.createBiquadFilter();
  kickLP.type = "lowpass";
  kickLP.frequency.value = SOUND_SETTINGS.kickLPFreq;
  kickLP.Q.value = SOUND_SETTINGS.kickLPQ;

  anlz = actx.createAnalyser();
  anlz.fftSize = 2048;
  anlz.smoothingTimeConstant = 0.82;
  for (let i = 0; i < voiceAnalyzers.length; i++) {
    const az = actx.createAnalyser();
    az.fftSize = 1024;
    az.smoothingTimeConstant = 0.78;
    voiceAnalyzers[i] = az;
  }
  kickAnalyser = actx.createAnalyser();
  kickAnalyser.fftSize = 1024;
  kickAnalyser.smoothingTimeConstant = 0.74;
  hatAnalyser = actx.createAnalyser();
  hatAnalyser.fftSize = 1024;
  hatAnalyser.smoothingTimeConstant = 0.74;

  document.getElementById("fftVal").textContent = "2048";

  dGain = actx.createGain();
  const revCtrl = document.getElementById("revCtrl");
  const revPct = revCtrl ? +revCtrl.value : 80;
  const revValue = Math.max(0, Math.min(1, revPct / 100));
  dGain.gain.value = Math.max(0.24, 0.78 - revValue * 0.32);
  rGain = actx.createGain();
  rGain.gain.value = revValue;
  melodyGate = actx.createGain();
  melodyGate.gain.value = 1;
  kickGate = actx.createGain();
  kickGate.gain.value = 1;
  hatGate = actx.createGain();
  hatGate.gain.value = 1;

  conv = makeRev(actx);
  hatNoiseBuffer = createNoiseBuffer(actx, 0.22);

  mGain.connect(melodyHP);
  melodyHP.connect(melodyLP);
  melodyLP.connect(melodyGate);
  melodyGate.connect(dGain);
  melodyGate.connect(rGain);

  kickBus.connect(kickHP);
  kickHP.connect(kickMidDip);
  kickMidDip.connect(kickLP);
  kickLP.connect(kickGate);
  kickGate.connect(dGain);
  kickGate.connect(kickAnalyser);

  hatBus.connect(hatGate);
  hatGate.connect(dGain);
  hatGate.connect(rGain);
  hatGate.connect(hatAnalyser);

  noiseBus.connect(dGain);
  noiseBus.connect(rGain);

  dGain.connect(anlz);
  rGain.connect(conv);
  conv.connect(anlz);
  anlz.connect(actx.destination);

  updateNoise();
  applyMusicMuteState();
  setNoiseEnabled(noiseEnabled, { markCustom: false });
  syncToggleButtons();
}

function makeRev(c) {
  const cv = c.createConvolver();
  const sr = c.sampleRate;
  const len = Math.floor(sr * 2.2);
  const buf = c.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
    }
  }
  cv.buffer = buf;
  return cv;
}

function createPinkNoise(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function createBrownNoise(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }
  return buffer;
}

function createWhiteNoise(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function updateNoise() {
  if (!actx || !noiseBus) return;
  
  if (noiseNode) {
    noiseNode.stop();
    noiseNode.disconnect();
    noiseNode = null;
  }
  
  if (NOISE_TYPE === "off") {
    noiseBus.gain.value = 0;
    return;
  }

  if (!noiseEnabled) {
    noiseBus.gain.value = 0;
    return;
  }

  if (!playing) {
    noiseBus.gain.value = 0;
    return;
  }
  
  let buffer;
  if (NOISE_TYPE === "white") {
    buffer = createWhiteNoise(actx);
  } else if (NOISE_TYPE === "pink") {
    buffer = createPinkNoise(actx);
  } else if (NOISE_TYPE === "brown") {
    buffer = createBrownNoise(actx);
  }
  
  noiseNode = actx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;
  
  const noiseFilter = actx.createBiquadFilter();
  if (NOISE_TYPE === "white") {
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 8000;
  } else if (NOISE_TYPE === "pink") {
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 4000;
  } else if (NOISE_TYPE === "brown") {
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 400;
  }
  
  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseBus);
  noiseBus.gain.value = NOISE_LVL;

  noiseNode.start();
}

function addSawMotion(osc, flt, amp, baseLevel, t, dur, info) {
  const tail = dur + 0.16;

  flt.type = "lowpass";
  const baseCut = Math.min(1800, Math.max(720, info.f * 0.85));
  flt.frequency.setValueAtTime(baseCut, t);
  flt.Q.setValueAtTime(1.1, t);

  const filtLFO = actx.createOscillator();
  const filtDepth = actx.createGain();
  filtLFO.type = "sine";
  filtLFO.frequency.value = 0.22 + BPM / 180;
  filtDepth.gain.setValueAtTime(Math.min(420, 180 + info.f * 0.16), t);
  filtLFO.connect(filtDepth);
  filtDepth.connect(flt.frequency);

  const fmOsc = actx.createOscillator();
  const fmDepth = actx.createGain();
  fmOsc.type = "sine";
  fmOsc.frequency.value = 1.7 + info.f / 520;
  fmDepth.gain.setValueAtTime(Math.min(18, 4 + info.f * 0.005), t);
  fmOsc.connect(fmDepth);
  fmDepth.connect(osc.frequency);

  const amOsc = actx.createOscillator();
  const amDepth = actx.createGain();
  amOsc.type = "triangle";
  amOsc.frequency.value = 2.1 + BPM / 96;
  amp.gain.setValueAtTime(0.88 * baseLevel, t);
  amDepth.gain.setValueAtTime(0.16 * baseLevel, t);
  amOsc.connect(amDepth);
  amDepth.connect(amp.gain);

  filtLFO.start(t);
  fmOsc.start(t);
  amOsc.start(t);

  filtLFO.stop(t + tail);
  fmOsc.stop(t + tail);
  amOsc.stop(t + tail);
}

function playNote(vi, t, info, curStep) {
  if (musicMuted) {
    return;
  }
  const v = VD[vi];
  const beat = 60 / BPM;
  const dur = v.dur(beat);
  const osc = actx.createOscillator();
  const flt = actx.createBiquadFilter();
  const env = actx.createGain();
  const amp = actx.createGain();

  osc.type = v.wv;
  osc.frequency.value = info.f;
  flt.type = v.ft;
  flt.frequency.value = v.ff;
  flt.Q.value = v.fq;
  const oscLevel = OSC_LVLS[vi] ?? 0.50;
  amp.gain.value = oscLevel;

  const pk = v.gn;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(pk, t + v.at);
  env.gain.exponentialRampToValueAtTime(pk * 0.55, t + Math.max(v.at + 0.01, dur * 0.3));
  env.gain.setValueAtTime(pk * 0.55, t + Math.max(dur - 0.14, dur * 0.65));
  env.gain.linearRampToValueAtTime(0.0001, t + dur + v.rl);

  if (v.wv === "sawtooth") {
    addSawMotion(osc, flt, amp, oscLevel, t, dur, info);
  }

  osc.connect(flt);
  flt.connect(env);
  env.connect(amp);
  amp.connect(mGain);
  amp.connect(voiceAnalyzers[vi]);
  osc.start(t);
  osc.stop(t + dur + v.rl + 0.1);

  const delay = Math.max(0, (t - actx.currentTime) * 1000);
  setTimeout(() => {
    vcur[vi] = info;
    updateCard(vi, curStep);
    const card = document.getElementById(`c${vi}`);
    if (card) {
      card.classList.add("fire");
      setTimeout(() => card.classList.remove("fire"), 150);
    }
  }, delay);
}

function sawLegatoTargetGain() {
  const v = VD[SAW_LEGATO_VOICE_INDEX];
  const oscLevel = OSC_LVLS[SAW_LEGATO_VOICE_INDEX] ?? 0.5;
  return Math.max(0.0001, v.gn * 0.95 * oscLevel);
}

function sawLegatoCutoff(freq) {
  return Math.min(2200, Math.max(700, freq * 0.92));
}

function stopSawLegatoVoice(stopTime = actx ? actx.currentTime : 0) {
  if (!sawLegatoVoice || !actx) {
    sawLegatoVoice = null;
    return;
  }
  const voice = sawLegatoVoice;
  sawLegatoVoice = null;
  const releaseAt = Math.max(stopTime, actx.currentTime);
  voice.amp.gain.cancelScheduledValues(releaseAt);
  voice.amp.gain.setTargetAtTime(0.0001, releaseAt, 0.045);
  voice.osc.stop(releaseAt + 0.22);
  voice.osc.onended = () => {
    voice.osc.disconnect();
    voice.flt.disconnect();
    voice.amp.disconnect();
  };
}

function playSawLegato(vi, t, info, curStep) {
  if (!actx || !mGain || musicMuted) {
    return;
  }

  const startAt = Math.max(t, actx.currentTime);
  const targetGain = sawLegatoTargetGain();
  const targetCutoff = sawLegatoCutoff(info.f);
  let isNewVoice = false;
  if (!sawLegatoVoice) {
    isNewVoice = true;
    const osc = actx.createOscillator();
    const flt = actx.createBiquadFilter();
    const amp = actx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(info.f, startAt);
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(Math.max(220, targetCutoff * 0.30), startAt);
    flt.frequency.linearRampToValueAtTime(targetCutoff, startAt + SAW_START_FILTER_SWELL_SECONDS);
    flt.Q.setValueAtTime(1.05, startAt);
    amp.gain.setValueAtTime(0.0001, startAt);
    amp.gain.linearRampToValueAtTime(targetGain, startAt + SAW_START_ATTACK_SECONDS);
    osc.connect(flt);
    flt.connect(amp);
    amp.connect(mGain);
    if (voiceAnalyzers[vi]) {
      amp.connect(voiceAnalyzers[vi]);
    }
    osc.start(startAt);
    sawLegatoVoice = { osc, flt, amp };
  }

  const glideTau = SAW_MONO_GLIDE_SECONDS / 4;
  sawLegatoVoice.osc.frequency.cancelScheduledValues(startAt);
  sawLegatoVoice.osc.frequency.setTargetAtTime(info.f, startAt, glideTau);
  sawLegatoVoice.flt.frequency.cancelScheduledValues(startAt);
  if (!isNewVoice) {
    sawLegatoVoice.flt.frequency.setTargetAtTime(targetCutoff, startAt, glideTau);
    sawLegatoVoice.amp.gain.cancelScheduledValues(startAt);
    sawLegatoVoice.amp.gain.setTargetAtTime(targetGain, startAt, 0.04);
  }

  const delay = Math.max(0, (startAt - actx.currentTime) * 1000);
  setTimeout(() => {
    vcur[vi] = info;
    updateCard(vi, curStep);
    const card = document.getElementById(`c${vi}`);
    if (card) {
      card.classList.add("fire");
      setTimeout(() => card.classList.remove("fire"), 150);
    }
  }, delay);
}

function duckMelodyForKick(t) {
  if (!mGain) {
    return;
  }
  mGain.gain.cancelScheduledValues(t);
  mGain.gain.setValueAtTime(0.58, t);
  mGain.gain.linearRampToValueAtTime(0.46, t + 0.010);
  mGain.gain.exponentialRampToValueAtTime(0.58, t + 0.19);
}

function playKick(t, accent) {
  if (!actx || !kickBus || kickMuted || musicMuted) {
    return;
  }

  duckMelodyForKick(t);

  const body = actx.createOscillator();
  const bodyEnv = actx.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(118, t);
  body.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  bodyEnv.gain.setValueAtTime(0.0001, t);
  bodyEnv.gain.exponentialRampToValueAtTime(SOUND_SETTINGS.kickBodyPeak * accent, t + 0.022);
  bodyEnv.gain.exponentialRampToValueAtTime(
    SOUND_SETTINGS.kickBodySustain * accent,
    t + SOUND_SETTINGS.kickBodySustainTime
  );
  bodyEnv.gain.exponentialRampToValueAtTime(0.0001, t + SOUND_SETTINGS.kickBodyReleaseTime);
  body.connect(bodyEnv);
  bodyEnv.connect(kickBus);
  body.start(t);
  body.stop(t + SOUND_SETTINGS.kickBodyStopTime);

  const click = actx.createOscillator();
  const clickEnv = actx.createGain();
  click.type = "sine";
  click.frequency.setValueAtTime(900, t);
  click.frequency.exponentialRampToValueAtTime(280, t + 0.014);
  clickEnv.gain.setValueAtTime(0.0001, t);
  clickEnv.gain.exponentialRampToValueAtTime(SOUND_SETTINGS.kickClickPeak * accent, t + 0.0032);
  clickEnv.gain.setValueAtTime(SOUND_SETTINGS.kickClickHold * accent, t + 0.008);
  clickEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.036);
  click.connect(clickEnv);
  clickEnv.connect(kickBus);
  click.start(t);
  click.stop(t + 0.07);
}

function getHatEvent(curStep) {
  const pattern = HAT_PATTERNS[HAT_MODE] || HAT_PATTERNS.fibonacci;
  if (!pattern.steps[curStep]) {
    return null;
  }

  const stepDur = (60 / BPM) / 4;
  const isOffbeat = curStep % 4 === 2;
  const offset = pattern.swingPush && isOffbeat ? stepDur * pattern.swingPush : 0;
  const accent = curStep === 0 ? 0.95 : isOffbeat ? 0.72 : 0.82;
  const open = (pattern.open || []).includes(curStep);

  return { offset, accent, open };
}

function playHat(t, accent, open) {
  if (!actx || !hatBus || !hatNoiseBuffer || musicMuted) {
    return;
  }

  const src = actx.createBufferSource();
  src.buffer = hatNoiseBuffer;

  const hp = actx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = open ? 5200 : 6400;
  hp.Q.value = 0.7;

  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = open ? 7600 : 9200;
  bp.Q.value = open ? 0.9 : 0.7;

  const env = actx.createGain();
  const decay = open ? 0.13 : 0.05;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime((open ? 0.13 : 0.10) * accent, t + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(env);
  env.connect(hatBus);

  src.start(t);
  src.stop(t + decay + 0.03);
}

function scheduleStep(stepTime, stepIndex) {
  const ctx = getHarmonyContext(stepIndex);
  const stepState = { tensionCount: 0, upperTensionUsed: false };
  const curStep = stepIndex % STEPS_PER_BAR;
  if (ctx.stepInBar === 0 && ctx.bar > 0 && ctx.bar % 8 === 0) {
    const nextIndex = (autoHatIndex + 1) % HAT_PATTERN_KEYS.length;
    applyHatPattern(HAT_PATTERN_KEYS[nextIndex]);
  }

  if (!musicMuted) {
    if (KICK_PATTERN[curStep] && !kickMuted) {
      playKick(stepTime, curStep === 0 ? 1.0 : 0.78);
    }

    const hatEvent = getHatEvent(curStep);
    if (hatEvent) {
      playHat(stepTime + hatEvent.offset, hatEvent.accent, hatEvent.open);
    }

    for (let vi = 0; vi < 4; vi++) {
      if (VD[vi].pat[curStep]) {
        const noteInfo = getFreq(vi, ctx, stepState);
        if (vi === SAW_LEGATO_VOICE_INDEX && VD[vi].wv === "sawtooth") {
          playSawLegato(vi, stepTime, noteInfo, curStep);
        } else {
          playNote(vi, stepTime, noteInfo, curStep);
        }
      }
      updateCard(vi, curStep);
    }
  } else {
    for (let vi = 0; vi < 4; vi++) {
      updateCard(vi, curStep);
    }
  }

  if (ctx.stepInBar === 0 && playing) {
    setRunningStatus(stepIndex);
  }
}

function tick() {
  if (!playing || !actx) {
    return;
  }
  const now = actx.currentTime;
  while (nextStepTime < now + 0.1) {
    scheduleStep(nextStepTime, globalStep);
    const stepDur = (60 / BPM) / 4;
    nextStepTime += stepDur;
    globalStep += 1;
  }
}

const cv = document.getElementById("scope");
const cx = cv.getContext("2d");
const harmonyCanvases = [
  document.getElementById("scopeHarmony1"),
  document.getElementById("scopeHarmony2"),
  document.getElementById("scopeHarmony3"),
  document.getElementById("scopeHarmony4"),
];
const rhythmCanvases = [
  document.getElementById("scopeRhythmKick"),
  document.getElementById("scopeRhythmHat"),
];
const harmonyCtx = harmonyCanvases.map((canvas) => canvas.getContext("2d"));
const rhythmCtx = rhythmCanvases.map((canvas) => canvas.getContext("2d"));

const HISTORY_SIZE = 8192;
let sampleHistory = new Float32Array(HISTORY_SIZE);
let historyPos = 0;
let lastPeakDb = -60;
const MASTER_SCOPE_ZOOM = 24;
const MASTER_SCOPE_GAIN = 3.8;
const SCOPE_REFRESH_INTERVAL_MS = 1000 / 23;
let scopeNextDrawTime = 0;

function rsz() {
  const dpr = window.devicePixelRatio || 1;
  cv.width = cv.offsetWidth * dpr;
  cv.height = cv.offsetHeight * dpr;
  harmonyCanvases.forEach((canvas) => {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  });
  rhythmCanvases.forEach((canvas) => {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  });
}

function drawWaveform(buf, w, h, color, lw, gainBoost = 1) {
  cx.strokeStyle = color;
  cx.lineWidth = lw;
  cx.beginPath();
  const sl = w / buf.length;
  for (let i = 0; i < buf.length; i++) {
    const sample = Math.max(-1, Math.min(1, buf[i] * gainBoost));
    const y = ((sample + 1) / 2) * h;
    if (i === 0) {
      cx.moveTo(0, y);
    } else {
      cx.lineTo(i * sl, y);
    }
  }
  cx.stroke();
}

function drawMiniScope(ctx2d, canvasEl, analyzer, activeColor, gainBoost = 1) {
  if (!ctx2d || !canvasEl) {
    return;
  }
  const w = canvasEl.width;
  const h = canvasEl.height;
  ctx2d.fillStyle = "rgba(4,4,3,0.55)";
  ctx2d.fillRect(0, 0, w, h);
  ctx2d.strokeStyle = "#141412";
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.moveTo(0, h / 2);
  ctx2d.lineTo(w, h / 2);
  ctx2d.stroke();

  if (!analyzer || !playing) {
    return;
  }

  const buf = new Float32Array(analyzer.fftSize);
  analyzer.getFloatTimeDomainData(buf);
  const step = w / buf.length;
  ctx2d.strokeStyle = activeColor;
  ctx2d.lineWidth = 1.1;
  ctx2d.beginPath();
  for (let i = 0; i < buf.length; i++) {
    const sample = Math.max(-1, Math.min(1, buf[i] * gainBoost));
    const y = ((sample + 1) / 2) * h;
    if (i === 0) {
      ctx2d.moveTo(0, y);
    } else {
      ctx2d.lineTo(i * step, y);
    }
  }
  ctx2d.stroke();
}

function draw() {
  requestAnimationFrame(draw);
  const nowMs = performance.now();
  if (nowMs < scopeNextDrawTime) {
    return;
  }
  scopeNextDrawTime = nowMs + SCOPE_REFRESH_INTERVAL_MS;
  const w = cv.width;
  const h = cv.height;
  cx.fillStyle = "rgba(4,4,3,0.35)";
  cx.fillRect(0, 0, w, h);

  cx.strokeStyle = "#141412";
  cx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    cx.beginPath();
    cx.moveTo(0, (h / 4) * i);
    cx.lineTo(w, (h / 4) * i);
    cx.stroke();
  }
  for (let i = 1; i < 8; i++) {
    cx.beginPath();
    cx.moveTo((w / 8) * i, 0);
    cx.lineTo((w / 8) * i, h);
    cx.stroke();
  }
  
  cx.strokeStyle = "#1a1a18";
  cx.lineWidth = 1;
  cx.beginPath();
  cx.moveTo(0, h/2);
  cx.lineTo(w, h/2);
  cx.stroke();

  const meterFill = document.getElementById("meterFill");
  const hzEl = document.getElementById("hzVal");
  if (!anlz || !playing) {
    cx.strokeStyle = "#242420";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(0, h / 2);
    cx.lineTo(w, h / 2);
    cx.stroke();
    if (meterFill) {
      meterFill.style.width = "0%";
      meterFill.className = "meter-fill";
    }
    if (hzEl) {
      hzEl.textContent = "—";
    }
  } else {
    const buf = new Float32Array(anlz.fftSize);
    anlz.getFloatTimeDomainData(buf);

    let sum = 0;
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
      const abs = Math.abs(buf[i]);
      sum += abs * abs;
      if (abs > peak) peak = abs;
    }
    const rms = Math.sqrt(sum / buf.length);
    const db = rms > 0 ? 20 * Math.log10(rms) : -60;
    const peakDb = peak > 0 ? 20 * Math.log10(peak) : -60;
    if (meterFill) {
      const meterPercent = Math.max(0, Math.min(100, (db + 60) * 1.67));
      meterFill.style.width = `${meterPercent}%`;
      meterFill.className = `meter-fill${peakDb > -6 ? " hot" : ""}`;
    }
    if (hzEl) {
      hzEl.textContent = peak > 0.01 ? `${Math.round(rms * 1000)}` : "—";
    }

    for (let i = 0; i < buf.length; i++) {
      sampleHistory[(historyPos + i) % HISTORY_SIZE] = buf[i];
    }
    historyPos = (historyPos + buf.length) % HISTORY_SIZE;

    const displayLen = Math.max(16, Math.min(HISTORY_SIZE, Math.round((w * 4) / MASTER_SCOPE_ZOOM)));
    const drawBuf = new Float32Array(displayLen);
    for (let i = 0; i < displayLen; i++) {
      const srcIdx = (historyPos - displayLen + i + HISTORY_SIZE) % HISTORY_SIZE;
      drawBuf[i] = sampleHistory[srcIdx];
    }

    drawWaveform(drawBuf, w, h, "rgba(212,146,12,0.07)", 8, MASTER_SCOPE_GAIN);
    drawWaveform(drawBuf, w, h, "#d4920c", 1.3, MASTER_SCOPE_GAIN);
  }

  const harmonyBoosts = [8.0, 16.0, 16.0, 16.0];
  for (let i = 0; i < harmonyCtx.length; i++) {
    drawMiniScope(
      harmonyCtx[i],
      harmonyCanvases[i],
      voiceAnalyzers[i],
      "#d4920c",
      harmonyBoosts[i] ?? 16.0
    );
  }
  drawMiniScope(rhythmCtx[0], rhythmCanvases[0], kickAnalyser, "#208898", 2.2);
  drawMiniScope(rhythmCtx[1], rhythmCanvases[1], hatAnalyser, "#b84020", 16.0);
}

function buildCards() {
  const el = document.getElementById("cards");
  el.innerHTML = "";
  VD.forEach((v, vi) => {
    const d = document.createElement("div");
    d.className = "card";
    d.id = `c${vi}`;
    const oscPct = Math.round((OSC_LVLS[vi] ?? 0.50) * 100);
    d.innerHTML =
      `<div class="c-idx">V${vi + 1} · OCT +${v.oct}</div>` +
      `<div class="c-wv">${v.wv.toUpperCase()}</div>` +
      `<div class="c-pn">${v.pn}</div>` +
      `<div class="c-hz" id="cf${vi}">—<span class="u"> Hz</span></div>` +
      `<div class="c-rt" id="cr${vi}">—:—</div>` +
      `<div class="c-mt pure" id="cm${vi}">—</div>` +
      `<div class="card-lvl">` +
      `<span class="card-lvl-lbl">OSC LVL</span>` +
      `<input type="range" id="osc${vi + 1}LvlCtrl" min="0" max="100" value="${oscPct}" step="1">` +
      `<span class="card-lvl-val" id="osc${vi + 1}LvlVal">${oscPct}%</span>` +
      `</div>` +
      `<div class="dots" id="cd${vi}">${v.pat
        .map((b, j) => `<div class="dot${b ? " hit" : ""}" id="d${vi}_${j}"></div>`)
        .join("")}</div>`;
    el.appendChild(d);
  });
  bindOscLevelControls();
}

function bindOscLevelControls() {
  for (let i = 0; i < OSC_LVLS.length; i++) {
    const ctrl = document.getElementById(`osc${i + 1}LvlCtrl`);
    const val = document.getElementById(`osc${i + 1}LvlVal`);
    if (!ctrl || !val) {
      continue;
    }
    const pct = Math.round((OSC_LVLS[i] ?? 0.50) * 100);
    ctrl.value = `${pct}`;
    val.textContent = `${pct}%`;
    ctrl.title = `Oscillator ${i + 1} level`;
    ctrl.oninput = (e) => {
      markMoodPresetCustom();
      const nextPct = +e.target.value;
      OSC_LVLS[i] = nextPct / 100;
      val.textContent = `${nextPct}%`;
      if (i === SAW_LEGATO_VOICE_INDEX && sawLegatoVoice && actx) {
        const now = actx.currentTime;
        sawLegatoVoice.amp.gain.cancelScheduledValues(now);
        sawLegatoVoice.amp.gain.setTargetAtTime(sawLegatoTargetGain(), now, 0.03);
      }
      persistSettings();
    };
  }
}

function updateCard(vi, curStep) {
  const info = vcur[vi];
  if (info && info.f) {
    const fe = document.getElementById(`cf${vi}`);
    if (fe) {
      fe.innerHTML = `${info.f.toFixed(1)}<span class="u"> Hz</span>`;
    }
    const re = document.getElementById(`cr${vi}`);
    if (re) {
      re.innerHTML = `<em>${info.n}:${info.d}</em> = ${(info.n / info.d).toFixed(4)}`;
    }
    const me = document.getElementById(`cm${vi}`);
    if (me) {
      me.textContent = info.mt === "SUM" ? `SUM: ${info.l}` : info.l;
      me.className = `c-mt ${info.mt.toLowerCase()}`;
    }
  }

  VD[vi].pat.forEach((_, j) => {
    const dot = document.getElementById(`d${vi}_${j}`);
    if (dot) {
      dot.className = `dot${VD[vi].pat[j] ? " hit" : ""}${j === curStep ? " now" : ""}`;
    }
  });
}

document.getElementById("playBtn").addEventListener("click", () => {
  if (!playing) {
    if (!actx) {
      initAudio();
    } else if (actx.state === "suspended") {
      actx.resume();
    }
    playing = true;
    updateNoise();
    resetMusicalState();
    nextStepTime = actx.currentTime + 0.05;
    document.getElementById("playBtn").textContent = "■ STOP";
    document.getElementById("playBtn").classList.add("on");
    setRunningStatus(globalStep);
    tid = setInterval(tick, 25);
  } else {
    playing = false;
    clearInterval(tid);
    stopSawLegatoVoice(actx ? actx.currentTime : 0);
    if (noiseNode) {
      noiseNode.stop();
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (noiseBus) {
      noiseBus.gain.value = 0;
    }
    document.getElementById("playBtn").textContent = "▶ PLAY";
    document.getElementById("playBtn").classList.remove("on");
    setIdleStatus();
  }
});

document.getElementById("baseCtrl").addEventListener("input", (e) => {
  markMoodPresetCustom();
  BASE = +e.target.value;
  document.getElementById("baseVal").textContent = `${BASE} Hz`;
  persistSettings();
});

document.getElementById("scaleCtrl").addEventListener("change", (e) => {
  markMoodPresetCustom();
  applyScale(e.target.value);
  persistSettings();
});

document.getElementById("hatCtrl").addEventListener("change", (e) => {
  markMoodPresetCustom();
  applyHatPattern(e.target.value);
  persistSettings();
});

document.getElementById("bpmCtrl").addEventListener("input", (e) => {
  markMoodPresetCustom();
  BPM = +e.target.value;
  document.getElementById("bpmVal").textContent = `${BPM} BPM`;
  persistSettings();
});

document.getElementById("oddCtrl").addEventListener("input", (e) => {
  markMoodPresetCustom();
  ODD_SL = +e.target.value / 100;
  document.getElementById("oddVal").textContent = `${e.target.value}%`;
  persistSettings();
});

document.getElementById("revCtrl").addEventListener("input", (e) => {
  markMoodPresetCustom();
  const rv = +e.target.value / 100;
  if (rGain) {
    rGain.gain.value = rv;
  }
  if (dGain) {
    dGain.gain.value = Math.max(0.24, 0.78 - rv * 0.32);
  }
  document.getElementById("revVal").textContent = `${e.target.value}%`;
  persistSettings();
});

document.getElementById("moodPresetCtrl").addEventListener("change", (e) => {
  applyMoodPreset(e.target.value);
});

document.getElementById("noiseCtrl").addEventListener("change", (e) => {
  markMoodPresetCustom();
  NOISE_TYPE = e.target.value;
  document.getElementById("noiseVal").textContent = e.target.options[e.target.selectedIndex].text;
  updateNoise();
  persistSettings();
});

document.getElementById("noiseLvlCtrl").addEventListener("input", (e) => {
  markMoodPresetCustom();
  NOISE_LVL = +e.target.value / 100;
  if (noiseBus) {
    noiseBus.gain.value = !noiseEnabled || NOISE_TYPE === "off" || !playing ? 0 : NOISE_LVL;
  }
  document.getElementById("noiseLvlVal").textContent = `${e.target.value}%`;
  persistSettings();
});

document.getElementById("musicToggleBtn").addEventListener("click", () => {
  setMusicEnabled(musicMuted);
});

document.getElementById("kickToggleBtn").addEventListener("click", () => {
  setKickEnabled(kickMuted);
});

document.getElementById("noiseToggleBtn").addEventListener("click", () => {
  setNoiseEnabled(!noiseEnabled);
});

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (e.repeat || (key !== "m" && key !== "k" && key !== "n" && key !== "f")) {
    return;
  }
  const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
  if (tag === "input" || tag === "select" || tag === "textarea") {
    return;
  }
  if (key === "m") {
    setMusicEnabled(musicMuted);
  } else if (key === "k") {
    setKickEnabled(kickMuted);
  } else if (key === "f") {
    setFocusMode(!focusModeEnabled);
  } else {
    setNoiseEnabled(!noiseEnabled);
  }
});

window.addEventListener("resize", rsz);
buildCards();
bindFocusModeControls();
applyControlTooltips();
syncMoodPresetControl();
applyScale(SCALE_MODE);
applyHatPattern(HAT_MODE);
applyStoredSettings();
setIdleStatus();
rsz();
draw();
