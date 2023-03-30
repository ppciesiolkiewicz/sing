import type {
  freqToCanvasYPosition,
} from './types';
import paper, { view, Path, Point, PointText, Group } from 'paper'
import { NoteModule } from '@/lib/music';
import type { NoteType } from '@/lib/music';

export default class NotesLines {
  noteLines: {
    line: Path.Line;
    text: PointText;
    note: NoteType;
  }[];
  theme: {
    line: string;
    text: string;
    highlight1: string;
    highlight2: string;
  };

  constructor({
    notes,
    freqToCanvasYPosition,
    theme,
  }: {
    notes: ReturnType<typeof NoteModule.getAllNotes>,
    freqToCanvasYPosition: freqToCanvasYPosition
    theme: {
      line: string;
      text: string;
    },
  }) {
    this.theme = theme;
    const fontSize = 12 * window.devicePixelRatio;
    this.noteLines = notes.map((note) => {
      const noteYPosition = freqToCanvasYPosition(note.freq!);
      const line = new Path.Line(
        new Point(fontSize * 3, noteYPosition),
        new Point(view.size.width, noteYPosition),
      );
      line.strokeWidth = 1 * window.devicePixelRatio; // TODO:
      line.strokeColor = new paper.Color(theme.line);
      line.strokeCap = 'round';

      const text = new PointText(new Point(15 * window.devicePixelRatio, noteYPosition + fontSize/4));
      text.content = note.name;
      text.style = {
          ...text.style,
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize,
          fillColor: new paper.Color(theme.text),
          justification: 'center'
      };
      return {
        line,
        text,
        note,
      }
    });
  }


  public setHighlightedNoteLines(notes: string[], themeKey: string = 'highlight1') {
    const notes_ = notes.map(NoteModule.get);
    this.noteLines
      .filter(({ note }) => notes_.some(note_ => NoteModule.areNotesEqual(note_, note)))
      .forEach(({ text, line }) => {
        text.style.fillColor = new paper.Color(this.theme[themeKey]);
        line.strokeColor = new paper.Color(this.theme[themeKey]);
      });
  }

  public unsetHighlightedNoteLines(notes: string[]) {
    const notes_ = notes.map(NoteModule.get);
    this.noteLines
      .filter(({ note }) => notes_.some(note_ => NoteModule.areNotesEqual(note_, note)))
      .forEach(({ note, line, text }) => {
        line.strokeColor = new paper.Color(this.theme.line);
        text.style.fillColor = new paper.Color(this.theme.text);
      });
  }
}