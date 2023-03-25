
export default class TrackLyrics {
  text: string;
  start: Second;
  end: Second;

  constructor(text: string, noteValue: Second, startBeat: Second) {
    this.text = text;
    this.start = noteValue;
    this.end = startBeat;
  }

  get duration(): Second {
    return this.end - this.start;
  }
}