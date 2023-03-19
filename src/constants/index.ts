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