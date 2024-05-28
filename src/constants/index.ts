export const CONFIG_TYPE_INTERVAL = "Interval";
export const CONFIG_TYPE_SCALE = "Scale";
export const CONFIG_TYPE_CHORDS = "Chords";
export const CONFIG_TYPE_NOTES = "Notes";
export type ConfigType =
  | typeof CONFIG_TYPE_CHORDS
  | typeof CONFIG_TYPE_INTERVAL
  | typeof CONFIG_TYPE_SCALE
  | typeof CONFIG_TYPE_NOTES;

// TODO: modifiers https://en.wikipedia.org/wiki/Note_value ?
// Or maybe WHOLE: 4 since it's 4 beats?
export const NOTE_VALUE = {
  WHOLE: 1,
  HALF: 1 / 2,
  HALF_MODIFIER1: 1 / 2 + 1 / 4,
  QUARTER: 1 / 4,
  QUARTER_MODIFIER1: 1 / 4 + 1 / 8,
  EIGHTH: 1 / 8,
  EIGHTH_MODIFIER1: 1 / 8 + 1 / 16,
  SIXTEENTH: 1 / 16,
  SIXTEENTH_MODIFIER1: 1 / 16 + 1 / 32,
};

export const DIFFICULTY_LEVEL_EASY = "EASY";
export const DIFFICULTY_LEVEL_MEDIUM = "MEDIUM";
export const DIFFICULTY_LEVEL_HARD = "HARD";

export type DifficultyLevel =
  | typeof DIFFICULTY_LEVEL_EASY
  | typeof DIFFICULTY_LEVEL_MEDIUM
  | typeof DIFFICULTY_LEVEL_HARD;

export const DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP = {
  [DIFFICULTY_LEVEL_EASY]: {
    melodyNoteSelectedMaxFreqCentsDiff: 0.5,
    melodyPercentFrameHitToAccept: 0.3,
  },
  [DIFFICULTY_LEVEL_MEDIUM]: {
    melodyNoteSelectedMaxFreqCentsDiff: 0.3,
    melodyPercentFrameHitToAccept: 0.5,
  },
  [DIFFICULTY_LEVEL_HARD]: {
    melodyNoteSelectedMaxFreqCentsDiff: 0.1,
    melodyPercentFrameHitToAccept: 0.7,
  },
};

export const DIFFICULTY_LEVEL_OPTIONS = [
  {
    label: "Easy",
    value: DIFFICULTY_LEVEL_EASY,
  },
  {
    label: "Medium",
    value: DIFFICULTY_LEVEL_MEDIUM,
  },
  {
    label: "Hard",
    value: DIFFICULTY_LEVEL_HARD,
  },
];

export const INSTRUMENT_PIANO1 = "INSTRUMENT_PIANO1";
export const INSTRUMENT_PIANO2 = "INSTRUMENT_PIANO2";
export const INSTRUMENT_ACCORDION = "INSTRUMENT_ACCORDION";
export const INSTRUMENT_BASSOON = "INSTRUMENT_BASSOON";
export const INSTRUMENT_CELLO = "INSTRUMENT_CELLO";
export const INSTRUMENT_ELEC_PIANO = "INSTRUMENT_ELEC_PIANO";
export const INSTRUMENT_FLUTE = "INSTRUMENT_FLUTE";
export const INSTRUMENT_HONKY_TONK_PIANO = "INSTRUMENT_HONKY_TONK_PIANO";
export const INSTRUMENT_METAL_GUITAR = "INSTRUMENT_METAL_GUITAR";
export const INSTRUMENT_POP_LEAD = "INSTRUMENT_POP_LEAD";
export const INSTRUMENT_SYNTH_ACCORDION = "INSTRUMENT_SYNTH_ACCORDION";
export const INSTRUMENT_SYNTH_BRASS = "INSTRUMENT_SYNTH_BRASS";
export const INSTRUMENT_SYNTH_LEAD = "INSTRUMENT_SYNTH_LEAD";

export const INSTRUMENT_OPTIONS = [
  {
    label: "Piano 1",
    value: INSTRUMENT_PIANO1,
  },
  {
    label: "Piano 2",
    value: INSTRUMENT_PIANO2,
  },
  {
    label: "Accordion",
    value: INSTRUMENT_ACCORDION,
  },
  {
    label: "Bassoon",
    value: INSTRUMENT_BASSOON,
  },
  {
    label: "Cello",
    value: INSTRUMENT_CELLO,
  },
  {
    label: "Electric Piano",
    value: INSTRUMENT_ELEC_PIANO,
  },
  {
    label: "Flute",
    value: INSTRUMENT_FLUTE,
  },
  {
    label: "Honky Tonk Piano",
    value: INSTRUMENT_HONKY_TONK_PIANO,
  },
  {
    label: "Metal Guitar",
    value: INSTRUMENT_METAL_GUITAR,
  },
  {
    label: "Pop Lead",
    value: INSTRUMENT_POP_LEAD,
  },
  {
    label: "Synth Accordion",
    value: INSTRUMENT_SYNTH_ACCORDION,
  },
  {
    label: "Synth Brass",
    value: INSTRUMENT_SYNTH_BRASS,
  },
  {
    label: "Synth Lead",
    value: INSTRUMENT_SYNTH_LEAD,
  },
];

export const INSTRUMENTS = {
  [INSTRUMENT_PIANO1]: {
    urls: {
      G3: "pianoG3.wav",
      C4: "pianoC4.wav",
      G4: "pianoG4.wav",
      C5: "pianoC5.wav",
      G5: "pianoG5.wav",
      C6: "pianoC6.wav",
    },
    baseUrl: "/instruments/PIANO/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_ACCORDION]: {
    urls: {
      C1: "accordionC1.wav",
      C2: "accordionC2.wav",
    },
    baseUrl: "/instruments/ACCORDION/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_BASSOON]: {
    urls: {
      C2: "bassoonC2.wav",
      C3: "bassoonC3.wav",
      C4: "bassoonC4.wav",
      G2: "bassoonG2.wav",
    },
    baseUrl: "/instruments/BASSOON/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_CELLO]: {
    urls: {
      C2: "cello2C2.wav",
      C3: "cello2C3.wav",
      C4: "cello2C4.wav",
    },
    baseUrl: "/instruments/CELLO/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_ELEC_PIANO]: {
    urls: {
      G1: "epianoG1.wav",
      C2: "epianoC2.wav",
      C3: "epianoC3.wav",
      G2: "epianoG2.wav",
      G3: "epianoG3.wav",
    },
    baseUrl: "/instruments/ELEC-PIANO/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_FLUTE]: {
    urls: {
      C1: "fluteC1.wav",
      C2: "fluteC2.wav",
    },
    baseUrl: "/instruments/FLUTE/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_HONKY_TONK_PIANO]: {
    urls: {
      G1: "honkypianoG1.wav",
      C2: "honkypianoC2.wav",
      C3: "honkypianoC3.wav",
      G2: "honkypianoG2.wav",
      G3: "honkypianoG3.wav",
      C4: "honkypianoC4.wav",
    },
    baseUrl: "/instruments/HONKY-TONK-PIANO/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_METAL_GUITAR]: {
    urls: {
      G1: "metalguitarG1.wav",
      C2: "metalguitarC2.wav",
      C3: "metalguitarC3.wav",
      G2: "metalguitarG2.wav",
    },
    baseUrl: "/instruments/METAL-GUITAR/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_POP_LEAD]: {
    urls: {
      G1: "popleadG1.wav",
      G2: "popleadG2.wav",
      G3: "popleadG3.wav",
    },
    baseUrl: "/instruments/POP-LEAD/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_SYNTH_ACCORDION]: {
    urls: {
      G1: "synthaccordionG1.wav",
      G2: "synthaccordionG2.wav",
      G3: "synthaccordionG3.wav",
    },
    baseUrl: "/instruments/SYNTH-ACCORDION/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_SYNTH_BRASS]: {
    urls: {
      C2: "synthbrassC2.wav",
      C3: "synthbrassC3.wav",
      C4: "synthbrassC4.wav",
    },
    baseUrl: "/instruments/SYNTH-BRASS/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_SYNTH_LEAD]: {
    urls: {
      G1: "synthleadG1.wav",
      C2: "synthleadC2.wav",
      C3: "synthleadC3.wav",
      G3: "synthleadG3.wav",
    },
    baseUrl: "/instruments/SYNTH-LEAD/",
    attack: 0,
    release: 0.3,
  },
  [INSTRUMENT_PIANO2]: {
    urls: {
      A1: "A1.mp3",
      A2: "A2.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/casio/",
    attack: 0.2,
    release: 0.1,
  },
};

export type InstrumentType =
  | typeof INSTRUMENT_PIANO1
  | typeof INSTRUMENT_PIANO2
  | typeof INSTRUMENT_ACCORDION
  | typeof INSTRUMENT_BASSOON
  | typeof INSTRUMENT_CELLO
  | typeof INSTRUMENT_ELEC_PIANO
  | typeof INSTRUMENT_FLUTE
  | typeof INSTRUMENT_HONKY_TONK_PIANO
  | typeof INSTRUMENT_METAL_GUITAR
  | typeof INSTRUMENT_POP_LEAD
  | typeof INSTRUMENT_SYNTH_ACCORDION
  | typeof INSTRUMENT_SYNTH_BRASS
  | typeof INSTRUMENT_SYNTH_LEAD;
