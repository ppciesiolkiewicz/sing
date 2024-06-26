import { NoteModule } from "@/lib/music";

class NoteBase {
  name: string;
  freq: number;

  constructor(noteName: string) {
    const note = NoteModule.get(noteName);

    this.name = note.name;
    this.freq = note.freq!;
  }
}

export class TrackNote extends NoteBase {
  start: Second; // TODO: should be more abstract; This is a second when tempo is 60
  duration: Second;

  constructor(noteName: string, start: Second, duration: Second) {
    super(noteName);
    this.start = start;
    this.duration = duration;
  }

  get end(): Second {
    return this.start + this.duration;
  }
}
