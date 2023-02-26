"use client";
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from './page.module.css'
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { PitchDetector as PD } from 'pitchy';
import paper, { view, Path, Group, Point, Size, PointText, Rectangle } from 'paper'
import { NoteModule, ScaleModule, ChordModule } from './music';
import * as Tone from 'tone';
import {
  MelodyConfig,
  Melody,
} from './melodyGenerator2'


const inter = Inter({ subsets: ['latin'] })

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
  }
};

type Hz = number;
type LogHz = number;
type Pixel = number;
type PixelPerHz = number;


const chordConfig = MelodyConfig.fromChords({
  chordNames: ['C4maj', 'G4maj', 'D4min']
})
const scaleConfig = MelodyConfig.fromScale({
    scale: ScaleModule.get('C', 'major'),
    lowestNoteName: 'C4',
    highestNoteName: 'G5',
    repeatTimes: 5,
  })
const melody = new Melody(scaleConfig);


console.log({
  chordConfig,
  scaleConfig,
  melody,
})

function getPitch(analyserNode: any, detector: any, input: any, audioContext: any): [Hz, number, number] {
  analyserNode.getFloatTimeDomainData(input);

  let sumSquares = 0;
  for (const amplitude of input) {
    sumSquares += amplitude*amplitude;
  }
  const volume = Math.sqrt(sumSquares / input.length);
  const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

  return [pitch, clarity, volume]
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const streamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!navigator.getUserMedia) {
      alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
      return;
    }

    if (!started) {
      return;
    }

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const analyserMinDecibels = -35
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = 0.85
      const audioContext = new window.AudioContext();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
    
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      const detector = PD.forFloat32Array(analyserNode.fftSize);
      const input = new Float32Array(detector.inputLength);

      streamRef.current = {
        analyserNode, detector, input, audioContext,
      };
    })();
  }, [started])

  useLayoutEffect(() => {
    if (!started) {
      return;
    }


    const MIN_NOTE = NoteModule.fromFreq(Math.min(...melody.melodySing.map(e => e.note.freq!)));
    const MAX_NOTE = NoteModule.fromFreq(Math.max(...melody.melodySing.map(e => e.note.freq!)));
    const CHROMATIC_SCALE_OCTAVES = [2,3,4,5];
    const CHROMATIC_SCALE = ScaleModule.get('C', 'chromatic')
    const CHROMATIC_SCALE_NOTES = CHROMATIC_SCALE_OCTAVES.map(octave =>
      CHROMATIC_SCALE.notes.map(note => NoteModule.get(`${note}${octave}`))
    ).flat().filter(n => n.freq! >= MIN_NOTE.freq! && n.freq! <= MAX_NOTE.freq!)


    const canvas = canvasRef.current;
    paper.setup(canvas)

    if (window.devicePixelRatio > 1) {
      var ctx = canvas.getContext('2d');
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;
  
      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      // canvas.style.width = canvasWidth + "px";
      // canvas.style.height = canvasHeight + "px";
  
      ctx.scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
  }

  // set origin to bottom-left corner
  // ctx.translate(0, canvas.height);
  // ctx.scale(1, -1);
    
    const pitchCircle = new Path.Circle({
      center: view.center,
      radius: 10,
      fillColor: new paper.Color(theme.pitchCircle.normal)
    });

    let isSingPitchQualityAccepted = false;


    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(CHROMATIC_SCALE_NOTES[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(CHROMATIC_SCALE_NOTES[CHROMATIC_SCALE_NOTES.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    // console.log(minNoteLogFreq, maxNoteLogFreq, diffLogFreq, pixelsPerLogHertz);
    
    const freqToCanvasYPosition = (freq: number) => {
      return Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq! * pixelsPerLogHertz + padding;
    };

    function movePitchCircle(stream: any, pitchCircle: any) {
      const [pitch, clarity, volume] = getPitch(
        stream.analyserNode,
        stream.detector,
        stream.input,
        stream.audioContext,
      );
    
      if (volume < 0.02 || clarity < 0.5) {
        isSingPitchQualityAccepted = false;
        pitchCircle.fillColor = new paper.Color(theme.pitchCircle.fail)
        return null;
      }

      isSingPitchQualityAccepted = true;
      pitchCircle.fillColor = new paper.Color(theme.pitchCircle.success)
      const dest = new Point(view.size.width/2, freqToCanvasYPosition(pitch));
      pitchCircle.position = dest
    }

    function drawScaleLines() {
      CHROMATIC_SCALE_NOTES.forEach((note) => {
        const noteYPosition = freqToCanvasYPosition(note.freq!);
        const line = new Path.Line(
          new Point(0, noteYPosition),
          new Point(view.size.width, noteYPosition),
        );
        line.strokeWidth = 1 * window.devicePixelRatio;
        line.strokeColor = new paper.Color(theme.noteLines.line);
  
        const text = new PointText(new Point(15 * window.devicePixelRatio, noteYPosition));
        text.content = note.name;
        text.style = {
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 12 * window.devicePixelRatio,
            fillColor: new paper.Color(theme.noteLines.text),
            justification: 'center'
        };
      });
    }

    // Synth
    const synth = new Tone.PolySynth().toDestination();
    synth.set({
      oscillator: {
        // partialCount: 10,
        // type: 'sine',
      },
      portamento: 10,
      envelope: {
        attack: 0.5,
      }
    });
    // console.log(Tone.PolySynth.getDefaults().voice.getDefaults())
    console.log('Synth.get', synth.get())
    // draw melody elements
    const melodyPixelsPerSecond = 100;
    const melodyNoteSelectedMaxFreqDiff: Hz = 10;
    const melodyPercentFrameHitToAccept = 0.5;
    const melodySingRects = melody.melodySing.map(m => {
      const startPosX =  m.note.start * melodyPixelsPerSecond;
      const startPosY = freqToCanvasYPosition(m.note.freq!) - 10;
      const endPosX = m.note.end * melodyPixelsPerSecond;
      const endPosY = freqToCanvasYPosition(m.note.freq!) + 10;

      const rect = new Rectangle(
        new Point(view.center.x + startPosX, startPosY),
        new Size(endPosX - startPosX, endPosY - startPosY),
      )
      const path = new Path.Rectangle(rect);
      path.fillColor = new paper.Color(theme.noteRects.normal);
      path.selected = false;

      return [path, rect];
    });


    drawScaleLines();
    view.onFrame = async (ev: { delta: number, time: number }) => {
      if (!streamRef.current) {
        return
      }

      movePitchCircle(streamRef.current, pitchCircle);
      // console.log(ev)

      melody.melodyPlay
        .forEach((m) => {
          if (!m.played && ev.time >= m.start) {
            synth.triggerAttackRelease(m.notes.map(n => n.name), m.duration)
            m.played = true;
          }
        })


      melodySingRects.forEach(([path, rect], idx) => {
        var dest = new Point(path.position.x - ev.delta * melodyPixelsPerSecond, path.position.y);
        path.position = dest;


        if (!melody.melodySing[idx].completed) {
          
          if (path.bounds.left < view.center.x) {

            if (!melody.melodySing[idx].started) {
              melody.melodySing[idx].started = true;
            }

            melody.melodySing[idx].totalFrames += 1;

            if (
              isSingPitchQualityAccepted &&
              pitchCircle.position.y < path.bounds.bottom &&
              pitchCircle.position.y > path.bounds.top
            ) {
              path.selected = true;
              melody.melodySing[idx].framesHit += 1;
            } else {
              path.selected = false;
            }
          }
        }
        

        if (!melody.melodySing[idx].completed && path.bounds.right < view.center.x) {
          melody.melodySing[idx].completed = true;
          melody.melodySing[idx].percentHit = (melody.melodySing[idx].framesHit / melody.melodySing[idx].totalFrames);
          console.log('percentHit: ', melody.melodySing[idx].percentHit)
          path.selected = false;
        }

        if (melody.melodySing[idx].completed) {
          if (melody.melodySing[idx].percentHit > melodyPercentFrameHitToAccept) {
            path.fillColor = new paper.Color(theme.noteRects.success);
          } else {
            path.fillColor = new paper.Color(theme.noteRects.fail);
          }
        }

        if (melody.melodySing[melody.melodySing.length - 1].completed) {
          console.log("END")
        }
      })
    }
  }, [started]);

  return (
    <main>
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          display: started ? 'none' : undefined,
          width: '100vw',
          height: '100vh',
        }}
      >
        <button
          onClick={() => setStarted(true)}
          style={{ position: 'absolute', left: '50vw', top: '50vh', padding: '10px', display: started ? 'none' : undefined }}
        >
        start
      </button>
      </div>
      <canvas style={{ width: '100vw', height: '100vh' }} id="canvas" ref={canvasRef} />
    </main>
  )
}
