// TODO: MusicAnimationBase class
import type {
  PitchDetectionAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
} from './types';
import paper, { view, Path, Point, Size, Rectangle, Group } from 'paper'
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import PitchDetector from '@/lib/PitchDetector';
import PitchCircle from '@/lib/animation//MelodyAnimation/PitchCircle';
import NotesLines from '@/lib/animation//MelodyAnimation/NotesLines';
import PitchDetectionNotesAnimationGroup from './PitchDetectionNotesAnimationGroup';

const theme = {
  background: '#fff',
  noteLines: {
    line: '#454545',
    text: '#454545',
  },
  pitchDetectionTrack: {
    default: '#454545',
  },
  pitchCircle: {
    default: '#454545',
    success: '#00aa00',
    fail: '#aa0000',
  },
};

const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel, height: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return height - (Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq * pixelsPerLogHertz + padding);
};



class PitchDetectionAnimation {
  canvas: HTMLCanvasElement;
  pitchCircle: PitchCircle;
  pitchDetector: PitchDetector = new PitchDetector();
  pitchDetectionNotesAnimationGroup: PitchDetectionNotesAnimationGroup;
  config: PitchDetectionAnimationConfig;

  static runChecks(): { error: string } | null {
    // Required for PitchDetector
    if (!navigator.getUserMedia) {
      return { error: 'Your browser cannot record audio. Please switch to Chrome or Firefox.' }
    }

    return null;
  }


  private getFreqToCanvasPosition(lowestNoteName: string, highestNoteName: string) {
    const notesForNoteLines = NoteModule.getAllNotes(
      lowestNoteName,
      highestNoteName,
    );

    const paddingTop: Pixel = this.config.paddingTop;
    const paddingBottom: Pixel = this.config.paddingBottom;
    const heightWithoutPadding: Pixel = view.size.height - paddingTop - paddingBottom;
    const minNoteLogFreq: LogHz = Math.log2(notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(notesForNoteLines[notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    const freqToCanvasYPosition = getFreqToCanvasYPositionFn(
      minNoteLogFreq, pixelsPerLogHertz, paddingBottom, view.size.height
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
    lowestNoteName: string,
    highestNoteName: string,
    canvas: HTMLCanvasElement,
  ) {
    this.config = {
      melodySingPixelsPerSecond: 100,
      paddingTop: 10 * window.devicePixelRatio,
      paddingBottom: 10 * window.devicePixelRatio,
    }
    this.canvas = canvas; 
    paper.setup(canvas)

    this.setupDevicePixelRatio();

    const { freqToCanvasYPosition, notesForNoteLines } = this.getFreqToCanvasPosition(
      lowestNoteName,
      highestNoteName,
    );

    const noteLines = new NotesLines({
      freqToCanvasYPosition,
      notes: notesForNoteLines,
      theme: theme.noteLines,
    });


    this.pitchCircle = new PitchCircle({
      freqToCanvasYPosition,
      theme: theme.pitchCircle,
    });

    this.pitchDetectionNotesAnimationGroup = new PitchDetectionNotesAnimationGroup({
      freqToCanvasYPosition,
      config: this.config,
      theme: theme.pitchDetectionTrack,
    })
  }

  start() {
    window.onfocus = () => view?.play && view.play();
    window.onblur = () => view?.pause && view.pause();

    // TODO: When pausing time keeps elapsing so we need to use our own time
    // this doesn't work because delta keeps accuumulating when pausing
    // let time = 0;
    // time += ev.delta;
    // ev.time = time;
    // this example uses gsap for timelines - https://jsfiddle.net/xidi2xidi/owxgb2kL/
    const onFrame = async (ev: AnimationFrameEvent) => {
      const currentPitch = this.pitchDetector.getPitch();
      this.pitchCircle.onAnimationFrame(ev, currentPitch)
      this.pitchDetectionNotesAnimationGroup.onAnimationFrame(ev, currentPitch);
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
  }
}

export default PitchDetectionAnimation;