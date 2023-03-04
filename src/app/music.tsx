import times from 'lodash.times';
import { transpose } from '@tonaljs/core';
import {
    Interval as TonalInterval,
    Note as TonalNote,
    Progression as TonalProgression,
    Chord as TonalChord,
    Scale as TonalScale,
    Key as TonalKey,
} from '@tonaljs/tonal';

export interface ChordType extends ReturnType<typeof TonalChord.get> {
    readonly suffix: string;
}

export interface ScaleType extends ReturnType<typeof TonalScale.get> {
    readonly chordTypes: ReturnType<typeof TonalScale.scaleChords>;
    readonly allChords: ChordType[];
}

export type ChordProgressionType = {
    readonly chord: ChordType;
    readonly beats: number;
}[];

export type NoteType = ReturnType<typeof TonalNote.get>;

export const NoteModule = {
    get: TonalNote.get,
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
      let MIN_NOTE, MAX_NOTE;
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
    }
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

        let keyChords;
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
            allChords: [], // TODO?
        };
    },
    names: TonalScale.names,
    getScaleNotes(keyTonic: string, keyType: string, lowestNoteName: string, highestNoteName: string) {
      const chromaticNotes = NoteModule.getAllNotes(lowestNoteName, highestNoteName)
      const scale = ScaleModule.get(keyTonic, keyType)
      console.log(scale.notes)
      // let scaleNotesBase = Array(octaveCount)
      //   .fill(scale.notes)
      //   .flat()
      //   .map((note, i) => {
      //     // TODO: broken Math.floor((i + 1) / scale.notes.length) because octave changes on C or other note
      //     const octave = lowestOctave + Math.floor(i / scale.notes.length)
      //     return `${note}${octave}`
      //   })
      //   .filter(note => {
      //     const tmp = new MelodyNote(note, 0, 0)
      //     return tmp.freq >= lowestNoteFreq && tmp.freq <= highestNoteFreq
      //   })

      return chromaticNotes.filter(note => {
        return scale.notes.includes(note.pc)
      })
    }
};

export const IntervalModule = {
  get(name: string) {
    return TonalInterval.get(name);
  },
}



const CHAKRA_NOTES = [
  {
    freq: 396,
    name: 'Root',
  },
  {
    freq: 417,
    name: 'Sacral',
  },
  {
    freq: 528,
    name: 'Solar Plexus',
  },
  {
    freq: 639,
    name: 'Heart',
  },
  {
    freq: 741,
    name: 'Throat',
  },
  {
    freq: 144,
    name: 'Third Eye',
  },
  {
    freq: 963,
    name: 'Crown',
  },
]