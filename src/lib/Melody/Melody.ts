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
  // lyricsTrack: TrackNote[];
  instrumentConfig: InstrumentConfig;

  constructor(
    singTrack: TrackNote[],
    backingTrack: TrackNote[],
    instrumentConfig: InstrumentConfig
  ) {
    this.singTrack = singTrack;
    this.backingTrack = backingTrack;
    this.instrumentConfig = instrumentConfig;
  }
}
