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