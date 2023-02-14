"use client";
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from './page.module.css'
import { useRef, useState, useEffect, useCallback } from 'react';
import { PitchDetector as PD } from 'pitchy';

type PitchDetectorProps = {
    clarityThreshold: number;
    analyserMinDecibels: number;
    analyserMaxDecibels: number;
    analyserSmoothingTimeConstant: number;
    cb: (pitch: number, clarity: number) => void;
};

function PitchDetector({
    clarityThreshold,
    analyserMinDecibels,
    analyserMaxDecibels,
    analyserSmoothingTimeConstant,
    cb,
}: PitchDetectorProps): null {

    const updatePitch = useCallback(
        (analyserNode, detector, input, sampleRate) => {
            analyserNode.getFloatTimeDomainData(input);
            const [pitch, clarity] = detector.findPitch(input, sampleRate);

            window.requestAnimationFrame(() => updatePitch(analyserNode, detector, input, sampleRate));
              cb(pitch, clarity);
        },
        [clarityThreshold]
    );

    useEffect(() => {
        if (!navigator.getUserMedia) {
            alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const audioContext = new window.AudioContext();
            const analyserNode = audioContext.createAnalyser();
            analyserNode.minDecibels = analyserMinDecibels;
            analyserNode.maxDecibels = analyserMaxDecibels;
            analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;

            const sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNode.connect(analyserNode);
            const detector = PD.forFloat32Array(analyserNode.fftSize);
            const input = new Float32Array(detector.inputLength);
            updatePitch(analyserNode, detector, input, audioContext.sampleRate);
        });
    }, [analyserMaxDecibels, analyserMinDecibels, analyserSmoothingTimeConstant, updatePitch]);

    return null;
}

PitchDetector.defaultProps = {
    clarityThreshold: 0.98,
    analyserMinDecibels: -35,
    analyserMaxDecibels: -10,
    analyserSmoothingTimeConstant: 0.85,
};


const inter = Inter({ subsets: ['latin'] })


const UPDATE_RATE_MS = 200;

export default function Home() {
  const canvas = useRef<any>(null);
  const pitch = useRef<[number, number][]>([]);
  const processedPitch = useState<number[]>([]);
  const processedPitchLastIndex = useState<number>();
  const [updateIdx, setUpdateIdx] = useState<number>(0);
  const setPitchCb = (p: number, c: number) => {
    // console.log(p)
    pitch.current = [...pitch.current, [p, c]];
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setUpdateIdx(updateIdx + 1)
    }, UPDATE_RATE_MS);

    if (canvas.current && pitch.current.length > 0) {
      const cvs = canvas.current;
      const width = cvs.width;
      const height = cvs.height;
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#FF0000";

      const x = updateIdx;
      const y = (height - pitch.current[pitch.current.length - 1][0] )/ 10 + height/2;
      console.log(x, y, pitch.current[pitch.current.length - 1][0])
      ctx.fillRect(x, y, 2, 2);
    }

    return () => clearTimeout(t);
  }, [updateIdx, setUpdateIdx])


  return (
    <main className={styles.main}>
      <PitchDetector cb={setPitchCb} />
      {/* {JSON.stringify(pitch, null, '  ')} */}
      {JSON.stringify(updateIdx, null, '  ')}
      <canvas style={{ width: '100%', height: '500px', background: 'yellow' }}id="canvas" ref={canvas}>

      </canvas>
    </main>
  )
}
