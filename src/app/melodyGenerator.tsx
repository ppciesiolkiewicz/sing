import { NoteModule, ScaleModule, ChordModule } from './music';

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
}


class MelodyNote2 {
  notes: {
    name: string;
    freq: number;
  }[];
  start: number;
  end: number;

  constructor(noteNames: string[], start: number, end: number) {
    const notes = noteNames.map(noteName => NoteModule.get(noteName));

    this.notes = notes.map(note => ({
      name: note.name,
      freq: note.freq!,
    }))
    this.start = start;
    this.end = end;
  }
}

class MelodySingElement {
  note: MelodyNote;
  framesHit: number;
  totalFrames: number;
  started: boolean;
  completed: boolean;
  percentHit: number;

  constructor(noteName: string, start: number, end: number) {
    this.note = new MelodyNote(noteName, start, end);
    this.framesHit = 0;
    this.totalFrames = 0;
    this.started = false;
    this.completed = false;
    this.percentHit = 0;
  }
};

class MelodyPlayElement {
  note: MelodyNote;
  played: boolean;

  constructor(noteName: string, start: number, end: number) {
    this.note = new MelodyNote(noteName, start, end);
    this.played = false
  }
};


// TODO: merge NoteConfigElement and ChordConfigElement so it's shape is always as ChordConfigElement
class NoteConfigElement {
  name: string; // TODO: the other config has notes here
  start: number;
  end: number;

  constructor(name: string, start: number, end: number) {
    this.name = name;
    this.start = start;
    this.end = end;
  }
}

class ChordConfigElement {
  notes: MelodyNote[];


  constructor(chordName: string, start: number, end: number) {
    const chord = ChordModule.get(chordName);
    this.notes = chord.notes.map(note => new MelodyNote(note, start, end));
   }
}


class ChordConfig {
  private startTime: number;
  private timeBetweenElements: number;
  elements: ChordConfigElement[];

  constructor({ chordNames }: { chordNames: string[] }) {
      this.startTime = 0,
      this.timeBetweenElements = 0.5;

      this.elements = chordNames.map(c => ({
        chordName: c,
        timePerNote: 2,
      }))
        .reduce((acc: any, e, idx) => {
          const previousElement = acc[idx - 1];
          const endOfPreviousElement = !previousElement ? this.startTime : previousElement.notes[previousElement.notes.length - 1].end;
          const start = endOfPreviousElement + this.timeBetweenElements;
          const end = endOfPreviousElement + e.timePerNote + this.timeBetweenElements;
          const chordConfigElement = new ChordConfigElement(e.chordName, start, end)
          return [
            ...acc,
            chordConfigElement,
          ]
        }, []).flat()
    
    }
}

class ScaleConfig {
  elements: NoteConfigElement[];

  constructor({
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
    const timeBetweenNotes = 0.2;
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
    const scaleNotesElements = Array(repeatTimes).fill(scaleNotesElementsWithOctavesBase).flat().map((e, i) => {
        return {
          ...e,
          start: i * timePerNote + timeBetweenNotes,
          end: (i + 1) * timePerNote + timeBetweenNotes,
        };
    })
  
    this.elements = scaleNotesElements.map(e => new NoteConfigElement(e.name, e.start, e.end));
  }
};

type ConfigType = ChordConfig | ScaleConfig;


class Melody {
  melodySing: MelodySingElement[];
  melodyPlay: MelodyPlayElement[];

  constructor(config: ConfigType) {
    const melodyPlay: MelodyPlayElement[] = config.elements.map((e) => {
      console.log(e instanceof NoteConfigElement)
      if (e instanceof NoteConfigElement) {
        return new MelodyPlayElement(e.name, e.start, e.end);
      } else if (e instanceof ChordConfigElement) {
        const start = e.notes[0].start;
        const end = e.notes[e.notes.length - 1].end;

        return e.notes.map(n => new MelodyPlayElement(n.name, start, end))
      }
      
      throw new Error('Unknown ConfigElement type')
    }).flat()
    
    const melodySing: MelodySingElement[] = config.elements.map((e, idx) => {
      if (e instanceof NoteConfigElement) {
        return new MelodySingElement(e.name, e.start, e.end);
      } else if (e instanceof ChordConfigElement) {
        return e.notes.map(n => new MelodySingElement(n.name, n.start, n.end));
      }

      throw new Error('Unknown ConfigElement type')
    }).flat();
  
    this.melodySing = melodySing;
    this.melodyPlay = melodyPlay;
  }
}



export {
  ScaleConfig,
  ChordConfig,
  Melody,
}