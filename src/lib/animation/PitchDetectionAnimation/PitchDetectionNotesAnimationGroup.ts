import type {
  PitchDetectionAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
} from './types';
import paper, { view, Path, Point, Size, Rectangle, Group } from 'paper'
import { NoteModule } from '@/lib/music';


type Props = {
  freqToCanvasYPosition: freqToCanvasYPosition,
  config: PitchDetectionAnimationConfig,
  theme: {
    default: string;
  },
};

export default class PitchDetectionNotesAnimationGroup {
  group: Group;
  config: Props['config'];
  theme: Props['theme'];
  freqToCanvasYPosition: freqToCanvasYPosition;

  constructor({
    freqToCanvasYPosition,
    config,
    theme,
  }: Props) {
    this.theme = theme;
    this.config = config;
    this.freqToCanvasYPosition = freqToCanvasYPosition;
    this.group = new Group();
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const currentNote = NoteModule.fromFreq(pitch);
    if (!currentNote.empty) {
      const startFreq = NoteModule.addCents(
        currentNote.freq!,
        -0.4,
      );
      const endFreq = NoteModule.addCents(
        currentNote.freq!,
        0.4,
      );
      const startPosX = view.center.x - this.config.melodySingPixelsPerSecond * ev.delta;
      const endPosX = view.center.x + this.config.melodySingPixelsPerSecond * ev.delta;
      const startPosY = this.freqToCanvasYPosition(startFreq);
      const endPosY = this.freqToCanvasYPosition(endFreq);

      const rect = new Rectangle(
        new Point(view.center.x, startPosY),
        new Size(endPosX - startPosX, endPosY - startPosY),
      );
      const path = new Path.Rectangle(rect);
      path.fillColor = new paper.Color(this.theme.default);
      this.group.addChild(path)
    }

    const dest = new Point(
      this.group.position.x - ev.delta * this.config.melodySingPixelsPerSecond,
      this.group.position.y,
    );
    this.group.position = dest;

    this.group.children.forEach((c) => {
      if (c.bounds.right < 0) {
        c.remove();
      }
    })
  }
}
