import paper, { view, Path, Point, Size, PointText, Rectangle } from 'paper'
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody/index'
import { NoteModule } from '@/lib/music';
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

const timeToBeat = (time: Second, tempo: number) => {
  const beatNo = time * 60 / tempo;
  return beatNo;
}

const beatToTime = (beatNo: number, tempo: number): Second => {
  const time = beatNo * tempo / 60;
  return time;
}

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

class MelodySingNoteAnimatonElement {
  path: Path.Rectangle;
  tempo: number;
  melodySingElement: Melody['notesSing'][number];
  // TODO: separate animation from score
  melodySingScore: MelodySingNoteScore;
  config: MelodyAnimationConfig;
  
  constructor({
    melodySingElement,
    tempo,
    freqToCanvasYPosition,
    config,
  }: {
    melodySingElement: Melody['notesSing'][number],
    tempo: number,
    freqToCanvasYPosition: freqToCanvasYPosition,
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.melodySingElement = melodySingElement;
    this.tempo = tempo;
    const note = melodySingElement;
    this.melodySingScore = {
      noteName: melodySingElement.noteName,
      totalFrames: note.noteValue * 60, // TODO: noteValue requries tempo for calculation
      framesHit: 0,
      started: false,
      completed: false,
      percentHit: 0,
    };
    const startFreq = NoteModule.addCents(
      this.melodySingElement.freq!,
      this.config.melodyNoteSelectedMaxFreqCentsDiff,
    );
    const endFreq = NoteModule.addCents(
      this.melodySingElement.freq!,
      -this.config.melodyNoteSelectedMaxFreqCentsDiff,
    );

    const startPosX = beatToTime(note.startBeat, this.tempo) * this.config.melodySingPixelsPerSecond;
    const startPosY = freqToCanvasYPosition(startFreq);
    const endPosX = beatToTime(note.endBeat, this.tempo) * this.config.melodySingPixelsPerSecond;
    const endPosY = freqToCanvasYPosition(endFreq);

    const rect = new Rectangle(
      new Point(view.center.x + startPosX, startPosY),
      new Size(endPosX - startPosX, endPosY - startPosY),
    );
    this.path = new Path.Rectangle(rect);
    this.path.fillColor = new paper.Color(theme.noteRects.normal);
    this.path.selected = false;
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    // TODO: shortcircuit if off-screen - || this.path.position.x > view.size
    // calculation should not use ev.delta for this
    // TODO: maybe move all as a group?
    if (this.path.bounds.right < 0 /*|| this.path.position.x > view.size*/) {
      return;
    }

    const note = this.melodySingElement;
    const result = this.melodySingScore;
    const path = this.path;
    const dest = new Point(
      this.path.position.x - ev.delta * this.config.melodySingPixelsPerSecond,
      this.path.position.y,
    );
    this.path.position = dest;


    if (!result.completed) {
      if (path.bounds.left < view.center.x) {

        if (!result.started) {
          result.started = true;
        }

        const freqDiffInCents = note.freq
          ? Math.abs(NoteModule.centsDistance(pitch, note.freq))
          : 0;
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
  }

  isCompleted() {
    return this.melodySingScore.completed;
  }
}


class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  melodySingAnimationElements: MelodySingNoteAnimatonElement[];
  pitchDetector: PitchDetector = new PitchDetector();
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  };
  freqToCanvasYPosition: freqToCanvasYPosition;
  config: MelodyAnimationConfig = {
    melodySingPixelsPerSecond: 100,
    melodyNoteSelectedMaxFreqCentsDiff: 0.3,
    melodyPercentFrameHitToAccept: 0.2,
  }
  // TODO: onFinished?
  onStopped: (score: MelodySingNoteScore[]) => void;

  static runChecks(): { error: string } | null {
    // Required for PitchDetector
    if (!navigator.getUserMedia) {
      return { error: 'Your browser cannot record audio. Please switch to Chrome or Firefox.' }
    }

    return null;
  }

  constructor(melody: Melody, canvas: HTMLCanvasElement, onStopped: (score: MelodySingNoteScore[]) => void) {
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
    };

    // TODO: add padding if of few notes on each side there's only 1 note, e.g min 5 notes displayed
    this.notesForNoteLines = NoteModule.getAllNotes(
      Math.min(...melody.notesSing.filter(ns => !!ns.freq).map(ns => ns.freq!)),
      Math.max(...melody.notesSing.filter(ns => !!ns.freq).map(ns => ns.freq!)),
    );

    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[this.notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    this.freqToCanvasYPosition = getFreqToCanvasYPositionFn(minNoteLogFreq, pixelsPerLogHertz, padding, view.size.height);

    this.melodySingAnimationElements = melody.notesSing
      .map(ns =>
        !!ns.freq && new MelodySingNoteAnimatonElement({
          melodySingElement: ns,
          tempo: melody.tempo,
          freqToCanvasYPosition: this.freqToCanvasYPosition,
          config: this.config,
        })
      )
      .filter(Boolean) as MelodySingNoteAnimatonElement[];

    // this.soundGenerator = new Tone.PolySynth().toDestination();
    // this.soundGenerator.set({
    //   oscillator: {
    //     // partialCount: 10,
    //     // type: 'sine',
    //   },
    //   portamento: 10,
    //   envelope: {
    //     attack: 0.2,
    //   }
    // });
    this.soundGenerator = new Tone.Sampler({
      urls: {
        A1: "A1.mp3",
        A2: "A2.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/casio/",
      attack: 0.2,
      release: 100,
    }).toDestination();
  }

  start() {
    const melody = this.melody;
    const noteLines = new NotesLines({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      notes: this.notesForNoteLines,
    });
    const pitchCircle = new PitchCircle({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
    });


    const onFrame = async (ev: AnimationFrameEvent) => {
      const beatNo = timeToBeat(ev.time, melody.tempo);

      // TODO: chords should be played together
      melody.notesPlay
        .forEach((m) => {
          if (!m.played && beatNo >= m.startBeat) {
            if (!!m.noteName) {
              this.soundGenerator.triggerAttackRelease(
                m.noteName, beatToTime(m.noteValue, melody.tempo)
              )
            }
            m.played = true;
          }
        });

      const currentPitch = this.pitchDetector.getPitch();

      pitchCircle.onAnimationFrame(ev, currentPitch)
      this.melodySingAnimationElements.forEach(e => e.onAnimationFrame(ev, currentPitch))
  
      if (this.melodySingAnimationElements.every(m => m.isCompleted())) {
        // TODO show results - have a function that runs on Stop as well | onFinished?
        this.stop();
      }
    }

    const startAnimation = () => {
      if (!this.pitchDetector.initialized) {
        setTimeout(startAnimation, 100);
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

    this.onStopped(this.melodySingAnimationElements.map(m => m.melodySingScore));
  }
}

export default MelodyAnimation;