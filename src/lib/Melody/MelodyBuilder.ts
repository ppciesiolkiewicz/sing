import type { ConfigType } from '@/constants';
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
import BackingTrack from './BackingTrack';
import Melody from './Melody';

const START_TIME = 5;
const BACKING_TRACK_SHIFT = 0.1


interface InstrumentMelodyConfig {
  instrument: InstrumentType;
}

interface CommonMelodyConfig {
  repeatTimes: number,
  timePerNote: number,
  timeBetweenNotes: number,
  timeBetweenRepeats: number,
  tempo: number;
}


export interface ChordsMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  chordNames: string[],
  includeAllChordComponents: boolean,
}

export interface IntervalsMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  intervalNames: string[],
  lowestNoteName: string,
  highestNoteName: string,
}

export interface ScaleMelodyConfig extends InstrumentMelodyConfig, CommonMelodyConfig {
  keyTonic: string,
  keyType: string,
  lowestNoteName: string,
  highestNoteName: string,
}


export interface NotesMelodyConfig {
  singTrack: [string, number, number][];
  backingTrack: {
    track: [string, number, number][];
    instrument: InstrumentType;
  }[];
  listenTrack: [string, number, number][];
  lyricsTrack: [string, number, number][];
  tempo: number;
}

type MelodyConfig = NotesMelodyConfig | ScaleMelodyConfig | IntervalsMelodyConfig | ChordsMelodyConfig;

function buildInstrumentConfig(instrument: string) {
  if (!INSTRUMENTS[instrument]) {
    throw new Error('Unrecognized instrument type');
  }

  return INSTRUMENTS[instrument];
}

class IntervalsMelodyBuilder {
  config: IntervalsMelodyConfig;

  constructor(config: IntervalsMelodyConfig) {
    this.config = config;
  }

  buildBackingTrack(): BackingTrack[] {
    const notes = this.buildTrackForNotes(BACKING_TRACK_SHIFT);
    const backingTrack = new BackingTrack(
      notes,
      buildInstrumentConfig(this.config.instrument),
    );

    return [backingTrack];
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
    const timeBetweenRootNoteChange = 2; // TODO:
    const intervals = intervalNames.map((name: string) => IntervalModule.get(name));
    const highestInterval = IntervalModule.getHighestInterval(intervals);
    const intervalDistanceBetweenLowestAndHighest = IntervalModule.distance(
      lowestNoteName, NoteModule.transpose(highestNoteName, `-${highestInterval.name}`),
    );

    const part = intervals
      .map(interval => {
        return NoteModule.transpose(lowestNoteName, interval);
      })
      .map((n, i) => {
        const start = START_TIME + i * timePerNote + timeBetweenNotes * i - shift;
        return new TrackNote(n, start, timePerNote);
      });

    const partDuration = part.reduce((sum, p) => sum + p.duration, 0)

    // TODO: fix 8d issue for interval exercises, e.g. 2M
    // console.log(IntervalModule.names('1P', intervalDistanceBetweenLowestAndHighest), intervalDistanceBetweenLowestAndHighest)
    const intervalsToTransposePart = IntervalModule.names('1P', intervalDistanceBetweenLowestAndHighest);
    const notes = intervalsToTransposePart
      .map((interval, i) => console.log(trackNote.name, NoteModule.transpose(trackNote.name, interval)) || (
        part.map(trackNote => new TrackNote(
          NoteModule.transpose(trackNote.name, interval),
          trackNote.start + i * (partDuration + timeBetweenRootNoteChange),
          timePerNote,
        )))
      )
      .flat();

      return notes;
  }
}


class ChordsMelodyBuilder {
  config: ChordsMelodyConfig;

  constructor(config: ChordsMelodyConfig) {
    this.config = config;
  }

  buildBackingTrack(): BackingTrack[] {
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
        const chord = ChordModule.get(chordName);
        const duration = includeAllChordComponents
          ? timePerNote * chord.notes.length
          : timePerNote

        const chordNotes = chord.notes.map((n: string, i) => {
          return new TrackNote(n, start, duration)
        });
  
        return [
          ...acc,
          chordNotes,
        ]
      }, []).flat()
  
      const backingTrack = new BackingTrack(
        notes,
        buildInstrumentConfig(this.config.instrument),
      );

      return [backingTrack];
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
        const chord = ChordModule.get(chordName);

        if (includeAllChordComponents) {
          chordNotes = chord.notes.map((n: string, i) => {
            return new TrackNote(
              n,
              start + timePerNote * i,
              timePerNote,
            )
          });
        } else {
          chordNotes = [
            new TrackNote(chord.notes[0], start, timePerNote)
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

  buildBackingTrack(): BackingTrack[] {
    const notes = this.buildTrackForNotes(BACKING_TRACK_SHIFT);

    const backingTrack = new BackingTrack(
      notes,
      buildInstrumentConfig(this.config.instrument),
    );

    return [backingTrack];
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

        return {
          name: noteName,
          start,
        };
      });

    const notes = scaleNotesElements
      .map(e => new TrackNote(e.name, e.start, timePerNote));

    return notes;
  }
}


export default class MelodyBuilder {
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
      const config = this.config as NotesMelodyConfig;
      const singTrack = config.singTrack.map(e => new TrackNote(e[0], START_TIME + e[1], e[2]));
      const backingTrack = config.backingTrack.map(bt =>
        new BackingTrack(
          bt.track.map(e => new TrackNote(e[0], START_TIME + e[1], e[2])),
          buildInstrumentConfig(bt.instrument),
        )
      )
      const listenTrack = config.listenTrack.map(e => new TrackNote(e[0], START_TIME + e[1], e[2]));
      const lyricsTrack = config.lyricsTrack.map(e =>
        new TrackLyrics(e[0], START_TIME + e[1] - BACKING_TRACK_SHIFT, e[2])
      );

      return new Melody({
        singTrack,
        backingTrack: backingTrack,
        listenTrack,
        lyricsTrack,
        tempo: config.tempo,
      });
    }

    throw new Error('Incorrect configType');
  }
  
  private fromChords() {
    const builder = new ChordsMelodyBuilder(this.config as ChordsMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();

    return new Melody({
      singTrack,
      listenTrack: [],
      backingTrack,
      lyricsTrack: [],
      tempo: this.config.tempo,
    });
  }

  private fromScale() {
    const builder = new ScaleMelodyBuilder(this.config as ScaleMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();

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
      tempo: this.config.tempo,
    });
  }

  private fromIntervals() {
    const builder = new IntervalsMelodyBuilder(this.config as IntervalsMelodyConfig);
    const backingTrack = builder.buildBackingTrack();
    const singTrack = builder.buildSingTrack();

    return new Melody({
      singTrack,
      listenTrack: [],
      backingTrack,
      lyricsTrack: [],
      tempo: this.config.tempo,
    });
  }
}