import type {
  freqToCanvasYPosition,
  AnimationFrameEvent,
} from './types';
import paper, { view, Path, Point } from 'paper'

export default class PitchCircle {
  path: Path.Circle;
  pitchHistory: Hz[] = [];
  pitchHistoryPaths: Path.Circle[];
  freqToCanvasYPosition: freqToCanvasYPosition;
  theme: any;

  constructor({
    freqToCanvasYPosition,
    theme,
  }: {
    freqToCanvasYPosition: freqToCanvasYPosition,
    theme: any,
  }) {
    this.theme = theme;
    this.path = new Path.Circle({
      center: view.center,
      radius: 5,
      fillColor: new paper.Color(theme.pitchCircle.normal)
    });
    this.freqToCanvasYPosition = freqToCanvasYPosition;

    const HISTORY_SAMPLES_COUNT = 20;
    this.pitchHistoryPaths = new Array(HISTORY_SAMPLES_COUNT).fill(null).map(() => (
      new Path.Circle({
        center: view.center,
        radius: 2,
        fillColor: new paper.Color('#442ffa'),
        visible: false,
      })
    ));
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const EVERY_N_HISTORY_SAMPLES = 2;
    const PIXELS_PER_PITCH_HISTORY_IDX = 10;

    this.pitchHistory.push(pitch);

    this.pitchHistory
      .slice(-this.pitchHistoryPaths.length * EVERY_N_HISTORY_SAMPLES)
      .filter((n, idx) => idx % EVERY_N_HISTORY_SAMPLES === 0)
      .reverse()
      .forEach((pitch, idx) => {
        const path = this.pitchHistoryPaths[idx]
        const y = this.freqToCanvasYPosition(pitch);
        if (y == -Infinity || y == Infinity || y < 0 || !y) {
          path.visible = false;
          return;
        }
        const dest = new Point(view.size.width/2 - (idx + 1) * PIXELS_PER_PITCH_HISTORY_IDX, y);
        path.position = dest
        path.visible = true
      })

    const y = this.freqToCanvasYPosition(pitch);
    if (y == -Infinity || y == Infinity || y < 0 || !y) {
      this.path.fillColor = new paper.Color(this.theme.pitchCircle.fail);

      return;
    }

    this.path.visible = true;
    this.path.fillColor = new paper.Color(this.theme.pitchCircle.success)
    const dest = new Point(view.size.width/2, y);
    this.path.position = dest
  }
}