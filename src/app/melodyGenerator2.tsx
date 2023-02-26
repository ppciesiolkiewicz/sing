import { NoteModule, ScaleModule, ChordModule } from './music';

type NoteBase = {
  name: string;
  freq: number;
};

// TODO: use MelodyNote instead of ReturnType<typeof NoteModule.get> | string etc.
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
    scale,
    lowestNoteName,
    highestNoteName,
    repeatTimes,
  }: {
    scale: ReturnType<typeof ScaleModule.get>,
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
  }) {
    const timeBetweenRepeats = 2;
    const timePerNote = 2;

    // TODO: timeBetweenNotes doesnt work
    const timeBetweenNotes = 0.5;
    const lowestOctave = parseInt(lowestNoteName[1]); 
    const highestOctave = parseInt(highestNoteName[1]);
    const octaveCount = highestOctave - lowestOctave + 1;
  
    // TODO: move to ScaleModule whole logic for generating scales between notes
    const scaleNotesElementsBase = scale.notes.map((note) => ({
      name: note,
      start: 0,
      end: 0,
    }));
    const scaleNotesElementsWithOctavesBase = Array(octaveCount).fill(scaleNotesElementsBase).map((notes, i) => {
      return scaleNotesElementsBase.map(e => ({
        ...e,
        name: `${e.name}${lowestOctave + i}`
      }))
    }).flat().filter(e => true);
    const scaleNotesElements = Array(repeatTimes)
      .fill(scaleNotesElementsWithOctavesBase)
      .flat()
      .map((e, i) => {
        return {
          ...e,
          start: i * timePerNote + timeBetweenNotes*i,
          end: (i + 1) * timePerNote + timeBetweenNotes*i,
        };
    })
  
    const notes = scaleNotesElements.map(e => new MelodyNote(e.name, e.start, e.end));

    return new MelodyConfig(notes);
  }
}

class MelodySingElement {
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