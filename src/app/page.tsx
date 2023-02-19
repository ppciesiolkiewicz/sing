"use client";
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from './page.module.css'
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { PitchDetector as PD } from 'pitchy';
import paper, { view, Path, Group, Point, Size, PointText, Rectangle } from 'paper'
import { NoteModule, ScaleModule } from './music';
import * as Tone from 'tone';


// type PitchDetectorProps = {
//   clarityThreshold: number;
//   analyserMinDecibels: number;
//   analyserMaxDecibels: number;
//   analyserSmoothingTimeConstant: number;
//   cb: (pitch: number, clarity: number) => void;
// };

// function PitchDetector({
//   clarityThreshold,
//   analyserMinDecibels,
//   analyserMaxDecibels,
//   analyserSmoothingTimeConstant,
//   cb,
// }: PitchDetectorProps): null {

//   const updatePitch = useCallback(
//       (analyserNode, detector, input, sampleRate) => {
//           analyserNode.getFloatTimeDomainData(input);
//           const [pitch, clarity] = detector.findPitch(input, sampleRate);

//           window.requestAnimationFrame(() => updatePitch(analyserNode, detector, input, sampleRate));
//           cb(pitch, clarity);
//       },
//       [clarityThreshold]
//   );

//   useEffect(() => {
//       if (!navigator.getUserMedia) {
//           alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
//           return;
//       }

//       navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
//           const audioContext = new window.AudioContext();
//           const analyserNode = audioContext.createAnalyser();
//           analyserNode.minDecibels = analyserMinDecibels;
//           analyserNode.maxDecibels = analyserMaxDecibels;
//           analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;

//           const sourceNode = audioContext.createMediaStreamSource(stream);
//           sourceNode.connect(analyserNode);
//           const detector = PD.forFloat32Array(analyserNode.fftSize);
//           const input = new Float32Array(detector.inputLength);
//           updatePitch(analyserNode, detector, input, audioContext.sampleRate);
//       });
//   }, [analyserMaxDecibels, analyserMinDecibels, analyserSmoothingTimeConstant, updatePitch]);

//   return null;
// }

// PitchDetector.defaultProps = {
//   clarityThreshold: 0.98,
//   analyserMinDecibels: -35,
//   analyserMaxDecibels: -10,
//   analyserSmoothingTimeConstant: 0.85,
// };

const inter = Inter({ subsets: ['latin'] })

type Hz = number;
type LogHz = number;
type Pixel = number;
type PixelPerHz = number;

const MIN_PITCH = 100;
const MAX_PITCH = 500;

const octaves = [2,3,4,5];
const scale = ScaleModule.get('C', 'major')
const scaleNotes = octaves.map(octave =>
  scale.notes.map(note => NoteModule.get(`${note}${octave}`))
).flat().filter(n => n.freq! > MIN_PITCH && n.freq! < MAX_PITCH)

const melody = [
  {
    start: 1,
    end: 5,
    note: NoteModule.get(`C3`),
    framesHit: 0,
    totalFrames: 0,
    completed: false,
    percentHit: 0,
  },
  {
    start: 6,
    end: 8,
    note: NoteModule.get(`E3`),
    framesHit: 0,
    totalFrames: 0,
    completed: false,
    percentHit: 0,
  },
  {
    start: 9,
    end: 11,
    note: NoteModule.get(`G3`),
    framesHit: 0,
    totalFrames: 0,
    completed: false,
    percentHit: 0,
  },
]

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
  const streamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!navigator.getUserMedia) {
      alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
      return;
    }

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const analyserMinDecibels = -35
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = 0.85
    
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
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
  }, [])

  useEffect(() => {
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
    
    const pitchCircle = new Path.Circle({
      center: view.center,
      radius: 10,
      fillColor: 'red'
    });


    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(scaleNotes[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(scaleNotes[scaleNotes.length - 1].freq!);
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
        pitchCircle.visible = false;
        return null;
      }

      pitchCircle.visible = true;
  
      pitchCircle.fillColor.hue += 1;
      const dest = new Point(view.size.width/2, freqToCanvasYPosition(pitch));
      pitchCircle.position = dest
    }

    function drawScaleLines() {
      scaleNotes.forEach((note) => {
        const noteYPosition = freqToCanvasYPosition(note.freq!);
        const line = new Path.Line(
          new Point(0, noteYPosition),
          new Point(view.size.width, noteYPosition),
        );
        line.strokeWidth = 1 * window.devicePixelRatio;
        line.strokeColor = 'white';
  
        var text = new PointText(new Point(20, noteYPosition));
        text.content = note.name;
        text.style = {
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 12 * window.devicePixelRatio,
            fillColor: 'red',
            justification: 'center'
        };
      });
    }

    // Synth
    const synth = new Tone.Synth().toDestination();

    // draw melody elements
    const melodyPixelsPerSecond = 100;
    const melodyNoteSelectedMaxFreqDiff: Hz = 10;
    const melodyPercentFrameHitToAccept = 0.5;
    const melodyElements = melody.map(m => {
      const startPosX =  m.start * melodyPixelsPerSecond;
      const startPosY = freqToCanvasYPosition(m.note.freq!) - 10;
      const endPosX = m.end * melodyPixelsPerSecond;
      const endPosY = freqToCanvasYPosition(m.note.freq!) + 10;

      const rect = new Rectangle(
        new Point(view.center.x + startPosX, startPosY),
        new Size(endPosX - startPosX, endPosY - startPosY),
      )
      const path = new Path.Rectangle(rect);
      path.fillColor = '#e9e9ff';
      path.selected = false;

      return [path, rect];
    });


    drawScaleLines();
    view.onFrame = async (ev) => {
      if (!streamRef.current) {
        return
      }

      movePitchCircle(streamRef.current, pitchCircle);
      // console.log(ev)

      melodyElements.forEach(([path, rect], idx) => {
        var dest = new Point(path.position.x - ev.delta * melodyPixelsPerSecond, path.position.y);
        path.position = dest;


        if (!melody[idx].completed) {
          
          if (path.bounds.left < view.center.x) {

            if (!melody[idx].started) {
              melody[idx].started = true;
              const now = Tone.now()
              console.log(now)
              // trigger the attack immediately
              synth.triggerAttack(melody[idx].note.name, now)
              // wait one second before triggering the release
              synth.triggerRelease(now + 1)
            }

            melody[idx].totalFrames += 1;

            if (
              pitchCircle.position.y < path.bounds.bottom &&
              pitchCircle.position.y > path.bounds.top
            ) {
              path.selected = true;
              melody[idx].framesHit += 1;
            } else {
              path.selected = false;
            }
          }
        }
        

        if (!melody[idx].completed && path.bounds.right < view.center.x) {
          melody[idx].completed = true;
          melody[idx].percentHit = (melody[idx].framesHit / melody[idx].totalFrames);
          console.log('percentHit: ', melody[idx].percentHit)
          path.selected = false;
        }

        if (melody[idx].completed && melody[idx].percentHit > melodyPercentFrameHitToAccept) {
          path.fillColor = 'green';
        }
      })
    }
  }, []);

  return (
    <main>
      <canvas style={{ width: '100vw', height: '100vh', background: 'black' }} id="canvas" ref={canvasRef} />
    </main>
  )
}
