import type {
  freqToCanvasYPosition,
} from './types';
import paper, { view, Path, Point, PointText } from 'paper'
import { NoteModule } from '@/lib/music';

export default class NotesLines {
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
    const fontSize = 12 * window.devicePixelRatio;
    notes.forEach((note) => {
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
    });
  }
}