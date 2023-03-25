import { TrackNote } from './TrackNote';

interface InstrumentConfig {
  baseUrl: string;
  urls?: { [key: string]: string };
  attack?: number;
  release?: number;
}

export default class Melody {
  // singTrack includes Listen components (TODO: better name)
  singTrack: TrackNote[];
  backingTrack: TrackNote[];
  listenTrack: TrackNote[];
    // lyricsTrack: TrackNote[];
  instrumentConfig: InstrumentConfig;

  constructor({
    singTrack,
    backingTrack,
    listenTrack,
    instrumentConfig,
  }: {
    singTrack: TrackNote[],
    backingTrack: TrackNote[],
    listenTrack: TrackNote[],
    instrumentConfig: InstrumentConfig
  }) {
    this.singTrack = singTrack;
    this.listenTrack = listenTrack;
    this.backingTrack = backingTrack;
    this.instrumentConfig = instrumentConfig;
  }
}
