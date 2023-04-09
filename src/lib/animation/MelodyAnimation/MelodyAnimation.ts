import { cloneDeep } from 'lodash';
import paper, { view, Path, Point  } from 'paper'
import type {
  MelodyAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
  MelodySingNoteScore
} from './types';
import type { DifficultyLevel } from '@/constants';
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import { DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP, DIFFICULTY_LEVEL_EASY } from '@/constants';
import PitchDetector from '@/lib/PitchDetector';
import Timeline from '@/lib/animation/Timeline';
import { MelodySingAnimationGroup, MelodyListenAnimationGroup } from './MelodyAnimationGroup';
import MelodyLyricsAnimation from './MelodyLyricsAnimation';
import PitchCircle from './PitchCircle';
import NotesLines from './NotesLines';
import BackingTrack from './BackingTrack';

const theme = {
  background: '#fff',
  noteLines: {
    line: '#454545',
    text: '#454545',
    highlight1: '#66bb22',
    highlight2: '#66ee22',
  },
  singTrack: {
    default: '#454545',
    active: '#f0f0f0',
    success: '#00aa00',
    fail: '#aa0000',
  },
  listenTrack: {
    default: '#454545',
  },
  pitchCircle: {
    default: '#454545',
    success: '#00aa00',
    fail: '#aa0000',
  },
  lyrics: {

  }
};


const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel, height: Pixel
): freqToCanvasYPosition => {
  const part = -minNoteLogFreq * pixelsPerLogHertz + padding;
  return (freq: Hz) => {
    return height - (Math.log2(freq) * pixelsPerLogHertz + part);
  }
};


class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  melodySingAnimationGroup: MelodySingAnimationGroup;
  melodyListenAnimationGroup: MelodyListenAnimationGroup;
  melodyLyricsAnimation: MelodyLyricsAnimation;
  pitchCircle: PitchCircle;
  backingTrack: BackingTrack;
  pitchDetector: PitchDetector = new PitchDetector();
  config: MelodyAnimationConfig;
  timeline: Timeline;
  tempo: number;
  onStopped: () => void;
  onPaused: () => void;
  onFinished: (score: MelodySingNoteScore[]) => void;

  private getFreqToCanvasPosition() {
    const notesForNoteLines = NoteModule.getNoteRange(
      Math.min(...this.melody.singTrack.map(e => e.freq)),
      Math.max(...this.melody.singTrack.map(e => e.freq)),
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
    melody: Melody,
    canvas: HTMLCanvasElement,
    onStopped: () => void,
    onPaused: () => void,
    onFinished: (score: MelodySingNoteScore[]) => void,
    difficultyLevel: DifficultyLevel = DIFFICULTY_LEVEL_EASY,
  ) {
    console.log('MelodyAnimation.constructor', { melody })
    this.config = {
      melodySingPixelsPerSecond: 100,
      paddingTop: 20 * window.devicePixelRatio,
      paddingBottom: melody.lyricsTrack.length > 0 ? 60 * window.devicePixelRatio : 20 * window.devicePixelRatio,
      ...DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP[difficultyLevel],
    }
    this.canvas = canvas; 
    this.onStopped = onStopped;
    this.onFinished = onFinished;
    this.onPaused = onPaused;
    this.melody = cloneDeep(melody);
    this.tempo = melody.tempo;
    paper.setup(canvas)

    this.setupDevicePixelRatio();

    const { freqToCanvasYPosition, notesForNoteLines } = this.getFreqToCanvasPosition();

    const noteLines = new NotesLines({
      freqToCanvasYPosition,
      notes: notesForNoteLines,
      theme: theme.noteLines,
    });

    this.melodySingAnimationGroup = new MelodySingAnimationGroup({
      track: this.melody.singTrack,
      freqToCanvasYPosition,
      config: this.config,
      theme: theme.singTrack,
    });

    this.melodyListenAnimationGroup = new MelodyListenAnimationGroup({
      track: this.melody.listenTrack,
      freqToCanvasYPosition,
      config: this.config,
      theme: theme.listenTrack,
    });

    this.melodyLyricsAnimation = new MelodyLyricsAnimation({
      lyricsTrack: this.melody.lyricsTrack,
      config: this.config,
      theme: theme.lyrics,
    })


    this.pitchCircle = new PitchCircle({
      freqToCanvasYPosition,
      theme: theme.pitchCircle,
    });

    this.backingTrack = new BackingTrack({ track: this.melody.backingTrack });

    const middleLine = new Path.Line(
      new Point(view.center.x, 0),
      new Point(view.center.x, view.bounds.bottom)
    );
    middleLine.strokeColor = 'black';
    middleLine.strokeWidth = 1;
    middleLine.strokeCap = 'round';
    middleLine.dashArray = [10, 12];

    const onFrame = async (ev: AnimationFrameEvent) => {
      const currentPitch = this.pitchDetector.getPitch();
      
      this.backingTrack.onAnimationFrame(ev)
      this.pitchCircle.onAnimationFrame(ev, currentPitch)
      this.melodySingAnimationGroup.onAnimationFrame(ev, currentPitch);
      this.melodyListenAnimationGroup.onAnimationFrame(ev, currentPitch);
      this.melodyLyricsAnimation.onAnimationFrame(ev);

      if (this.isCompleted()) {
        this.timeline.stop()
        this.onFinished(this.melodySingAnimationGroup.melodySingScore);
      }
    }
    this.timeline = new Timeline(onFrame, this.tempo);
  }

  isCompleted() {
    return this.melodySingAnimationGroup.isCompleted() && this.melodyListenAnimationGroup.isCompleted();
  }

  start() {
    if (this.timeline.paused) {
      this.timeline.start();
      return;
    }

    window.onblur = () =>  this?.pause()

    const startAnimation = () => {
      if (!this.pitchDetector.initialized) {
        setTimeout(() => {
          startAnimation()
        }, 100);
      } else {
        this.timeline.start()
      }
    }

    startAnimation();
  }

  pause() {
    this.timeline.pause()
    this.onPaused();
  }

  stop() {
    this.timeline.stop()
    this.onStopped();
  }

  restart() {
    this.timeline.stop()
    this.start();
  }

  setTempo(tempo: number) {
    this.tempo = tempo;
    this.timeline.setTempo(tempo);
  }
}

export default MelodyAnimation;