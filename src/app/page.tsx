"use client";
import { Inter } from '@next/font/google'
import { useRef, useState, useLayoutEffect } from 'react';
import paper, { view, Path, Group, Point, Size, PointText, Rectangle } from 'paper'
import * as Tone from 'tone';
import Box from '@mui/material/Box';
import { Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';
import PitchDetector from '@/lib/PitchDetector';
import { ConfigPanelDrawer } from '@/components/blocks/ConfigPanel';

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
  },
};


export default function Home() {
  const [started, setStarted] = useState(false);
  const [melody, setMelody] = useState<Melody | null>(null);
  const pitchDetectorRef = useRef<PitchDetector | null>(null);
  const canvasRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!navigator.getUserMedia) {
      alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
      return;
    }

    if (!started || pitchDetectorRef.current) {
      return;
    }

    pitchDetectorRef.current = new PitchDetector();
  }, [started])

  useLayoutEffect(function render() {
    if (!started || !melody) {
      if (view) {
        view.remove()
      }
      return;
    }

    // TODO: what if notes are same? Should add padding of at least 1 note each direction
    const CHROMATIC_SCALE_NOTES = NoteModule.getAllNotes(
      Math.min(...melody.melodySing.map(e => e.note.freq!)),
      Math.max(...melody.melodySing.map(e => e.note.freq!)),
    );


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

    function movePitchCircle(
      [pitch, clarity, volume]: ReturnType<typeof PitchDetector.getPitch>,
      pitchCircle: any
    ) {
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
        line.strokeWidth = 1;// * window.devicePixelRatio;
        line.strokeColor = new paper.Color(theme.noteLines.line);
        line.strokeCap = 'round';

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
    // console.log('Synth.get', synth.get())
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
    view.onFrame = async (ev: { delta: number, time: number, count: number }) => {
      if (!pitchDetectorRef.current || !pitchDetectorRef.current.initialized) {
        return
      }

      movePitchCircle(pitchDetectorRef.current.getPitch(), pitchCircle);


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
          // TODO show results - have a function that runs on Stop as well
          view.remove();
          setStarted(false);
        }
      })
    }
  }, [started]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box>
        <canvas style={{ width: '100%', height: '100%' }} id="canvas" ref={canvasRef} />
      </Box>
      <ConfigPanelDrawer
        started={started}
        onStartClick={(melody: Melody) => {
          setMelody(melody)
          setStarted(!started)
        }}
      />
    </main>
  )
}
