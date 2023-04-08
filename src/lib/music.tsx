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
    areNotesSameNote: (n1: NoteType, n2: NoteType): boolean => n1.chroma === n2.chroma,
    getGuitarNotes: (tuning: string[], fretCount: number): NoteType[][] => {
        return tuning.map(rootNote => {
            return times(fretCount - 1, fretNo => {
                const noteSymbol = transpose(rootNote, TonalInterval.fromSemitones(fretNo));
                const note = TonalNote.get(noteSymbol);

                return note;
            });
        });
    },
    getNoteRange: (lowestNote: number | string, highestNote: number | string) => {
      let lowestNote_ = lowestNote;
      let highestNote_ = highestNote;
      if (typeof lowestNote === 'number') {
        lowestNote_ = NoteModule.fromFreq(lowestNote).name;
      }
      if (typeof highestNote === 'number') {
        highestNote_ = NoteModule.fromFreq(highestNote).name;
      }

      const range = TonalRange.chromatic([lowestNote_, highestNote_]); // TODO: { sharps: true });
      return range.map(NoteModule.get);
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
    get: (chordName: string, options?: { octave: number }): ChordType => {
      const octave = options?.octave;

      try {
          const chord = TonalChord.get(chordName);
          const { type, tonic, symbol } = chord;
          const suffix = ['major', 'minor'].indexOf(type) !== -1 ? type : symbol.slice(tonic!.length);

          return {
              ...chord,
              notes: octave
                ? chord.intervals.map(interval => NoteModule.transpose(`${chord.notes[0]}${octave}`, interval))
                : chord.notes,
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
      const notes = NoteModule.getNoteRange(lowestNoteName, hightestNoteName)

      return notes.map(n => (
        chordSymbols.map(cs => `${n.name}${cs}`)
      )).flat();
    },
    getAllRelevantChords: (lowestNoteName: string, hightestNoteName: string): string[] => {
      const chordSymbols = ['maj', 'maj7', 'maj9', 'min', 'min7', 'min9', 'sus2', 'sus4', 'aug']
      const notes = NoteModule.getNoteRange(lowestNoteName, hightestNoteName)

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
      const chromaticNotes = NoteModule.getNoteRange(lowestNoteName, highestNoteName)
      const scale = ScaleModule.get(keyTonic, keyType)

      return chromaticNotes.filter(note => {
        return scale.notes.includes(note.pc)
      })
    },
    getScaleChords(scale: ScaleType, octaves = [2]) {
      const chords = octaves.map(octave =>
          [...scale.keyChords.triads]//, ...scale.keyChords.chords]
            .map(chordName => ({ chordName, octave }))
        )
        .flat()
        .map(({ chordName, octave }) => {
          const chord = ChordModule.get(chordName);
          if (!chord) {
            return null;
          }
          const notes = chord.intervals.map(interval => {
            return NoteModule.transpose(`${chord.tonic}${octave}`, interval);
          }).map(NoteModule.simplify);
          return {
            ...chord,
            symbol: `${chord.symbol}${octave}`,
            notes,
          };
        })
        .filter(Boolean);

      return chords;
    },
    splitIntoRangesByTonic(keyTonic: string, notes: NoteType[]) {
      const splitIndices = [
        0,
        ...notes
          .reduce(function(acc, note, i) {
              // TODO: e[0]
              if (keyTonic.length == 2 && `${note.name[0]}${note.name[1]}` === keyTonic) {
                acc.push(i);
              } else if (note.name[0] == keyTonic) {
                acc.push(i);
              }

              return acc;
          }, [] as number[]),
          notes.length - 1,
        ];

    const splittedNotes = splitIndices
      .map((splitIdx, i) => {
        if (i === splitIndices.length - 1) {
          return [];
        }

        const part = notes.slice(splitIdx, splitIndices[i+1]+1)
        return part.map(n => n.name);
      });

      return splittedNotes;
  }
  
};

export const IntervalModule = {
  get(name: string) {
    return TonalInterval.get(name);
  },
  distance: TonalInterval.distance,
  names(lower: string = '1P', upper: string = '8P') {
    const intervals = [
      '1P', '2m', '2M', '3m', '3M', '4P', '5P', '6m', '6M', '7m', '7M', '8P',
      '8P','9m', '9M', '10m', '10M', '11P', '12P', '13m', '13M', '14m', '14M', '15P',
    ];
    const lowerIdx = intervals.indexOf(lower);
    const upperIdx = intervals.indexOf(upper);
    return intervals.filter((interval, i) => i >= lowerIdx && i <= upperIdx)
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

    return sorted[0];
  }
}

export const MeasureModule = {
  timeToBeat2(time: Second, tempo: number) {
    const secondsPerBeat = tempo / 60;
    const beatNo = time * secondsPerBeat;
    return Math.floor(beatNo % 4);
  },
  timeToBeat(time: Second, tempo: number) {
    const beatsPerSecond = tempo / 60;
    const beatNo = time * beatsPerSecond;
    return beatNo;
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