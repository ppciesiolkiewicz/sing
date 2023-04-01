import type {
  MelodyAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
  MelodySingNoteScore
} from './types';
import paper, { view, Path, Point, Size, Rectangle, Group } from 'paper'
import { Melody } from '@/lib/Melody'
import { NoteModule } from '@/lib/music';

type Props = {
  track: Melody['singTrack'] | Melody['listenTrack'],
  freqToCanvasYPosition: freqToCanvasYPosition,
  config: MelodyAnimationConfig,
  theme: {
    default: string;
    success?: string;
    fail?: string;
  },
};

class MelodyAnimationGroup {
  group: Group;
  paths: Path.Rectangle[];
  trackCompleted: boolean[];
  track: Props['track'];
  config: Props['config'];
  theme: Props['theme'];

  constructor({
    track,
    freqToCanvasYPosition,
    config,
    theme,
  }: Props) {
    this.theme = theme;
    this.config = config;
    this.track = track;
    this.trackCompleted = new Array(track.length).fill(false);

    this.paths = track.map((note) => {
        const startFreq = NoteModule.addCents(
          note.freq!,
          this.config.melodyNoteSelectedMaxFreqCentsDiff,
        );
        const endFreq = NoteModule.addCents(
          note.freq!,
          -this.config.melodyNoteSelectedMaxFreqCentsDiff,
        );
        const startPosX = note.start * this.config.melodySingPixelsPerSecond;
        const startPosY = freqToCanvasYPosition(startFreq);
        const endPosX = note.end * this.config.melodySingPixelsPerSecond;
        const endPosY = freqToCanvasYPosition(endFreq);

        const rect = new Rectangle(
          new Point(view.center.x + startPosX, startPosY),
          new Size(endPosX - startPosX, endPosY - startPosY),
        );
        const path = new Path.Rectangle(rect);
        path.fillColor = new paper.Color(this.theme.default);
        path.selected = false;
        return path;
    });

    this.group = new Group(this.paths);
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const dest = new Point(
      this.group.position.x - ev.delta * this.config.melodySingPixelsPerSecond,
      this.group.position.y,
      );
    this.group.position = dest;
      
    this.track.forEach((trackNote, i) => {
      if (!this.trackCompleted[i] && trackNote.end <= ev.time) {
        this.trackCompleted[i] = true;
      }
    });
  }

  isCompleted() {
    return this.trackCompleted.every(s => s);
  }
}


export class MelodySingAnimationGroup extends MelodyAnimationGroup {
  melodySingScore: MelodySingNoteScore[];
  
  constructor(props: Props) {
    super(props);
    const { track } = props;

    this.melodySingScore = track.map((note) => ({
      noteName: note.name,
      totalFrames: note.duration * 60, // TODO: not *60?
      framesHit: 0,
      started: false,
      percentHit: 0,
    }));
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    super.onAnimationFrame(ev, pitch);
    this.track.forEach((note, i) => {
      const result = this.melodySingScore[i];
      const trackNoteCompleted = this.trackCompleted[i];
      const path = this.group.children[i];
      if (!trackNoteCompleted) {
        if (path.bounds.left < view.center.x) {
  
          if (!result.started) {
            result.started = true;
          }
  
          const freqDiffInCents = Math.abs(NoteModule.centsDistance(pitch, note.freq))
          if (
            freqDiffInCents < this.config.melodyNoteSelectedMaxFreqCentsDiff
          ) {
            path.selected = true;
            result.framesHit += 1;
          } else {
            path.selected = false;
          }
        }
      }

      if (trackNoteCompleted && path.bounds.right < view.center.x) {
        result.percentHit = result.framesHit / result.totalFrames;
        path.selected = false;
      }
  
      if (trackNoteCompleted) {
        if (result.percentHit > this.config.melodyPercentFrameHitToAccept) {
          path.fillColor = new paper.Color(this.theme.success!);
        } else {
          path.fillColor = new paper.Color(this.theme.fail!);
        }
      }
    });
  }
}

export class MelodyListenAnimationGroup extends MelodyAnimationGroup {
  constructor(props: Props) {
    super(props);
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    super.onAnimationFrame(ev, pitch);
  }
}