import type {
  MelodyAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
  MelodySingNoteScore
} from './types';
import type { DifficultyLevel } from '@/constants';
import paper, { view, Path, Point  } from 'paper'
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import { DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP, DIFFICULTY_LEVEL_EASY } from '@/constants';
import PitchDetector from '@/lib/PitchDetector';
import { MelodySingAnimationGroup, MelodyListenAnimationGroup } from './MelodyAnimationGroup';
import PitchCircle from './PitchCircle';
import NotesLines from './NotesLines';
import BackingTrack from './BackingTrack';


// TODO: use partial theme to initialize PitchCircle etc.
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

const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel, height: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return height - (Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq * pixelsPerLogHertz + padding);
};



class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  melodySingAnimationGroup: MelodySingAnimationGroup;
  melodyListenAnimationGroup: MelodyListenAnimationGroup;
  pitchCircle: PitchCircle;
  backingTrack: BackingTrack;
  pitchDetector: PitchDetector = new PitchDetector();
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


  private getFreqToCanvasPosition() {
    const notesForNoteLines = NoteModule.getAllNotes(
      Math.min(...this.melody.singTrack.map(e => e.freq)),
      Math.max(...this.melody.singTrack.map(e => e.freq)),
    );

    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(notesForNoteLines[notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    const freqToCanvasYPosition = getFreqToCanvasYPositionFn(
      minNoteLogFreq, pixelsPerLogHertz, padding, view.size.height
    );

    return {
      freqToCanvasYPosition,
      notesForNoteLines,
    }
  }

  private setupDevicePixelRatio() {
      // TODO: breaks on mobile. Is it even necessary?
    // window.devicePixelRatio logic
    if (window.devicePixelRatio > 1) {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Something went wrong getting canvas context");
      }
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      this.canvas.width = canvasWidth * window.devicePixelRatio;
      this.canvas.height = canvasHeight * window.devicePixelRatio;  
      // WAS ctx.scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
      ctx.scale(window.devicePixelRatio * window.devicePixelRatio, window.devicePixelRatio * window.devicePixelRatio);
    };
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
    this.canvas = canvas; 
    this.onStopped = onStopped;
    this.melody = melody;
    paper.setup(canvas)

    this.setupDevicePixelRatio();

    const { freqToCanvasYPosition, notesForNoteLines } = this.getFreqToCanvasPosition();

    const noteLines = new NotesLines({
      freqToCanvasYPosition,
      notes: notesForNoteLines,
      theme,
    });

    this.melodySingAnimationGroup = new MelodySingAnimationGroup({
      track: melody.singTrack,
      freqToCanvasYPosition,
      config: this.config,
      theme,
    });

    this.melodyListenAnimationGroup = new MelodyListenAnimationGroup({
      track: melody.singTrack,
      freqToCanvasYPosition,
      config: this.config,
      theme,
    });


    this.pitchCircle = new PitchCircle({
      freqToCanvasYPosition,
      theme,
    });

    this.backingTrack = new BackingTrack({
      track: melody.backingTrack,
      instrumentConfig: melody.instrumentConfig,
    })

    const middleLine = new Path.Line(
      new Point(view.center.x, 0),
      new Point(view.center.x, view.bounds.bottom)
    );
    middleLine.strokeColor = 'black';
    middleLine.strokeWidth = 1;
    middleLine.strokeCap = 'round';
    middleLine.dashArray = [10, 12];
  }

  start() {
    window.onfocus = () => view.play();
    window.onblur = () => view.pause();

    // TODO: When pausing time keeps elapsing so we need to use our own time
    // this doesn't work because delta keeps accuumulating when pausing
    // let time = 0;
    // time += ev.delta;
    // ev.time = time;
    // this example uses gsap for timelines - https://jsfiddle.net/xidi2xidi/owxgb2kL/
    const onFrame = async (ev: AnimationFrameEvent) => {
      this.backingTrack.onAnimationFrame(ev)

      const currentPitch = this.pitchDetector.getPitch();

      this.pitchCircle.onAnimationFrame(ev, currentPitch)
      this.melodySingAnimationGroup.onAnimationFrame(ev, currentPitch);
      this.melodyListenAnimationGroup.onAnimationFrame(ev, currentPitch);

      if (this.melodySingAnimationGroup.isCompleted() && this.melodyListenAnimationGroup.isCompleted()) {
        // TODO show results - have a function that runs on Stop as well | onFinished?
        this.stop();
      }
    }

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

    this.onStopped(this.melodySingAnimationGroup.melodySingScore);
  }
}

export default MelodyAnimation;