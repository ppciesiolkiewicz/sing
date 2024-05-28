export const KEY_TO_NOTE_MAP = {
  1: "C2",
  2: "Db2",
  3: "D2",
  4: "Eb2",
  5: "E2",
  6: "F2",
  7: "Gb2",
  8: "G2",
  9: "Ab2",
  0: "A2",
  "-": "Bb2",
  "=": "B2",

  q: "C3",
  w: "Db3",
  e: "D3",
  r: "Eb3",
  t: "E3",
  y: "F3",
  u: "Gb3",
  i: "G3",
  o: "Ab3",
  p: "A3",
  "[": "Bb3",
  "]": "B3",

  a: "C4",
  s: "Db4",
  d: "D4",
  f: "Eb4",
  g: "E4",
  h: "F4",
  j: "Gb4",
  k: "G4",
  l: "Ab4",
  ";": "A4",
  "'": "Bb4",
  enter: "B4",

  z: "C5",
  x: "Db5",
  c: "D5",
  v: "Eb5",
  b: "E5",
  n: "F5",
  m: "Gb5",
  ",": "G5",
  ".": "Ab5",
  "/": "A5",
  shift: "Bb5",
};

export const NOTE_TO_KEY_MAP = Object.keys(KEY_TO_NOTE_MAP).reduce(
  (acc, key) => {
    return {
      ...acc,
      [KEY_TO_NOTE_MAP[key]]: key,
    };
  },
  {}
);
