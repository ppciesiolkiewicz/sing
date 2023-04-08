import type { InstrumentConfig } from './types';
import { TrackNote } from './TrackNote';
import TrackLyrics from './TrackLyrics';

export default class Melody {
  singTrack: TrackNote[];
  backingTrack: TrackNote[];
  listenTrack: TrackNote[];
  lyricsTrack: TrackLyrics[];
  tempo: number;
  instrumentConfig: InstrumentConfig;

  constructor({
    singTrack,
    backingTrack,
    listenTrack,
    lyricsTrack,
    tempo,
    instrumentConfig,
  }: {
    singTrack: TrackNote[],
    backingTrack: TrackNote[],
    listenTrack: TrackNote[],
    lyricsTrack: TrackLyrics[];
    tempo: number;
    instrumentConfig: InstrumentConfig;
  }) {
    this.singTrack = singTrack;
    this.listenTrack = listenTrack;
    this.backingTrack = backingTrack;
    this.lyricsTrack = lyricsTrack;
    this.tempo = tempo;
    this.instrumentConfig = instrumentConfig;
  }
}
