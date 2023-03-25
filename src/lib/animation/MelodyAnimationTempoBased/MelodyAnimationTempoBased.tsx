import paper, { view, Path, Point, Size, PointText, Rectangle, Group } from 'paper'
import * as Tone from 'tone';
import { Melody } from '@/lib/TempoBasedMelodyMelody/index'
import { NoteModule } from '@/lib/music';
import PitchDetector from '@/lib/PitchDetector';
import { DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP, DIFFICULTY_LEVEL_EASY } from '@/constants';
import type { DifficultyLevel } from '@/constants';
import type { AnimationFrameEvent } from './types';

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
  paddingTop: Pixel;
  paddingBottom: Pixel;
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
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, paddingBottom: Pixel, height: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return height - (Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq * pixelsPerLogHertz + paddingBottom);
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
  paths: Path.Rectangle;
  tempo: number;
  melodySingElements: Melody['notesSing'];
  // TODO: separate animation from score
  melodySingScore: MelodySingNoteScore[];
  config: MelodyAnimationConfig;
  
  constructor({
    melodySingElements,
    tempo,
    freqToCanvasYPosition,
    config,
  }: {
    melodySingElements: Melody['notesSing'],
    tempo: number,
    freqToCanvasYPosition: freqToCanvasYPosition,
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.melodySingElements = melodySingElements;
    this.tempo = tempo;
    this.melodySingScore = melodySingElements.map(note => ({
      noteName: note.noteName,
      totalFrames: note.noteValue * 60, // TODO: noteValue requries tempo for calculation
      framesHit: 0,
      started: false,
      completed: false,
      percentHit: 0,
    }))

    this.paths = melodySingElements.map(note => {
      const startFreq = NoteModule.addCents(
        note.freq!,
        this.config.melodyNoteSelectedMaxFreqCentsDiff,
      );
      const endFreq = NoteModule.addCents(
        note.freq!,
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
      const radius = new Size(20, 20);
      const path = new Path.Rectangle(rect, radius);
      path.fillColor = new paper.Color(theme.noteRects.normal);
      path.selected = false;

      return path;
    });

    this.group = new Group(this.paths);
  }

  onAnimationFrame(ev: AnimationFrameEvent, pitch: Hz) {
    const note = this.melodySingElements;
    const dest = new Point(
      this.group.position.x - ev.delta * this.config.melodySingPixelsPerSecond,
      this.group.position.y,
    );
    this.group.position = dest;


    this.melodySingElements.map((note, i) => {
      const result = this.melodySingScore[i];
      const path = this.group.children[i];
    
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
    })
  }

  isCompleted() {
    return this.melodySingScore.every(s => s.completed);
  }
}

class MelodyLyricsAnimatonElement {
  path: PointText;
  highlight: Path.Rectangle;
  tempo: number;
  lyrics: Melody['lyrics'];
  currentLyricsLine?: Melody['lyrics'][number];
  config: MelodyAnimationConfig;
  
  constructor({
    lyrics,
    tempo,
    config,
  }: {
    lyrics: Melody['lyrics'],
    tempo: number,
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.lyrics = lyrics;
    this.tempo = tempo;

    // this.highlight = new Path.Rectangle(view.bounds);
    // this.highlight.fillColor = 'white';
    // this.highlight.blendMode = 'multiply';
  }

  onAnimationFrame(ev: AnimationFrameEvent) {
    const beatNo = timeToBeat(ev.time, this.tempo);

    const l = this.lyrics.find(l => l.startBeat < beatNo && l.endBeat > beatNo);
    if (l && this.currentLyricsLine !== l) {
      console.log('lyrics', l)
      if (this.path) {
        this.path.remove()
      }
      this.currentLyricsLine = l;
      
      const fontSize = 12 * window.devicePixelRatio;
      this.path = new PointText(
        new Point(
          view.center.x,
          view.size.height - this.config.paddingBottom/2 + fontSize/2,
        )
      );
      this.path.content = l.text;
      this.path.style = {
          ...this.path.style,
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: fontSize,
          fillColor: new paper.Color(theme.noteLines.text),
          justification: 'center'
      };
    }
  }
}


class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  melodySingAnimationElement: MelodySingAnimationElement;
  melodyLyricsAnimationElement: MelodyLyricsAnimatonElement;
  pitchDetector: PitchDetector;
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
    this.config = {
      paddingTop: 20 * window.devicePixelRatio,
      paddingBottom: 60 * window.devicePixelRatio,
      melodySingPixelsPerSecond: 100,
      ...DIFFICULTY_LEVEL_TO_MELODY_CONFIG_MAP[difficultyLevel],
    }
    this.onStopped = onStopped;
    this.melody = melody;
    // setup paper.js
    this.canvas = canvas;
    paper.setup(canvas)

    // TODO: breaks on mobile. Is it even necessary?
    // Looks important. Maybe just don't include this logic on mobile?
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
      Math.min(...melody.notesSing.filter(ns => !!ns.freq).map(ns => ns.freq!)),
      Math.max(...melody.notesSing.filter(ns => !!ns.freq).map(ns => ns.freq!)),
    );

    const paddingTop: Pixel = this.config.paddingTop;
    const paddingBottom: Pixel = this.config.paddingBottom;
    const heightWithoutPadding: Pixel = view.size.height - paddingTop - paddingBottom;
    const minNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(this.notesForNoteLines[this.notesForNoteLines.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    this.freqToCanvasYPosition = getFreqToCanvasYPositionFn(
      minNoteLogFreq, pixelsPerLogHertz, paddingBottom, view.size.height
    );

    this.melodySingAnimationElement = new MelodySingAnimationElement({
      melodySingElements: melody.notesSing,
      tempo: melody.tempo,
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      config: this.config,
    });
  
    this.melodyLyricsAnimationElement = new MelodyLyricsAnimatonElement({
      lyrics: melody.lyrics,
      tempo: melody.tempo,
      config: this.config,
    });
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

  this.pitchDetector = new PitchDetector();
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
      this.melodySingAnimationElement.onAnimationFrame(ev, currentPitch);
      this.melodyLyricsAnimationElement.onAnimationFrame(ev);
      if (this.melodySingAnimationElement.isCompleted()) {
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

    this.onStopped(this.melodySingAnimationElement.melodySingScore);
  }
}

export default MelodyAnimation;