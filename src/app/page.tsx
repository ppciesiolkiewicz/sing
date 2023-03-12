"use client";
import { Inter } from '@next/font/google'
import { useRef, useState, useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import { Melody } from '@/lib/Melody'
import { ConfigPanelDrawer } from '@/components/blocks/ConfigPanel';
import MelodyAnimation from '@/lib/animation/MelodyAnimation';


export default function Home() {
  const [started, setStarted] = useState(false);
  const [melody, setMelody] = useState<Melody | null>(null);
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<MelodyAnimation | null>(null);


  useLayoutEffect(function render() {
    if (!started) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

 
    animationRef.current = new MelodyAnimation(
      melody!, canvasRef.current, () => setStarted(false),
    );
    animationRef.current.start();
  }, [started, melody]);

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
