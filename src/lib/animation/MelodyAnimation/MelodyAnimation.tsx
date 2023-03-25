import paper, { view, Path, Point, Size, PointText, Rectangle, Group } from 'paper'
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import { DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP, DIFFICULTY_LEVEL_EASY } from '@/constants';
import PitchDetector from '@/lib/PitchDetector';
import type { DifficultyLevel } from '@/constants';


const theme = {
  background: '#fff',
  noteLines: {
    line: '#454545',
    text: '#454545',
  },
  noteRects: {
    normal: '#454545',
    active: '#f0f0f0',
    success: '#00aa00',
    fail: '#aa0000',
  },
  pitchCircle: {
    normal: '#454545',
    success: '#00aa00',
    fail: '#aa0000',
  },
};

interface AnimationFrameEvent {
  delta: number;
  time: number;
  count: number;
}

export interface MelodySingNoteScore {
  noteName: string;
  framesHit: number;
  totalFrames: number;
  started: boolean;
  completed: boolean;
  percentHit: number;
};

interface MelodyAnimationConfig {
  melodySingPixelsPerSecond: number;
  melodyNoteSelectedMaxFreqCentsDiff: number;
  melodyPercentFrameHitToAccept: number;
}
type freqToCanvasYPosition = (freq: Hz) => Pixel;

const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel, height: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return height - (Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq * pixelsPerLogHertz + padding);
};

class PitchCircle {
  path: Path.Circle;
  pitchHistory: Hz[] = [];
  pitchHistoryPaths: Path.Circle[];
  freqToCanvasYPosition: freqToCanvasYPosition;

  constructor({
    freqToCanvasYPosition,
  }: {
    freqToCanvasYPosition: freqToCanvasYPosition,
  }) {
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
      this.path.fillColor = new paper.Color(theme.pitchCircle.fail);

      return;
    }

    this.path.visible = true;
    this.path.fillColor = new paper.Color(theme.pitchCircle.success)
    const dest = new Point(view.size.width/2, y);
    this.path.position = dest
  }
}


class NotesLines {
  constructor({
    notes,
    freqToCanvasYPosition,
  }: {
    notes: ReturnType<typeof NoteModule.getAllNotes>,
    freqToCanvasYPosition: freqToCanvasYPosition
  }) {
    notes.forEach((note) => {
      const noteYPosition = freqToCanvasYPosition(note.freq!);
      const line = new Path.Line(
        new Point(0, noteYPosition),
        new Point(view.size.width, noteYPosition),
      );
      line.strokeWidth = 1 * window.devicePixelRatio; // TODO:
      line.strokeColor = new paper.Color(theme.noteLines.line);
      line.strokeCap = 'round';

      const text = new PointText(new Point(15 * window.devicePixelRatio, noteYPosition));
      text.content = note.name;
      text.style = {
          ...text.style,
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: 12 * window.devicePixelRatio,
          fillColor: new paper.Color(theme.noteLines.text),
          justification: 'center'
      };
    });
  }
}

class MelodySingAnimationElement {
  group: Group;
  paths: Path.Rectangle[];
  melodySingElements: Melody['singTrack'];
  // TODO: separate animation from score
  melodySingScore: MelodySingNoteScore[];
  config: MelodyAnimationConfig;
  
  constructor({
    singTrack,
    freqToCanvasYPosition,
    config,
  }: {
    singTrack: Melody['singTrack'],
    freqToCanvasYPosition: freqToCanvasYPosition,
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.melodySingElements = singTrack;

    this.melodySingScore = singTrack.map((note) => ({
      noteName: note.name,
      totalFrames: note.duration * 60, // TODO: not *60?
      framesHit: 0,
      started: false,
      completed: false,
      percentHit: 0,
    }));

    this.paths = singTrack.map((note) => {
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
        path.fillColor = new paper.Color(theme.noteRects.normal);
        path.selected = false;
        return path;
    });

    this.group = new Group(this.paths);
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const path = this.paths;
    const dest = new Point(
      this.group.position.x - ev.delta * this.config.melodySingPixelsPerSecond,
      this.group.position.y,
      );
    this.group.position = dest;
      
      
    this.melodySingElements.forEach((note, i) => {
      const result = this.melodySingScore[i];
      const path = this.group.children[i];
      if (!result.completed) {
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

      if (!result.completed && path.bounds.right < view.center.x) {
        result.completed = true;
        result.percentHit = (
          result.framesHit / result.totalFrames
        );
        path.selected = false;
      }
  
      if (result.completed) {
        if (result.percentHit > this.config.melodyPercentFrameHitToAccept) {
          path.fillColor = new paper.Color(theme.noteRects.success);
        } else {
          path.fillColor = new paper.Color(theme.noteRects.fail);
        }
      }
    });
  }

  isCompleted() {
    return this.melodySingScore.every(s => s.completed);
  }
}


class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  melodySingAnimationElement: MelodySingAnimationElement;
  pitchDetector: PitchDetector = new PitchDetector();
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  };
  freqToCanvasYPosition: freqToCanvasYPosition;
  config: MelodyAnimationConfig;
  // TODO: onFinished?
  onStopped: (score: MelodySingNoteScore[]) => void;

  static runChecks(): { error: string } | null {
    // Required for PitchDetector
    if (!navigator.getUserMedia) {
      return { error: 'Your browser cannot record audio. Please switch to Chrome or Firefox.' }
    }

    return null;
  }

  constructor(
    melody: Melody,
    canvas: HTMLCanvasElement,
    onStopped: (score: MelodySingNoteScore[]) => void,
    difficultyLevel: DifficultyLevel = DIFFICULTY_LEVEL_EASY,
  ) {
    console.log({ melody })
    this.config = {
      melodySingPixelsPerSecond: 100,
      ...DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP[difficultyLevel],
    }
    this.onStopped = onStopped;
    this.melody = melody;
    // setup paper.js
    this.canvas = canvas; 
    paper.setup(canvas)

    // TODO: breaks on mobile. Is it even necessary?
    // window.devicePixelRatio logic
    if (window.devicePixelRatio > 1) {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Something went wrong getting canvas context");
      }
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;  
      // WAS ctx.scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
      ctx.scale(window.devicePixelRatio * window.devicePixelRatio, window.devicePixelRatio * window.devicePixelRatio);
    };

    // TODO: add padding if of few notes on each side there's only 1 note, e.g min 5 notes displayed
    this.notesForNoteLines = NoteModule.getAllNotes(
      Math.min(...melody.singTrack.map(e => e.freq)),
      Math.max(...melody.singTrack.map(e => e.freq)),
    );

    console.log(this.notesForNoteLines)

    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[this.notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    this.freqToCanvasYPosition = getFreqToCanvasYPositionFn(minNoteLogFreq, pixelsPerLogHertz, padding, view.size.height);

    this.melodySingAnimationElement = new MelodySingAnimationElement({
      singTrack: melody.singTrack,
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      config: this.config,
    });

    const noteLines = new NotesLines({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      notes: this.notesForNoteLines,
    });

    const middleLine = new Path.Line(
      new Point(view.center.x, 0),
      new Point(view.center.x, view.bounds.bottom)
    );
    middleLine.strokeColor = 'black';
    middleLine.strokeWidth = 1;
    middleLine.strokeCap = 'round';
    middleLine.dashArray = [10, 12];

    this.soundGenerator = new Tone.Sampler(melody.instrumentConfig).toDestination();
  }

  start() {
    const melody = this.melody;

    const pitchCircle = new PitchCircle({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
    });

    // TODO: When pausing time keeps elapsing so we need to use our own time
    // this doesn't work because delta keeps accuumulating when pausing
    // let time = 0;
    // time += ev.delta;
    // ev.time = time;
    // this example uses gsap for timelines - https://jsfiddle.net/xidi2xidi/owxgb2kL/
    const onFrame = async (ev: AnimationFrameEvent) => {
      melody.backingTrack
        .forEach((m) => {
          // TODO: don't modify the object
          // ev.time <= m.start + 0.1 when animation is out of focus to not play all the past notes at the same time
          // @see time comment above
          if (!m.played && ev.time >= m.start && ev.time <= m.start + 0.1) {
            this.soundGenerator.triggerAttackRelease(m.name, m.duration);
            m.played = true;
          }
        });

      const currentPitch = this.pitchDetector.getPitch();

      pitchCircle.onAnimationFrame(ev, currentPitch)
      this.melodySingAnimationElement.onAnimationFrame(ev, currentPitch);

      if (this.melodySingAnimationElement.isCompleted()) {
        // TODO show results - have a function that runs on Stop as well | onFinished?
        this.stop();
      }
    }

    window.onfocus = () => view.play();
    window.onblur = () => view.pause();

    const startAnimation = () => {
      if (!this.pitchDetector.initialized) {
        setTimeout(() => {
          startAnimation()
        }, 100);
      } else {
        view.onFrame = onFrame
      }
    }
    

    startAnimation();
  }

  stop() {
    if (view) {
      view.remove();
    }

    this.onStopped(this.melodySingAnimationElement.melodySingScore);
  }
}

export default MelodyAnimation;