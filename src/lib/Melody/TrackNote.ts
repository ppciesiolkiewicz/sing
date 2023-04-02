import { NoteModule } from '@/lib/music';

export type TrackNoteType = typeof TrackNote.NOTE_TYPE_SING |
  typeof TrackNote.NOTE_TYPE_LISTEN | 
  typeof TrackNote.NOTE_TYPE_PLAY;


class NoteBase {
  name: string;
  freq: number;

  constructor(noteName: string) {
    const note = NoteModule.get(noteName);

    this.name = note.name;
    this.freq = note.freq!;
  }
};

export class TrackNote extends NoteBase {
  start: Second;
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
