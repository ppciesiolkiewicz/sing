import type { InstrumentConfig } from './types';
import { TrackNote } from './TrackNote';
import TrackLyrics from './TrackLyrics';

export default class Melody {
  // singTrack includes Listen components (TODO: better name)
  singTrack: TrackNote[];
  backingTrack: TrackNote[];
  listenTrack: TrackNote[];
  lyricsTrack: TrackLyrics[];
  instrumentConfig: InstrumentConfig;

  constructor({
    singTrack,
    backingTrack,
    listenTrack,
    lyricsTrack,
    instrumentConfig,
  }: {
    singTrack: TrackNote[],
    backingTrack: TrackNote[],
    listenTrack: TrackNote[],
    lyricsTrack: TrackLyrics[];
    instrumentConfig: InstrumentConfig;
  }) {
    this.singTrack = singTrack;
    this.listenTrack = listenTrack;
    this.backingTrack = backingTrack;
    this.lyricsTrack = lyricsTrack;
    this.instrumentConfig = instrumentConfig;
  }
}
