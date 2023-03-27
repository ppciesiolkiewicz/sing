/*
  TODO: 
   - different background melodies
    - play each note
    - chords
    - arpegio chords
   - listen & repeat
    - different configurations
   - lyrics
   - backing track as mp3

  Output:
    playTrack: Lyrics[]
    singTrack: TrackNote[](type=NOTE_TYPE_PLAY)
    melodyTrack: TrackNote[](type=NOTE_TYPE_SING | NOTE_TYPE_LISTEN)
*/
import type { ConfigType } from '@/constants';
import type { InstrumentConfig } from './types';
import { NoteModule, ScaleModule, ChordModule, IntervalModule } from '@/lib/music';
import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
  INSTRUMENTS,
} from '@/constants';
import type { InstrumentType } from '@/constants'
import { TrackNote } from './TrackNote';
import TrackLyrics from './TrackLyrics';
import Melody from './Melody';

const START_TIME = 5;
const BACKING_TRACK_SHIFT = 0.1

const INTERVAL_MELODY_MODE_LISTEN_AND_REPEAT = 'INTERVAL_MELODY_MODE_LISTEN_AND_REPEAT';
const INTERVAL_MELODY_MODE_NO_LISTEN_AND_REPEAT1 = 'INTERVAL_MELODY_MODE_NO_LISTEN_AND_REPEAT1';
type IntervalMelodyMode = typeof INTERVAL_MELODY_MODE_LISTEN_AND_REPEAT |
  typeof INTERVAL_MELODY_MODE_NO_LISTEN_AND_REPEAT1;


// TODO: configType part of a config
interface MelodyConfigType {
  configType: ConfigType;
}

interface InstrumentMelodyConfig {
  instrument: InstrumentType;
}

interface CommonMelodyConfig {
  repeatTimes: number,
  timePerNote: number,
  timeBetweenNotes: number,
  timeBetweenRepeats: number,
}


export interface ChordsMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  chordNames: string[],
  includeAllChordComponents: boolean,
}

export interface IntervalsMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  intervalNames: string[],
  lowestNoteName: string,
  highestNoteName: string,
  // mode: IntervalMelodyMode, TODO:
}

export interface ScaleMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  keyTonic: string,
  keyType: string,
  lowestNoteName: string,
  highestNoteName: string,
}

export interface NotesMelodyConfig {
  singTrack: TrackNote[];
  backingTrack: TrackNote[];
  listenTrack: TrackNote[];
  lyricsTrack: TrackLyrics[];
  instrument: InstrumentType;
}

type MelodyConfig = NotesMelodyConfig | ScaleMelodyConfig | IntervalsMelodyConfig | ChordsMelodyConfig;

class IntervalsMelodyBuilder {
  config: IntervalsMelodyConfig;

  constructor(config: IntervalsMelodyConfig) {
    this.config = config;
  }

  buildBackingTrack(): TrackNote[] {
    return this.buildTrackForNotes(BACKING_TRACK_SHIFT);
  }

  buildSingTrack(): TrackNote[] {
    return this.buildTrackForNotes(0);
  }

  private buildTrackForNotes(shift: number) {
    const {
      intervalNames,
      lowestNoteName,
      highestNoteName,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = this.config;
    const intervals = intervalNames.map((name: string) => IntervalModule.get(name));
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
          timeBetweenRootNoteChange * Math.floor(i/intervalsCount) +
          timeBetweenRepeats * Math.floor(i/intervalNotesBase.length) -
          shift;
        const end = START_TIME +
          (i + 1) * timePerNote +
          timeBetweenNotes * i  +
          timeBetweenRootNoteChange * Math.floor(i/intervalsCount) +
          timeBetweenRepeats * Math.floor(i/intervalNotesBase.length) -
          shift;
        return new TrackNote(n, start, end);
      })

      return notes;
  }
}


class ChordsMelodyBuilder {
  config: ChordsMelodyConfig;

  constructor(config: ChordsMelodyConfig) {
    this.config = config;
  }

  buildBackingTrack(): TrackNote[] {
    const {
      chordNames,
      includeAllChordComponents,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = this.config;
    const notes = chordNames
      .reduce((acc: any, chordName, idx) => {
        const previousElement = acc[idx - 1];
        const endOfPreviousElement = !previousElement
          ? START_TIME
          : previousElement[previousElement.length - 1].end;
        const start = endOfPreviousElement + timeBetweenNotes - BACKING_TRACK_SHIFT;
        const end = endOfPreviousElement + timePerNote + timeBetweenNotes - BACKING_TRACK_SHIFT;

        const chord = ChordModule.get(chordName);

        const chordNotes = chord.notes.map((n: string, i) => {
          return new TrackNote(n, start, end)
        });
  
        return [
          ...acc,
          chordNotes,
        ]
      }, []).flat()
  
      return notes; 
  }

  buildSingTrack(): TrackNote[] {
    const {
      chordNames,
      includeAllChordComponents,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = this.config;
    const notes = chordNames
      .reduce((acc: any, chordName, idx) => {
        let chordNotes;
        const previousElement = acc[idx - 1];
        const endOfPreviousElement = !previousElement
          ? START_TIME
          : previousElement[previousElement.length - 1].end;
        const start = endOfPreviousElement + timeBetweenNotes;
        const end = endOfPreviousElement + timePerNote + timeBetweenNotes;

        const chord = ChordModule.get(chordName);

        if (includeAllChordComponents) {
          chordNotes = chord.notes.map((n: string, i) => {
            const duration = end - start;
            return new TrackNote(
              n,
              start + duration/chord.notes.length * i,
              start + duration/chord.notes.length * (i+1),
            )
          });
        } else {
          chordNotes = [
            new TrackNote(
              chord.notes[0],
              start,
              end,
            )
          ];
        }
  
        return [
          ...acc,
          chordNotes,
        ]
      }, []).flat()
  
      return notes; 
  }

}


class ScaleMelodyBuilder {
  config: ScaleMelodyConfig;

  constructor(config: ScaleMelodyConfig) {
    this.config = config;
  }

  buildBackingTrack(): TrackNote[] {
    return this.buildTrackForNotes(BACKING_TRACK_SHIFT);
  }

  buildSingTrack(): TrackNote[] {
    return this.buildTrackForNotes(0);
  }

  private buildTrackForNotes(shift: number) {
    const {
      keyTonic,
      keyType,
      lowestNoteName,
      highestNoteName,
      repeatTimes,
      timePerNote,
      timeBetweenNotes,
      timeBetweenRepeats,
    } = this.config;
    const scaleNotesBase = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName)
    let scaleNotesNamesBase = scaleNotesBase.map(n => n.name);
    scaleNotesNamesBase = [...scaleNotesNamesBase, ...[...scaleNotesNamesBase].reverse()];

    const scaleNotesNamesBaseRepeated = Array(repeatTimes)
      .fill(scaleNotesNamesBase)
      .flat()
  
    const scaleNotesElements = scaleNotesNamesBaseRepeated
      .map((noteName, i) => {
        const start = START_TIME +
          i * timePerNote +
          timeBetweenNotes * i +
          timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length) -
          shift;
        const end = START_TIME +
          (i + 1) * timePerNote +
          timeBetweenNotes * i +
          timeBetweenRepeats * Math.floor(i/scaleNotesNamesBase.length) -
          shift;

        return {
          name: noteName,
          start,
          end,
        };
      });

    const notes = scaleNotesElements
      .map(e => new TrackNote(e.name, e.start, e.end));

    return notes;
  }
}


export default class MelodyBuilder {
  // TODO: configType part of a config for TS
  config: MelodyConfig;
  configType: ConfigType;

  constructor({
    config,
    configType,
  }: {
    config: MelodyConfig,
    configType: ConfigType,
  }) {
    this.config = config;
    this.configType = configType;
  }

  build() {
    if (this.configType === CONFIG_TYPE_CHORDS) {
      return this.fromChords();
    } else if (this.configType === CONFIG_TYPE_INTERVAL) {
      return this.fromIntervals();
    } else if (this.configType === CONFIG_TYPE_SCALE) {
      return this.fromScale();
    } else if (this.configType === CONFIG_TYPE_NOTES) {
      const instrumentConfig = this.buildInstrument()

      return new Melody({
        ...this.config as NotesMelodyConfig,
        instrumentConfig
      });
    }

    throw new Error('Incorrect configType');
  }
  
  private fromChords() {
    const builder = new ChordsMelodyBuilder(this.config as ChordsMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();
    const instrumentConfig = this.buildInstrument()
    return new Melody({
      singTrack,
      listenTrack: [],
      backingTrack,
      lyricsTrack: [],
      instrumentConfig
    });
  }

  private fromScale() {
    const builder = new ScaleMelodyBuilder(this.config as ScaleMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();
    const instrumentConfig = this.buildInstrument()
    return new Melody({
      singTrack,
      listenTrack: [],
      backingTrack,
      lyricsTrack: [
        // new TrackLyrics('test0', 0, 5),
        // new TrackLyrics('test1', 5, 7),
        // new TrackLyrics('test2', 6, 10),
        // new TrackLyrics('test3', 11, 20),
      ],
      instrumentConfig
    });
  }

  private fromIntervals() {
    const builder = new IntervalsMelodyBuilder(this.config as IntervalsMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();
    const instrumentConfig = this.buildInstrument()
    return new Melody({
      singTrack,
      listenTrack: [],
      backingTrack,
      lyricsTrack: [],
      instrumentConfig
    });
  }

  private buildInstrument() {
    if (!INSTRUMENTS[this.config.instrument]) {
      throw new Error('Unrecognized instrument type');
    }

    return INSTRUMENTS[this.config.instrument];
  }
}