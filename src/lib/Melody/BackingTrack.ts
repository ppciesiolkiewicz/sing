import type { InstrumentConfig } from "./types";
import { TrackNote } from "./TrackNote";

export default class BackingTrack {
  track: TrackNote[];
  instrumentConfig: InstrumentConfig;

  constructor(track: TrackNote[], instrumentConfig: InstrumentConfig) {
    this.track = track;
    this.instrumentConfig = instrumentConfig;
  }

  get end() {
    return this.track[this.track.length - 1].end;
  }
}
