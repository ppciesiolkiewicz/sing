
export default class TrackLyrics {
  text: string;
  start: Second;
  duration: Second;

  constructor(text: string, start: Second, duration: Second) {
    this.text = text;
    this.start = start;
    this.duration = duration;
  }

  get end(): Second {
    return this.start + this.duration;
  }
}