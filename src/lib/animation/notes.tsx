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

class MelodyResults {
  notesResults: {
    framesHit: number;
    totalFrames: number;
    started: boolean;
    completed: boolean;
    percentHit: number;
  }[];
  constructor(melody: Melody, pixelsPerSecond: number) {
    this.notesResults = melody.melodySing.map(n => ({
      totalFrames: n.duration * pixelsPerSecond,
      framesHit: 0,
      started: false,
      completed: false,
      percentHit: 0,
    }));
  }

  isMelodyCompleted() {
    return this.notesResults[this.notesResults.length - 1].completed
  }
}

type freqToCanvasYPosition = (freq: Hz) => Pixel;
const getFreqToCanvasYPositionFn = (
  minNoteLogFreq: LogHz, pixelsPerLogHertz: PixelPerHz, padding: Pixel
): freqToCanvasYPosition => (freq: Hz) => {
  return Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq! * pixelsPerLogHertz + padding;
};

class PitchCircle {
  path: typeof Path.Circle;
  freqToCanvasYPosition: freqToCanvasYPosition;
  isSingPitchQualityAccepted: boolean;

  constructor({ freqToCanvasYPosition }: { freqToCanvasYPosition: freqToCanvasYPosition }) {
    this.path = new Path.Circle({
      center: view.center,
      radius: 10,
      fillColor: new paper.Color(theme.pitchCircle.normal)
    });
    this.freqToCanvasYPosition = freqToCanvasYPosition;
    this.isSingPitchQualityAccepted = false;
  }

  movePitchCircle(
    [pitch, clarity, volume]: ReturnType<InstanceType<typeof PitchDetector>['getPitch']>,
  ) {
    if (volume < 0.02 || clarity < 0.5) {
      this.isSingPitchQualityAccepted = false;
      this.path.fillColor = new paper.Color(theme.pitchCircle.fail)
      return null;
    }

    this.isSingPitchQualityAccepted = true;
    this.path.fillColor = new paper.Color(theme.pitchCircle.success)
    const dest = new Point(view.size.width/2, this.freqToCanvasYPosition(pitch));
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

class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  freqToCanvasYPosition: freqToCanvasYPosition;
  pitchDetector: PitchDetector = new PitchDetector();
  synth: Tone.PolySynth = new Tone.PolySynth().toDestination();
  melodySingPixelsPerSecond = 100;
  melodyNoteSelectedMaxFreqDiff: Hz = 10;
  melodyPercentFrameHitToAccept = 0.5;
  onStopped: () => void;

  static runChecks() {
    // Required for PitchDetector
    if (!navigator.getUserMedia) {
      alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
      return;
    }
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
    // if (!this.pitchDetector.initialized) {
    //   throw Error("PitchDetector not initialized")
    // }
    const melody = this.melody;
    const results = new MelodyResults(melody, this.melodySingPixelsPerSecond);
    const noteLines = new NotesLines({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
      notes: this.notesForNoteLines,
    });
    const pitchCircle = new PitchCircle({
      freqToCanvasYPosition: this.freqToCanvasYPosition,
    });
    const melodySingRects = melody.melodySing.map(m => {
      const startPosX =  m.note.start * this.melodySingPixelsPerSecond;
      const startPosY = this.freqToCanvasYPosition(m.note.freq!) - 10;
      const endPosX = m.note.end * this.melodySingPixelsPerSecond;
      const endPosY = this.freqToCanvasYPosition(m.note.freq!) + 10;
  
      const rect = new Rectangle(
        new Point(view.center.x + startPosX, startPosY),
        new Size(endPosX - startPosX, endPosY - startPosY),
      )
      const path = new Path.Rectangle(rect);
      path.fillColor = new paper.Color(theme.noteRects.normal);
      path.selected = false;
  
      return [path, rect];
    });

    view.onFrame = async (ev: { delta: number, time: number, count: number }) => {
      pitchCircle.movePitchCircle(this.pitchDetector.getPitch())

      // melodyPlay
      melody.melodyPlay
        .forEach((m) => {
          if (!m.played && ev.time >= m.start) {
            this.synth.triggerAttackRelease(m.notes.map(n => n.name), m.duration)
            m.played = true;
          }
        });

        // melodySign
        melodySingRects.forEach(([path, rect], idx) => {
          var dest = new Point(path.position.x - ev.delta * this.melodySingPixelsPerSecond, path.position.y);
          path.position = dest;
    
    
          if (!results.notesResults[idx].completed) {
            
            if (path.bounds.left < view.center.x) {
    
              if (!results.notesResults[idx].started) {
                results.notesResults[idx].started = true;
              }
    
              if (
                pitchCircle.isSingPitchQualityAccepted &&
                pitchCircle.path.position.y < path.bounds.bottom &&
                pitchCircle.path.position.y > path.bounds.top
              ) {
                path.selected = true;
                melody.melodySing[idx].framesHit += 1;
              } else {
                path.selected = false;
              }
            }
          }

          if (!results.notesResults[idx].completed && path.bounds.right < view.center.x) {
            results.notesResults[idx].completed = true;
            results.notesResults[idx].percentHit = (
              results.notesResults[idx].framesHit / results.notesResults[idx].totalFrames
            );
            path.selected = false;
          }
    
          if (results.notesResults[idx].completed) {
            if (results.notesResults[idx].percentHit > this.melodyPercentFrameHitToAccept) {
              path.fillColor = new paper.Color(theme.noteRects.success);
            } else {
              path.fillColor = new paper.Color(theme.noteRects.fail);
            }
          }
        });
        
  
        if (results.isMelodyCompleted()) {
          // TODO show results - have a function that runs on Stop as well
          console.log(results);
          this.stop();
        }
    };
  }

  stop() {
    if (view) {
      view.remove() 
    }
    this.onStopped();
  }
}

export default MelodyAnimation;