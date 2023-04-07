"use client";
import { useState } from 'react';
import { Box } from '@mui/material';
import { Melody } from '@/lib/Melody';
import { ConfigPanelDrawer } from '@/components/blocks/ConfigPanel';
import MelodyExercise from '@/components/blocks/MelodyExercise';


export default function ExerciseConfigurator() {
  const [started, setStarted] = useState(false);
  const [melody, setMelody] = useState<Melody | null>(null);

  return (
    <>
      <Box width={'100%'} height={'100%'}>
        <MelodyExercise
          started={started}
          setStarted={setStarted}
          melody={melody}
          onStopped={() => {
            // TODO: open drawer
          }}
        />
      </Box>
      <ConfigPanelDrawer
        started={started}
        onStartClick={(melody: Melody) => {
          console.log(melody)
          setMelody(melody)
          setStarted(!started)
        }}
      />
    </>
  )
}
