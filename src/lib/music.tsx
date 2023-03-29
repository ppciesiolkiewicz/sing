import times from 'lodash.times';
import { transpose } from '@tonaljs/core';
import {
    Interval as TonalInterval,
    Note as TonalNote,
    Progression as TonalProgression,
    Chord as TonalChord,
    ChordType as TonalChordType,
    Scale as TonalScale,
    Key as TonalKey,
    // TODO: use for generating ranges - https://github.com/tonaljs/tonal/tree/main/packages/range
    Range as TonalRange,
} from '@tonaljs/tonal';


export interface ChordType extends ReturnType<typeof TonalChord.get> {
  readonly suffix: string;
}

export interface ScaleType extends ReturnType<typeof TonalScale.get> {
  readonly chordTypes: ReturnType<typeof TonalScale.scaleChords>;
  readonly keyChords: ReturnType<typeof TonalKey.majorKey>,
  // readonly keyChords: {
  //   triads: ChordType[];
  //   chords: ChordType[];
  // }
}

export type ChordProgressionType = {
  readonly chord: ChordType;
  readonly beats: number;
}[];

export type NoteType = ReturnType<typeof TonalNote.get>;


export const NoteModule = {
    names: () => {
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    },
    get: TonalNote.get,
    simplify: TonalNote.simplify,
    fromFreq: (freq: number): NoteType => {
        const noteName = TonalNote.fromFreq(freq);
        return TonalNote.get(noteName);
    },
    transpose: TonalNote.transpose,
    areNotesEqual: (n1: NoteType, n2: NoteType): boolean => n1.chroma === n2.chroma && (!n1.oct || n1.oct === n2.oct),
    getGuitarNotes: (tuning: string[], fretCount: number): NoteType[][] => {
        return tuning.map(rootNote => {
            return times(fretCount - 1, fretNo => {
                const noteSymbol = transpose(rootNote, TonalInterval.fromSemitones(fretNo));
                const note = TonalNote.get(noteSymbol);

                return note;
            });
        });
    },
    getAllNotes: (lowestNote: number | string, highestNote: number | string) => {
      let MIN_NOTE: NoteType, MAX_NOTE: NoteType;
      // TODO: improve , maybe take Note as param?
      if (typeof lowestNote === 'number') {
        MIN_NOTE = NoteModule.fromFreq(lowestNote)
      } else {
        MIN_NOTE = NoteModule.get(lowestNote)
      }

      if (typeof highestNote === 'number') {
        MAX_NOTE = NoteModule.fromFreq(highestNote);
      } else {
        MAX_NOTE = NoteModule.get(highestNote)
      }

      const OCTAVES = [1,2,3,4,5,6];
      const CHROMATIC_SCALE = ScaleModule.get('C', 'chromatic')
      const CHROMATIC_SCALE_NOTES = OCTAVES
        .map(octave =>
          CHROMATIC_SCALE.notes.map(note => NoteModule.get(`${note}${octave}`))
        )
        .flat()
        .filter(n => n.freq! >= MIN_NOTE.freq! && n.freq! <= MAX_NOTE.freq!)

      return CHROMATIC_SCALE_NOTES;
    },
    centsDistance: (freq: Hz, baseFreq: Hz) => {
      /* How many cents freq is above or below baseFreq */
      return 12 * Math.log2(freq / baseFreq)
    },
    addCents: (freq: Hz, cents: number): Hz => {
      /* 10 cents = 0.1 */
      return freq * Math.pow(2, cents/12)
    },
};

export const ChordModule = {
    get: (chordName: string): ChordType => {
      try {
          const chord = TonalChord.get(chordName);
          const { type, tonic, symbol } = chord;
          const suffix = ['major', 'minor'].indexOf(type) !== -1 ? type : symbol.slice(tonic!.length);

          return {
              ...chord,
              suffix,
          };
      } catch (e) {
          console.log(`[error] ChordModule.get(${chordName})`, e);
          throw e;
      }
    },
    getAllChords: (lowestNoteName: string, hightestNoteName: string): string[] => {
      const chordSymbols = TonalChordType.symbols()
      // const chordSymbols = ['maj', 'min']
      const notes = NoteModule.getAllNotes(lowestNoteName, hightestNoteName)

      return notes.map(n => (
        chordSymbols.map(cs => `${n.name}${cs}`)
      )).flat();
    },
    getAllRelevantChords: (lowestNoteName: string, hightestNoteName: string): string[] => {
      const chordSymbols = ['maj', 'maj7', 'maj9', 'min', 'min7', 'min9', 'sus2', 'sus4', 'aug']
      const notes = NoteModule.getAllNotes(lowestNoteName, hightestNoteName)

      return notes.map(n => (
        chordSymbols.map(cs => `${n.name}${cs}`)
      )).flat();
    }
};

export const ChordProgressionModule = {
    create: (keyTonic: string, progressionNumerals: string[]): ChordProgressionType => {
        progressionNumerals = progressionNumerals || [];
        return TonalProgression.fromRomanNumerals(keyTonic, progressionNumerals).map(chordName => {
            const chord = ChordModule.get(chordName);

            return {
                chord,
                beats: 4,
            };
        });
    },
};

export const ScaleModule = {
    get: (keyTonic: string, keyType: string): ScaleType => {
        const scale = TonalScale.get(`${keyTonic} ${keyType}`);
        const scaleChordTypes = TonalScale.scaleChords(`${keyTonic} ${keyType}`);

        let keyChords = {
          triads: [],
          chords: [],
        } as unknown as ReturnType<typeof TonalKey.majorKey>;
        if (keyType === 'major') {
            keyChords = TonalKey.majorKey(keyTonic);
        } else if (keyType === 'melodic minor') {
            keyChords = TonalKey.majorKey(TonalKey.minorKey(keyTonic).relativeMajor);
        }
        // const allChords = keyChords
        //     ? [
        //           ...keyChords.chords,
        //           ...keyChords.secondaryDominants,
        //           ...keyChords.secondaryDominantsMinorRelative,
        //           ...keyChords.substituteDominants,
        //           ...keyChords.substituteDominantsMinorRelative,
        //       ]
        //           .filter(Boolean)
        //           .map(ChordModule.get)
        //           .filter(Boolean)
        //     : [];
        return {
            ...scale,
            chordTypes: scaleChordTypes,
            keyChords,
        };
    },
    names: TonalScale.names,
    relevantNames: () => {
      return ['major', 'melodic minor']
    },
    getScaleNotes(keyTonic: string, keyType: string, lowestNoteName: string, highestNoteName: string) {
      const chromaticNotes = NoteModule.getAllNotes(lowestNoteName, highestNoteName)
      const scale = ScaleModule.get(keyTonic, keyType)

      return chromaticNotes.filter(note => {
        return scale.notes.includes(note.pc)
      })
    }
};

export const IntervalModule = {
  get(name: string) {
    return TonalInterval.get(name);
  },
  names() {
    return ['1P', '2m', '2M', '3m', '3M', '4P', '5P', '6m', '6M', '7m', '7M', '8P'];
  },
  getHighestInterval(intervals: any[]) {
    const sorted = [...intervals].sort((i1, i2) => {
      const diff =  i2.name[0] - i1.name[0];
      if (diff === 0) {
        // TODO: test
        if (i1.name[1] === 'M') {
          return 1;
        }
      }

      return diff;
    });

    console.log(sorted)

    return sorted[0];
  }
}


// https://kathleenkarlsen.com/chakra-sounds
// https://handicraftsinnepal.com/singing-bowl-chakras/
const CHAKRA_NOTES = [
  {
    freq: 396,
    longName: 'Root',
    name: 'LAM',
  },
  {
    freq: 417,
    longName: 'Sacral',
    name: 'VAM',
  },
  {
    freq: 528,
    longName: 'Solar Plexus',
    name: 'RAM',
  },
  {
    freq: 639,
    longName: 'Heart',
    name: 'YAM',
  },
  {
    freq: 741,
    longName: 'Throat',
    name: 'HAM',
  },
  {
    freq: 144,
    longName: 'Third Eye',
    name: 'OM',
  },
  {
    freq: 963,
    longName: 'Crown',
    name: 'AUM', // AH, ANG or AUM
  },
]