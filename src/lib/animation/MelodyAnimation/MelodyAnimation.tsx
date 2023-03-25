import type {
  MelodyAnimationConfig,
  freqToCanvasYPosition,
  AnimationFrameEvent,
  MelodySingNoteScore
} from './types';
import type { DifficultyLevel } from '@/constants';
import paper, { view, Path, Point, Size, PointText, Rectangle, Group } from 'paper'
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import { DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP, DIFFICULTY_LEVEL_EASY } from '@/constants';
import PitchDetector from '@/lib/PitchDetector';
import { MelodySingAnimationGroup, MelodyListenAnimationGroup } from './MelodyAnimationGroup';
import PitchCircle from './PitchCircle';


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



class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  melodySingAnimationGroup: MelodySingAnimationGroup;
  melodyListenAnimationGroup: MelodyListenAnimationGroup;
  pitchCircle: PitchCircle;
  pitchDetector: PitchDetector = new PitchDetector();
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  };
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
    const notesForNoteLines = NoteModule.getAllNotes(
      Math.min(...melody.singTrack.map(e => e.freq)),
      Math.max(...melody.singTrack.map(e => e.freq)),
    );

    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(notesForNoteLines[notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    const freqToCanvasYPosition = getFreqToCanvasYPositionFn(minNoteLogFreq, pixelsPerLogHertz, padding, view.size.height);

    const noteLines = new NotesLines({
      freqToCanvasYPosition: freqToCanvasYPosition,
      notes: notesForNoteLines,
    });

    this.melodySingAnimationGroup = new MelodySingAnimationGroup({
      track: melody.singTrack,
      freqToCanvasYPosition: freqToCanvasYPosition,
      config: this.config,
      theme,
    });

    this.melodyListenAnimationGroup = new MelodyListenAnimationGroup({
      track: melody.singTrack,
      freqToCanvasYPosition: freqToCanvasYPosition,
      config: this.config,
      theme,
    });


    this.pitchCircle = new PitchCircle({
      freqToCanvasYPosition: freqToCanvasYPosition,
      theme,
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

    window.onfocus = () => view.play();
    window.onblur = () => view.pause();

    // TODO: When pausing time keeps elapsing so we need to use our own time
    // this doesn't work because delta keeps accuumulating when pausing
    // let time = 0;
    // time += ev.delta;
    // ev.time = time;
    // this example uses gsap for timelines - https://jsfiddle.net/xidi2xidi/owxgb2kL/
    const onFrame = async (ev: AnimationFrameEvent) => {
      melody.backingTrack
        .forEach((m) => {
          // TODO: don't modify the object - m.played 
          // ev.time <= m.start + 0.1 when animation is out of focus to not play all the past notes at the same time
          // @see time comment above
          if (!m.played && ev.time >= m.start && ev.time <= m.start + 0.1) {
            this.soundGenerator.triggerAttackRelease(m.name, m.duration);
            m.played = true;
          }
        });

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