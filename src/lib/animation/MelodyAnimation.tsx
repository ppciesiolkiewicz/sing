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


    this.pitchHistoryPaths = new Array(10).fill(null).map(() => (
      new Path.Circle({
        center: view.center,
        radius: 2,
        fillColor: new paper.Color('#c9d128'),
        visible: false,
      })
    ));

    this.emaPitchHistoryPaths = new Array(10).fill(null).map(() => (
      new Path.Circle({
        center: view.center,
        radius: 2,
        fillColor: new paper.Color('#442ffa'),
        visible: false,
      })
    ));
  }

  movePitchCircle() {
    const [pitch, clarity, volume] = this.pitchDetector.getPitch();

    const pitchHistory = this.pitchDetector.pitchHistory.slice(-10).reverse();
    const emaPitchHistory = this.pitchDetector.emaPitchHistory.slice(-10).reverse();

    pitchHistory.forEach(([pitch], idx) => {
      const path = this.pitchHistoryPaths[idx]
      const y = this.freqToCanvasYPosition(pitch);
      const dest = new Point(view.size.width/2 - idx * 10, y);
      path.position = dest
      path.visible = true
    })

    emaPitchHistory.forEach(([pitch], idx) => {
      const path = this.emaPitchHistoryPaths[idx]
      const y = this.freqToCanvasYPosition(pitch);
      const dest = new Point(view.size.width/2 - idx * 10, y);
      path.position = dest
      path.visible = true
    })




    // console.log('[pitch, clarity, volume]', [pitch, clarity, volume])

    // TODO draw a tail for the main circle
    // const lastPitches = this.pitchDetector.getLastOutputs(10);

    // if (volume < 0.0005 || clarity < 0.5) {
    //   console.log([pitch, clarity, volume]);
    //   this.isSingPitchQualityAccepted = false;
    //   this.path.fillColor = new paper.Color(theme.pitchCircle.fail)
    //   this.path.visible = false;
    //   return null;
    // }

    // this.pitchHistory.push([pitch, clarity, volume])
    // const smoothingSamples = 20;
    // const alpha = .9;
    // const beta = 1 - alpha;
    // const [smoothPitch, smoothClarity, smoothVolume] = this.pitchHistory
    //   .slice(this.pitchHistory.length - smoothingSamples, this.pitchHistory.length)
    //   // .filter(([pitch, clarity, volume]) => {
    //   //   return clarity > 0.9;
    //   // })
    //   .reduce(([emaPitch, emaClarity, emaVolume], [pitch, clarity, volume]) => [
    //     emaPitch*beta + pitch*alpha,
    //     emaClarity*beta + clarity*alpha,  
    //     emaVolume*beta + volume*alpha,
    //   ], [pitch, clarity, volume]);

    // if (smoothClarity < 0.0005 || smoothClarity < this.clarityThreshold) {
    //   console.log([pitch, clarity, volume], [smoothPitch, smoothClarity, smoothVolume]);
    //   this.isSingPitchQualityAccepted = false;
    //   this.path.fillColor = new paper.Color(theme.pitchCircle.fail)
    //   this.path.visible = false;
    //   return null;
    // } else {
    //   this.path.visible = true;
    // }
    // this.smoothPitchHistory.push([smoothPitch, smoothClarity, smoothVolume]);
    
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

class MelodyAnimation {
  melody: Melody;
  canvas: HTMLCanvasElement;
  notesForNoteLines: ReturnType<typeof NoteModule.getAllNotes>;
  freqToCanvasYPosition: freqToCanvasYPosition;
  pitchDetector: PitchDetector = new PitchDetector();
  synth: Tone.PolySynth = new Tone.PolySynth().toDestination();
  melodySingPixelsPerSecond = 100;
  melodyNoteSelectedMaxFreqCentsDiff: number = 0.1;
  melodyPercentFrameHitToAccept = 0.5;
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
      pitchDetector: this.pitchDetector,
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

    // TODO: wait unitl PitchDetector is initialized
    setTimeout(() => {
      view.onFrame = async (ev: { delta: number, time: number, count: number }) => {
        pitchCircle.movePitchCircle()
  
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
    }, 1000);
  }

  stop() {
    if (view) {
      view.remove() 
    }
    this.onStopped();
  }
}

export default MelodyAnimation;