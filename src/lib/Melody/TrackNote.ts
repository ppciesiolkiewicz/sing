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
  static NOTE_TYPE_SING = 'TYPE_SING';
  static NOTE_TYPE_LISTEN = 'TYPE_LISTEN';
  static NOTE_TYPE_PLAY = 'TYPE_LISTEN';
  start: Second;
  end: Second;
  // duration: Second; TODO: duration rather than end
  type: TrackNoteType;

  constructor(noteName: string, start: Second, end: Second, type: TrackNoteType) {
    super(noteName);
    this.start = start;
    this.end = end;
    this.type = type;
  }

  get duration(): Second {
    return this.end - this.start;
  }
}
