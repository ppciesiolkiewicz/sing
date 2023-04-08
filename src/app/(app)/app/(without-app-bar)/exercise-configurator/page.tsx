"use client";
import { useState } from 'react';
import { Box } from '@mui/material';
import { Melody } from '@/lib/Melody';
import { ConfigPanelDrawer } from '@/components/blocks/ConfigPanel';
import MelodyExercise, { useMelodyExerciseStateManagement } from '@/components/blocks/MelodyExercise';


export default function ExerciseConfigurator() {
  const [melody, setMelody] = useState<Melody | null>(null);
  const [isDrawerOpened, setIsDrawerOpened] = useState(true);
  const stateManagement = useMelodyExerciseStateManagement();

  const openDrawer = () => {
    setIsDrawerOpened(true);
    stateManagement.pause();
  };

  const closeDrawer = () => {
    setIsDrawerOpened(false);
    stateManagement.start();
  };


  return (
    <>
      <Box width={'100%'} height={'100%'}>
        <MelodyExercise
          melody={melody}
          onStopped={() => {
            openDrawer();
          }}
          onPaused={() => {
            openDrawer();
          }}
          tempoOverwrite={melody?.tempo}
          stateManagement={stateManagement}
        />
      </Box>
      <ConfigPanelDrawer
        isAnimationPaused={stateManagement.isPaused()}
        isOpened={isDrawerOpened}
        onOpen={openDrawer}
        onClose={closeDrawer}
        onStartClicked={(melody: Melody) => {
          setMelody(melody)
          stateManagement.restart();
        }}
        onResumeClicked={() => {
          stateManagement.start()
          closeDrawer();
        }}
      />
    </>
  )
}
