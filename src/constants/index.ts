export const CONFIG_TYPE_INTERVAL = 'Interval';
export const CONFIG_TYPE_SCALE = 'Scale';
export const CONFIG_TYPE_CHORDS = 'Chords';
export const CONFIG_TYPE_NOTES = 'Notes';

// TODO: modifiers https://en.wikipedia.org/wiki/Note_value ?
// Or maybe WHOLE: 4 since it's 4 beats?
export const NOTE_VALUE = {
  WHOLE: 1,
  HALF: 1/2,
  HALF_MODIFIER1: 1/2 + 1/4,
  QUARTER: 1/4,
  QUARTER_MODIFIER1: 1/4 + 1/8,
  EIGHTH: 1/8,
  EIGHTH_MODIFIER1: 1/8 + 1/16,
  SIXTEENTH: 1/16,
  SIXTEENTH_MODIFIER1: 1/16 + 1/32,
}


export const DIFFICULTY_LEVEL_EASY = 'EASY';
export const DIFFICULTY_LEVEL_MEDIUM = 'MEDIUM';
export const DIFFICULTY_LEVEL_HARD = 'HARD';

export type DifficultyLevel = typeof DIFFICULTY_LEVEL_EASY |
  typeof DIFFICULTY_LEVEL_MEDIUM |
  typeof DIFFICULTY_LEVEL_HARD;

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
}

export const DIFFICULTY_LEVEL_OPTIONS = [
  {
    label: 'Easy',
    value: DIFFICULTY_LEVEL_EASY,
  },
  {
    label: 'Medium',
    value: DIFFICULTY_LEVEL_MEDIUM,
  },
  {
    label: 'Hard',
    value: DIFFICULTY_LEVEL_HARD,
  },
];

export const INSTRUMENT_PIANO1 = 'INSTRUMENT_PIANO1'
export const INSTRUMENT_PIANO2 = 'INSTRUMENT_PIANO2'

export const INSTRUMENT_OPTIONS = [
  {
    label: "Piano 1",
    value: INSTRUMENT_PIANO1,
  },
  {
    label: "Piano 2",
    value: INSTRUMENT_PIANO2,
  }
]

export const INSTRUMENTS = {
  [INSTRUMENT_PIANO1]: {
    urls: {
      G1: "pianoG1.wav",
      C2: "pianoC2.wav",
      C3: "pianoC3.wav",
      G2: "pianoG2.wav",
      G3: "pianoG3.wav",
    },
    baseUrl: "/instruments/piano/",
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
  }
  
}

export type InstrumentType = typeof INSTRUMENT_PIANO1 | typeof INSTRUMENT_PIANO2;