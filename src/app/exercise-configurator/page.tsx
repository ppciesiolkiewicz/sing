"use client";
import { useState } from 'react';
import Box from '@mui/material/Box';
import { Melody } from '@/lib/Melody';
import { ConfigPanelDrawer } from '@/components/blocks/ConfigPanel';
import MelodyExercise from '@/components/blocks/MelodyExercise';


export default function Home() {
  const [started, setStarted] = useState(false);
  const [melody, setMelody] = useState<Melody | null>(null);

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
        <MelodyExercise
          started={started}
          setStarted={setStarted}
          melody={melody}
        />
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
