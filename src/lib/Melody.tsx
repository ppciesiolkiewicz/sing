import { NoteModule, ScaleModule, ChordModule, IntervalModule } from '@/lib/music';
import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
  INSTRUMENTS,
} from '@/constants';
import type { InstrumentType } from '@/constants'

const START_TIME = 5;

type NoteBase = {
  name: string;
  freq: number;
};

class MelodyNote {
  name: string;
  freq: number;
  start: Second;
  end: Second;

  constructor(noteName: string, start: Second, end: Second) {
    const note = NoteModule.get(noteName);

    this.name = note.name;
    this.freq = note.freq!;
    this.start = start;
    this.end = end;
  }

  get duration(): Second {
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
  start: Second;
  end: Second;

  constructor(
    chordName: string,
    start: Second,
    end: Second,
    mode: typeof SING_ALL_CHORD_COMPONENTS | typeof SING_CHORD_ROOT_ONLY,
  ) {
    this.mode = mode;
    const chord = ChordModule.get(chordName);
    this.rootNote = new MelodyNote(chord.notes[0], start, end)
    this.notes = chord.notes.map((n: string, i) => {
      const duration = end - start;
      return new MelodyNote(n, start + duration/chord.notes.length * i, start + duration/chord.notes.length * (i+1))
    });
    this.name = chord.name;
    this.start = start;
    this.end = end;
  }
}


class MelodyConfig {
  notes: (MelodyNote | MelodyChord)[];
  instrument: InstrumentType;


  constructor(notes: (MelodyNote | MelodyChord)[], config: { instrument: InstrumentType }) {
    this.notes = notes;
    this.instrument = config.instrument;
  }

  static fromObject({
    configType,
    config
  }: {
    configType: string,
    config: any,
  }) {

    if (configType === CONFIG_TYPE_CHORDS) {
      return MelodyConfig.fromChords(config);
    } else if (configType === CONFIG_TYPE_INTERVAL) {
      return MelodyConfig.fromIntervals(config);
    } else if (configType === CONFIG_TYPE_SCALE) {
      return MelodyConfig.fromScale(config);
    } else if (configType === CONFIG_TYPE_NOTES) {
      throw new Error('Not implemented');
    }

    throw new Error('Incorrect configType');
  }

  static fromChords(config: {
    chordNames: string[],
    includeAllChordComponents: boolean,
    repeatTimes: number,
    timePerNote: number,
    timeBetweenNotes: number,
    timeBetweenRepeats: number,
    instrument: InstrumentType;
  }) {
    const {
      chordNames,
      includeAllChordComponents,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = config;
    const notes = chordNames
      .reduce((acc: any, chordName, idx) => {
        const previousElement = acc[idx - 1];
        const endOfPreviousElement = !previousElement ? START_TIME : previousElement.notes[previousElement.notes.length - 1].end;
        const start = endOfPreviousElement + timeBetweenNotes;
        const end = endOfPreviousElement + timePerNote + timeBetweenNotes;
        const chordConfigElement = new MelodyChord(
          chordName,
          start,
          end,
          includeAllChordComponents ? SING_ALL_CHORD_COMPONENTS : SING_CHORD_ROOT_ONLY,
        )
        return [
          ...acc,
          chordConfigElement,
        ]
      }, []).flat()
  
      return new MelodyConfig(notes, config);
  }

  static fromScale(config: {
    // TODO: take keyTonic and keyType as params
    keyTonic: string,
    keyType: string,
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    timePerNote: number,
    timeBetweenNotes: number,
    timeBetweenRepeats: number,
    instrument: InstrumentType;
  }) {
    const {
      keyTonic,
      keyType,
      lowestNoteName,
      highestNoteName,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = config;
    const scaleNotesBase = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName)
    let scaleNotesNamesBase = scaleNotesBase.map(n => n.name);
    const splitIndices = [
      0,
      ...scaleNotesNamesBase
        .reduce(function(a, e, i) {
            // TODO: e[0]
            if (e[0] === keyTonic)
                a.push(i);
            return a;
        }, [] as number[]),
        scaleNotesNamesBase.length - 1,
      ];
    
    scaleNotesNamesBase = splitIndices
      .map((splitIdx, i) => {
        if (i === splitIndices.length - 1) {
          return [];
        }

        const part = scaleNotesNamesBase.slice(splitIdx, splitIndices[i+1]+1)
        return [...part, ...[...part].reverse()]
        
      })
      .flat()

    const scaleNotesNamesBaseRepeated = Array(repeatTimes)
      .fill(scaleNotesNamesBase)
      .flat()
  
    const scaleNotesElements = scaleNotesNamesBaseRepeated
      .map((noteName, i) => {
        const start = START_TIME + i * timePerNote + timeBetweenNotes * i + timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length);
        const end = START_TIME + (i + 1) * timePerNote + timeBetweenNotes * i + timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length);
        return {
          name: noteName,
          start,
          end,
        };
      });

    const notes = scaleNotesElements
      .map(e => new MelodyNote(e.name, e.start, e.end));

    return new MelodyConfig(notes, config);
  }

  // ['1P', '2M', '3M', '4P', '5P', '6m', '7m']
  static fromIntervals(config: {
    intervalNames: string[],
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    timePerNote: number,
    timeBetweenNotes: number,
    timeBetweenRepeats: number,
    instrument: InstrumentType;
  }) {
    const {
      intervalNames,
      lowestNoteName,
      highestNoteName,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = config;
    const intervals = intervalNames.map(name => IntervalModule.get(name));
    const intervalsCount = intervals.length;
    const highestInterval = IntervalModule.getHighestInterval(intervals);
    const CHROMATIC_SCALE_NOTES = NoteModule.getAllNotes(
      lowestNoteName,
      NoteModule.transpose(highestNoteName, `-${highestInterval.name}`),
    );

    let intervalNotesBase = CHROMATIC_SCALE_NOTES
      .map(note => new Array(repeatTimes).fill(note))
      .flat()
      .map(note => {
        return intervals.map(interval => {
          return NoteModule.transpose(note.name, interval);
        })
      })
      .flat()
    intervalNotesBase = [...intervalNotesBase, ...intervalNotesBase.reverse()]
    const timeBetweenRootNoteChange = 0.5; // TODO:

    const notes = new Array(1)
      .fill(intervalNotesBase)
      .flat()
      .map((n, i) => {
        const start = START_TIME +
          i * timePerNote +
          timeBetweenNotes * i +
          timeBetweenRootNoteChange * Math.floor(i/intervalsCount)
          timeBetweenRepeats * Math.floor(i/intervalNotesBase.length);
        const end = START_TIME +
          (i + 1) * timePerNote +
          timeBetweenNotes * i  +
          timeBetweenRootNoteChange * Math.floor(i/intervalsCount)
          timeBetweenRepeats * Math.floor(i/intervalNotesBase.length);
        return new MelodyNote(n, start, end)
      })

      return new MelodyConfig(notes, config);
    }
}

class MelodySingElement {
  // TODO encapsulation
  note: MelodyNote;

  constructor(note: MelodyNote) {
    this.note = note;
  }


  get start(): Second {
    return this.note.start;
  }

  get end(): Second {
    return this.note.end;
  }

  get duration(): Second {
    return this.note.duration;
  }
};

class MelodyPlayElement {
  // array of notes to play multiple notes at the same time
  notes: MelodyNote[];
  played: boolean;

  constructor(noteName: string | string[], start: Second, end: Second) {
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

  get duration(): Second {
    // if playing chords then all of them need to have same duration, TOOD: assert?
    return this.notes[0].duration;
  }
};

class Melody {
  melodySing: MelodySingElement[];
  melodyPlay: MelodyPlayElement[];
  instrumentConfig: {
    baseUrl: string;
    urls?: { [key: string]: string };
    attack?: number;
    release?: number;
  };

  constructor(config: MelodyConfig) {
    this.instrumentConfig = INSTRUMENTS[config.instrument];

    const MELODY_PLAY_SHIFT = 3
    const melodyPlay: MelodyPlayElement[] = config.notes.map((e) => {
      // TODO:...
      e.start = e.start - MELODY_PLAY_SHIFT;
      e.end = e.end - MELODY_PLAY_SHIFT;
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
          return e.notes.map(n => new MelodySingElement(n));
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