import paper, { view, Path, Point, Size, PointText, Rectangle } from 'paper'
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import PitchDetector from '@/lib/PitchDetector';

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

interface MelodyAnimationConfig {
  melodySingPixelsPerSecond: number;
  melodyNoteSelectedMaxFreqCentsDiff: number;
  melodyPercentFrameHitToAccept: number;
}
type freqToCanvasYPosition = (freq: Hz) => Pixel;

const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq! * pixelsPerLogHertz + padding;
};

class PitchCircle {
  path: Path.Circle;
  pitchHistoryPaths: Path.Circle[];
  emaPitchHistoryPaths: Path.Circle[];

  freqToCanvasYPosition: freqToCanvasYPosition;
  isSingPitchQualityAccepted: boolean;
  pitchHistory: ReturnType<InstanceType<typeof PitchDetector>['getPitch']>[] = [];
  smoothPitchHistory: ReturnType<InstanceType<typeof PitchDetector>['getPitch']>[] = [];
  clarityThreshold: number = 0.5;
  pitchDetector: PitchDetector;


  constructor({
    freqToCanvasYPosition,
    pitchDetector,
  }: {
    freqToCanvasYPosition: freqToCanvasYPosition,
    pitchDetector: PitchDetector;
  }) {
    this.path = new Path.Circle({
      center: view.center,
      radius: 10,
      fillColor: new paper.Color(theme.pitchCircle.normal)
    });
    this.freqToCanvasYPosition = freqToCanvasYPosition;
    this.pitchDetector = pitchDetector;
    this.isSingPitchQualityAccepted = false;

    const HISTORY_SAMPLES_COUNT = 20;
    this.pitchHistoryPaths = new Array(HISTORY_SAMPLES_COUNT).fill(null).map(() => (
      new Path.Circle({
        center: view.center,
        radius: 2,
        fillColor: new paper.Color('#c9d128'),
        visible: false,
      })
    ));

    this.emaPitchHistoryPaths = new Array(HISTORY_SAMPLES_COUNT).fill(null).map(() => (
      new Path.Circle({
        center: view.center,
        radius: 2,
        fillColor: new paper.Color('#442ffa'),
        visible: false,
      })
    ));
  }

  onAnimationFrame() {
    const [pitch, clarity, volume] = this.pitchDetector.getPitch();

    const EVERY_N_HISTORY_SAMPLES = 1;
    const PIXELS_PER_PITCH_HISTORY_IDX = 10;
    const pitchHistory = this.pitchDetector.pitchHistory
      .slice(-this.pitchHistoryPaths.length * EVERY_N_HISTORY_SAMPLES)
      .filter((n, idx) => idx % EVERY_N_HISTORY_SAMPLES === 0)
      .reverse();
    const emaPitchHistory = this.pitchDetector.emaPitchHistory
      .slice(-this.emaPitchHistoryPaths.length * EVERY_N_HISTORY_SAMPLES)
      .filter((n, idx) => idx % EVERY_N_HISTORY_SAMPLES === 0)
      .reverse();

    pitchHistory.forEach(([pitch], idx) => {
      const path = this.pitchHistoryPaths[idx]
      const y = this.freqToCanvasYPosition(pitch);
      const dest = new Point(view.size.width/2 - idx * PIXELS_PER_PITCH_HISTORY_IDX, y);
      path.position = dest
      path.visible = true
    })

    emaPitchHistory.forEach(([pitch], idx) => {
      const path = this.emaPitchHistoryPaths[idx]
      const y = this.freqToCanvasYPosition(pitch);
      const dest = new Point(view.size.width/2 - idx * PIXELS_PER_PITCH_HISTORY_IDX, y);
      path.position = dest
      path.visible = true
    })

    const y = this.freqToCanvasYPosition(pitch);
    if (y == -Infinity || y == Infinity || y < 0 || !y) {
      this.isSingPitchQualityAccepted = false;
      this.path.fillColor = new paper.Color(theme.pitchCircle.fail);

      return;
    }

    this.path.visible = true;
    this.isSingPitchQualityAccepted = true;
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
      line.strokeWidth = 1;// * window.devicePixelRatio;
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

class MelodySingNoteAnimatonElement {
  path: Path.Rectangle;
  melodySingElement: Melody['melodySing'][0];
  result: {
    framesHit: number;
    totalFrames: number;
    started: boolean;
    completed: boolean;
    percentHit: number;
  };
  config: MelodyAnimationConfig;
  
  constructor({
    melodySingElement,
    freqToCanvasYPosition,
    config,
  }: {
    melodySingElement: Melody['melodySing'][0],
    freqToCanvasYPosition: freqToCanvasYPosition,
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.melodySingElement = melodySingElement;
    const note = melodySingElement.note;

    this.result = {
      totalFrames: note.duration * 60, // TODO: not *60 ?
      framesHit: 0,
      started: false,
      completed: false,
      percentHit: 0,
    }

    const startPosX = note.start * this.config.melodySingPixelsPerSecond;
    const startPosY = freqToCanvasYPosition(note.freq!) - 10;
    const endPosX = note.end * this.config.melodySingPixelsPerSecond;
    const endPosY = freqToCanvasYPosition(note.freq!) + 10;

    const rect = new Rectangle(
      new Point(view.center.x + startPosX, startPosY),
      new Size(endPosX - startPosX, endPosY - startPosY),
    )
    this.path = new Path.Rectangle(rect);
    this.path.fillColor = new paper.Color(theme.noteRects.normal);
    this.path.selected = false;
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const note = this.melodySingElement.note;
    const result = this.result;
    const path = this.path;

    const dest = new Point(this.path.position.x - ev.delta * this.config.melodySingPixelsPerSecond, this.path.position.y);
    this.path.position = dest;


    if (!result.completed) {
      if (path.bounds.left < view.center.x) {

        if (!result.started) {
          result.started = true;
        }

        const freqDiffInCents = Math.abs(NoteModule.centsDistance(pitch, note.freq))
        if (
          // pitchCircle.isSingPitchQualityAccepted &&
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
  }

  isCompleted() {
    return this.result.completed;
  }
}


class MelodyAnimation {
  melody: Melody;

  canvas: HTMLCanvasElement;
  
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  
  
  pitchDetector: PitchDetector = new PitchDetector();
  synth: Tone.PolySynth = new Tone.PolySynth().toDestination();
  
  freqToCanvasYPosition: freqToCanvasYPosition;
  config: MelodyAnimationConfig = {
    melodySingPixelsPerSecond: 100,
    melodyNoteSelectedMaxFreqCentsDiff: 0.2,
    melodyPercentFrameHitToAccept: 0.2,

  }
  onStopped: () => void;

  static runChecks(): { error: string } | null {
    // Required for PitchDetector
    if (!navigator.getUserMedia) {
      return { error: 'Your browser cannot record audio. Please switch to Chrome or Firefox.' }
    }

    return null;
  }

  constructor(melody: Melody, canvas: HTMLCanvasElement, onStopped: () => void) {
    this.onStopped = onStopped;
    this.melody = melody;
    // setup paper.js
    this.canvas = canvas;
    paper.setup(canvas)

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
      ctx.scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
    }
    
    // set origin to bottom-left corner
    // ctx.translate(0, canvas.height);
    // ctx.scale(1, -1);

    // TODO: add padding if of few notes on each side there's only 1 note, e.g min 5 notes displayed
    this.notesForNoteLines = NoteModule.getAllNotes(
      Math.min(...melody.melodySing.map(e => e.note.freq!)),
      Math.max(...melody.melodySing.map(e => e.note.freq!)),
    );
    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[this.notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    this.freqToCanvasYPosition = getFreqToCanvasYPositionFn(minNoteLogFreq, pixelsPerLogHertz, padding);


    this.synth.set({
      oscillator: {
        // partialCount: 10,
        // type: 'sine',
      },
      portamento: 10,
      envelope: {
        attack: 0.5,
      }
    });
  }

  start() {
    const melody = this.melody;

    const noteLines = new NotesLines({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      notes: this.notesForNoteLines,
    });
    const pitchCircle = new PitchCircle({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      pitchDetector: this.pitchDetector,
    });

    const melodySingAnimationElements = melody.melodySing.map(m => new MelodySingNoteAnimatonElement({
      melodySingElement: m,
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      config: this.config,
    }));

    const onFrame = async (ev: AnimationFrameEvent) => {
      melody.melodyPlay
        .forEach((m) => {
          if (!m.played && ev.time >= m.start) {
            this.synth.triggerAttackRelease(m.notes.map(n => n.name), m.duration)
            m.played = true;
          }
        });

      const pitch = this.pitchDetector.getPitch()[0];

      pitchCircle.onAnimationFrame()
      melodySingAnimationElements.forEach(e => e.onAnimationFrame(ev, this.pitchDetector.getPitch()[0]))
  
      if (melodySingAnimationElements.every(m => m.isCompleted())) {
        // TODO show results - have a function that runs on Stop as well
        console.log(melodySingAnimationElements.map(m => m.result));
        this.stop();
      }
    };

    const startAnimation = () => {
      if (!this.pitchDetector.initialized) {
        setTimeout(startAnimation, 100);
      }
      view.onFrame = onFrame
    }

    startAnimation();
  }

  stop() {
    if (view) {
      view.remove() 
    }
    this.onStopped();
  }
}

export default MelodyAnimation;