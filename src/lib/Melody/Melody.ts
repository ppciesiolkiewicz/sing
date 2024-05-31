import { TrackNote } from "./TrackNote";
import TrackLyrics from "./TrackLyrics";
import BackingTrack from "./BackingTrack";

export default class Melody {
  singTrack: TrackNote[];
  backingTrack: BackingTrack[];
  listenTrack: TrackNote[];
  lyricsTrack: TrackLyrics[];
  tempo: number;

  constructor({
    singTrack,
    backingTrack,
    listenTrack,
    lyricsTrack,
    tempo,
  }: {
    singTrack: TrackNote[];
    backingTrack: BackingTrack[];
    listenTrack: TrackNote[];
    lyricsTrack: TrackLyrics[];
    tempo: number;
  }) {
    this.singTrack = singTrack;
    this.listenTrack = listenTrack;
    this.backingTrack = backingTrack;
    this.lyricsTrack = lyricsTrack;
    this.tempo = tempo;
  }

  get end() {
    return Math.max(
      ...this.backingTrack.map((bt) => bt.end),
      this.singTrack[this.singTrack.length - 1].end
    );
  }
}
