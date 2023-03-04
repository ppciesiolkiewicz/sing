import { snackbarClasses } from '@mui/material';
import { NoteModule, ScaleModule, ChordModule, IntervalModule } from './music';

type NoteBase = {
  name: string;
  freq: number;
};

class MelodyNote {
  name: string;
  freq: number;
  start: number;
  end: number;

  constructor(noteName: string, start: number, end: number) {
    const note = NoteModule.get(noteName);

    this.name = note.name;
    this.freq = note.freq!;
    this.start = start;
    this.end = end;
  }

  get duration(): number {
    return this.end - this.start;
  }
}

const SING_ALL_CHORD_COMPONENTS = 'SING_ALL_CHORD_COMPONENTS';
const SING_CHORD_ROOT_ONLY = 'SING_CHORD_ROOT_ONLY';

class MelodyChord {
  mode: string;
  name: string;
  rootNote: MelodyNote;
  notes: MelodyNote[];
  start: number;
  end: number;

  constructor(chordName: string, start: number, end: number) {
    this.mode = SING_ALL_CHORD_COMPONENTS;
    const chord = ChordModule.get(chordName);
    this.rootNote = new MelodyNote(chord.notes[0], start, end)
    this.notes = chord.notes.map((n: string) => {
      return new MelodyNote(n, start, end)
    });
    this.name = chord.name;
    this.start = start;
    this.end = end;
  }
}


class MelodyConfig {
  notes: (MelodyNote | MelodyChord)[];
  constructor(notes: (MelodyNote | MelodyChord)[]) {
    this.notes = notes;
  }

  static fromChords({ chordNames }: { chordNames: string[] }) {
    const startTime = 0;
    const timeBetweenElements = 0.5;

    const notes = chordNames.map(c => ({
      chordName: c,
      timePerNote: 2,
    }))
      .reduce((acc: any, e, idx) => {
        const previousElement = acc[idx - 1];
        const endOfPreviousElement = !previousElement ? startTime : previousElement.notes[previousElement.notes.length - 1].end;
        const start = endOfPreviousElement + timeBetweenElements;
        const end = endOfPreviousElement + e.timePerNote + timeBetweenElements;
        const chordConfigElement = new MelodyChord(e.chordName, start, end)
        return [
          ...acc,
          chordConfigElement,
        ]
      }, []).flat()
  
      return new MelodyConfig(notes);
  }

  static fromScale({
    keyTonic,
    keyType,
    lowestNoteName,
    highestNoteName,
    repeatTimes,
    timePerNote,
    timeBetweenNotes,
    timeBetweenRepeats,
  }: {
    // TODO: take keyTonic and keyType as params
    keyTonic: string,
    keyType: string,
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    timePerNote: number,
    timeBetweenNotes: number,
    timeBetweenRepeats: number,
  }) {
    const scaleNotesBase = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName)
    let scaleNotesNamesBase = scaleNotesBase.map(n => n.name)
    scaleNotesNamesBase = [...scaleNotesNamesBase, [...scaleNotesNamesBase].reverse()].flat()
    const scaleNotesNamesBaseRepeated = Array(repeatTimes)
      .fill(scaleNotesNamesBase)
      .flat()
  
    const scaleNotesElements = scaleNotesNamesBaseRepeated
      .map((noteName, i) => {
        const start = i * timePerNote + timeBetweenNotes * i + timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length);
        const end = (i + 1) * timePerNote + timeBetweenNotes * i + timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length);
        return {
          name: noteName,
          start,
          end,
        };
      });

    const notes = scaleNotesElements
      .map(e => new MelodyNote(e.name, e.start, e.end));

    return new MelodyConfig(notes);
  }

  // ['1P', '2M', '3M', '4P', '5P', '6m', '7m']
  static fromIntervals({
    intervalNames,
    lowestNoteName,
    highestNoteName,
    repeatTimes,
    timePerNote,
    timeBetweenNotes,
    timeBetweenRepeats,
  }: {
    intervalNames: string[],
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    timePerNote: number,
    timeBetweenNotes: number,
    timeBetweenRepeats: number,
  }) {
    const intervals = intervalNames.map(name => IntervalModule.get(name));
    const CHROMATIC_SCALE_NOTES = NoteModule.getAllNotes(lowestNoteName, highestNoteName);

    let intervalNotesBase = CHROMATIC_SCALE_NOTES
      .map(note => {
        return intervals.map(interval => {
          return NoteModule.transpose(note.name, interval);
        })
      })
      .flat()
    intervalNotesBase = [...intervalNotesBase, ...intervalNotesBase.reverse()]

      const notes = new Array(repeatTimes)
        .fill(intervalNotesBase)
        .flat()
        .map((n, i) => {
          const start = i * timePerNote + timeBetweenNotes * i + timeBetweenRepeats * Math.floor(i/intervalNotesBase.length);
          const end = (i + 1) * timePerNote + timeBetweenNotes * i  + timeBetweenRepeats * Math.floor(i/intervalNotesBase.length);
          return new MelodyNote(n, start, end)
        })

      return new MelodyConfig(notes);
    }
}

class MelodySingElement {
  // todo encapsulation
  note: MelodyNote;
  framesHit: number;
  totalFrames: number;
  started: boolean;
  completed: boolean;
  percentHit: number;

  constructor(note: MelodyNote) {
    this.note = note;
    this.framesHit = 0;
    this.totalFrames = 0;
    this.started = false;
    this.completed = false;
    this.percentHit = 0;
  }


  get start(): number {
    return this.note.start;
  }

  get end(): number {
    return this.note.end;
  }

  get duration(): number {
    return this.note.duration;
  }
};

class MelodyPlayElement {
  // array of notes to play multiple notes at the same time
  notes: MelodyNote[];
  played: boolean;

  constructor(noteName: string | string[], start: number, end: number) {
    if (Array.isArray(noteName)) {
      this.notes = noteName.map(n => new MelodyNote(n, start, end));
    } else {
      this.notes = [new MelodyNote(noteName, start, end)];
    }
    this.played = false
  }

  get start(): number {
    return this.notes[0].start;
  }

  get end(): number {
    return this.notes[0].end;
  }

  get duration(): number {
    return this.notes[0].duration;
  }
};

class Melody {
  melodySing: MelodySingElement[];
  melodyPlay: MelodyPlayElement[];

  constructor(config: MelodyConfig) {
    const melodyPlay: MelodyPlayElement[] = config.notes.map((e) => {
      if (e instanceof MelodyNote) {
        return new MelodyPlayElement(e.name, e.start, e.end);
      } else if (e instanceof MelodyChord) {
        const start = e.start;
        const end = e.end;

        return new MelodyPlayElement(e.notes.map(n => n.name), start, end);
      }
      
      throw new Error('Unknown ConfigElement type')
    });
    
    const melodySing: MelodySingElement[] = config.notes.map((e) => {
      if (e instanceof MelodyNote) {
        return new MelodySingElement(e);
      } else if (e instanceof MelodyChord) {

        if (e.mode === SING_CHORD_ROOT_ONLY) {
          return new MelodySingElement(e.rootNote);
        } else if(e.mode === SING_ALL_CHORD_COMPONENTS) {
          // TODO: keep it simple here and keep logic in Config
          return new MelodySingElement(e.rootNote);
        }

        throw new Error('Unknown MelodyChord mode')
      }

      throw new Error('Unknown ConfigElement type')
    }).flat();
  
    this.melodySing = melodySing;
    this.melodyPlay = melodyPlay;
  }
}



export {
  MelodyConfig,
  Melody,
}