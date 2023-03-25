import { NoteModule, ScaleModule, ChordModule, IntervalModule } from '@/lib/music';

const START_BEAT = 4;
export const PAUSE_NOTE_NAME = '';

interface MeasureBase {
  noteValue: number
  startBeat: number;
}

interface NoteBase {
  noteName: string;
}

interface LyricsBase {
  text: string;
}

class Note implements MeasureBase, NoteBase {
  noteName: string;
  freq?: number | null;
  noteValue: number;
  startBeat: number;

  constructor(noteName: string, noteValue: number, startBeat: number) {
    const note = NoteModule.get(noteName);
    this.noteName = noteName;
    this.freq = note.freq;
    this.noteValue = noteValue;
    this.startBeat = startBeat;
  }

  get endBeat(): number {
    return this.startBeat + this.noteValue;
  }
};

class Lyrics implements MeasureBase, LyricsBase {
  text: string;
  noteValue: number;
  startBeat: number;

  constructor(text: string, noteValue: number, startBeat: number) {
    this.text = text;
    this.noteValue = noteValue;
    this.startBeat = startBeat;
  }

  get endBeat(): number {
    return this.startBeat + this.noteValue;
  }
}

class Measure<T extends Note[] | Lyrics[]> {
  elements: T;

  constructor(elements: T) {
    this.elements = elements;
  }
}

export const SING_ALL_CHORD_COMPONENTS = 'SING_ALL_CHORD_COMPONENTS';
export const SING_CHORD_ROOT_ONLY = 'SING_CHORD_ROOT_ONLY';

interface NoteFactoryReturn {
  // TODO: nested notes start at the same time...
  // notesSing usually will have 1 note in the nested array
  notesPlay: Note[];
  notesSing: Note[];
  lyrics: Lyrics[];
}

export interface NoteConfig extends NoteBase {
  noteValue: number;
}
export interface LyricsConfig extends LyricsBase {
  noteValue: number;
}
interface ChordConfig {
  chordName: string;
  mode: typeof SING_ALL_CHORD_COMPONENTS | typeof SING_CHORD_ROOT_ONLY;
  noteValue: number;
}

class NoteFactory {
  static fromNotesNotesPlayEqualNotesSing(
    notes: NoteConfig[], lyrics?: LyricsConfig[]
  ): NoteFactoryReturn {
    let beatCounter = START_BEAT;
    const notesPlay_ = notes.map(n => {
      const note = new Note(n.noteName, n.noteValue, beatCounter);
      beatCounter += n.noteValue;
      return note;
    });
    const notesSing_ = notesPlay_;

    beatCounter = START_BEAT;
    const lyrics_ = lyrics ? lyrics.map(l => {
      const lyrics = new Lyrics(l.text, l.noteValue, beatCounter);
      beatCounter += l.noteValue;
      return lyrics
    }): [];

    return {
      notesPlay: notesPlay_,
      notesSing: notesSing_,
      lyrics: lyrics_,
    }
  }

  static fromNotes(
    notesPlay: NoteConfig[], notesSing: NoteConfig[], lyrics?: LyricsConfig[]
  ): NoteFactoryReturn {
    let beatCounter = START_BEAT;
    const notesPlay_ = notesPlay.map(n => {
      const note = new Note(n.noteName, n.noteValue, beatCounter);
      beatCounter += n.noteValue;
      return note;
    });

    beatCounter = START_BEAT;
    const notesSing_ =  notesSing.map(n => {
      const note = new Note(n.noteName, n.noteValue, beatCounter);
      beatCounter += n.noteValue;
      return note;
    });

    beatCounter = START_BEAT;
    const lyrics_ = lyrics ? lyrics.map(n => {
      const lyrics = new Lyrics(n.text, n.noteValue, beatCounter);
      beatCounter += n.noteValue;
      return lyrics
    }): [];

    return {
      notesPlay: notesPlay_,
      notesSing: notesSing_,
      lyrics: lyrics_,
    }
  }

  static fromChords(
    chords: ChordConfig[], lyrics?: LyricsConfig[]
  ): NoteFactoryReturn {

    let playBeatCounter = START_BEAT;
    let singBeatCounter = START_BEAT;
    let lyricsBeatCounter = START_BEAT;
    const chordNoteFactoryReturn = chords.map(chordConfig => {
      const chord = ChordModule.get(chordConfig.chordName);
      const chordNotesWithPause = [...chord.notes, ''];
      const notesInAChordWithPauseCount = chordNotesWithPause.length;
      const notesInAChordCount = chord.notes.length;

      const chordValue = notesInAChordCount * chordConfig.noteValue;
      const notesPlay_ = chordNotesWithPause.map(noteName => new Note(noteName, chordValue, playBeatCounter));
      playBeatCounter += notesInAChordWithPauseCount * chordConfig.noteValue;

      if (chordConfig.mode === SING_CHORD_ROOT_ONLY) {
        const notesSing_ = [new Note(chord.root, chordConfig.noteValue * notesInAChordWithPauseCount, singBeatCounter)];
        singBeatCounter += chordConfig.noteValue * notesInAChordWithPauseCount;
        const lyrics_ = lyrics
          ? lyrics.map(n => {
            const lyrics = new Lyrics(n.text, n.noteValue, lyricsBeatCounter)
            lyricsBeatCounter += n.noteValue
            return lyrics;
          })
          : [];
        return {
          notesPlay: notesPlay_,
          notesSing: notesSing_,
          lyrics: lyrics_,
        }
      } else if (chordConfig.mode === SING_ALL_CHORD_COMPONENTS) {
        const notesSing_ = chordNotesWithPause.map(noteName => {
          const note = new Note(noteName, chordConfig.noteValue, singBeatCounter)
          singBeatCounter += chordConfig.noteValue;
          return note;
        });
  
        const lyrics_ = lyrics
          ? lyrics.map(n => {
            const lyrics = new Lyrics(n.text, n.noteValue, lyricsBeatCounter)
            lyricsBeatCounter += n.noteValue
            return lyrics;
          })
          : [];

        return {
          notesPlay: notesPlay_,
          notesSing: notesSing_,
          lyrics: lyrics_,
        } as NoteFactoryReturn;
      }
  
      throw new Error("Unknwon chord.mode")
    })

    return chordNoteFactoryReturn.reduce((acc, chordNotesBase) => {
        acc.notesPlay = [...acc.notesPlay, ...chordNotesBase.notesPlay]
        acc.notesSing = [...acc.notesSing, ...chordNotesBase.notesSing]
        acc.lyrics = [...acc.lyrics, ...chordNotesBase.lyrics]

        return acc;
      }, {
        notesPlay: [],
        notesSing: [],
        lyrics: [],
      } as NoteFactoryReturn);
  }
}


export {
  NoteFactory,
  Note,
  Lyrics,
}
export type {
  NoteFactoryReturn
}