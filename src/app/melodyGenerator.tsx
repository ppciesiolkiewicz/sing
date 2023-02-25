import { NoteModule, ScaleModule, ChordModule } from './music';

// TODO: use MelodyNote instead of ReturnType<typeof NoteModule.get> | string etc.
type MelodyNote = {
  name: string;
  freq: number;
}

type MelodySingElement = {
  start: number,
  end: number,
  note: ReturnType<typeof NoteModule.get>,
  framesHit: number,
  totalFrames: number,
  started: boolean,
  completed: boolean,
  percentHit: number,
};

type MelodyPlayElement = {
  notes: string[],
  start: 0.2,
  end: 2.2
};

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
  notes: {
    name: string,
    start: number,
    end: number,
  }[];
  timePerNote: number;
  timeBetweenNotes: number;


  constructor(chord: { notes: string[] }, timePerNote: number, timeBetweenNotes: number) {
    this.notes = chord.notes.map(note => ({
      name: note,
      start: 0,
      end: 0,
    }));
    this.timePerNote = timePerNote;
    this.timeBetweenNotes = timeBetweenNotes;
   }
}


class ChordConfig {
  startTime: number; // TODO: remove startTime?
  timeBetweenElements: number;
  elements: ChordConfigElement[];

  constructor({ chordNames }: { chordNames: string[] }) {
      this.startTime = 0, // TODO: remove startTime?
      this.timeBetweenElements = 2;
      this.elements = chordNames.map(c => new ChordConfigElement(c, 2, 0.5))
        .reduce((acc: any, e: any, idx) => {
          const previousElement = acc[idx - 1];
          const endOfPreviousElement = !previousElement ? this.startTime : previousElement.notes[previousElement.notes.length - 1].end;
          acc.push({
            ...e,
            notes: e.notes.map((note, i) => ({
              ...note,
              start: endOfPreviousElement + i * (e.timePerNote + e.timeBetweenNotes) + this.timeBetweenElements * idx,
              end: endOfPreviousElement + i * (e.timePerNote + e.timeBetweenNotes) + e.timePerNote + this.timeBetweenElements * idx,
            }))
          });
          return acc;
        }, [])
    
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
        return {
          notes: [e.name],
          start: e.start,
          end: e.end, 
        };
      } else if (e instanceof ChordConfigElement) {
        const start = e.notes[0].start;
        const end = e.notes[e.notes.length - 1].end;
        const ret =  {
          notes: e.notes.map(n => n.name),
          start,
          end, 
        };
        return ret;
      }
    }).flat()
    
    const melodySing: MelodySingElement[] = config.elements.map((e, idx) => {
      if (e instanceof NoteConfigElement) {
        return {
          start: e.start,
          end: e.end,
          note: NoteModule.get(e.name),
          framesHit: 0,
          totalFrames: 0,
          started: false,
          completed: false,
          percentHit: 0,
        };
      } else if (e instanceof ChordConfigElement) {
        return e.notes.map(n => ({
          start: n.start,
          end: n.end,
          note: NoteModule.get(n.name),
          framesHit: 0,
          totalFrames: 0,
          started: false,
          completed: false,
          percentHit: 0,
        }));
      }
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