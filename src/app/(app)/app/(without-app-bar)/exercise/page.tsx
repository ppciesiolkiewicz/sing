"use client";
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Box, Button } from "@mui/material";
import { Melody, MelodyBuilder } from '@/lib/Melody';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { useFetchExercise } from '@/lib/fetch/hooks';
import Modal from '@/components/atoms/Modal';

export default function ExercisePage() {
  const params = useSearchParams()
  const id = params?.get('id') as string;
  const exerciseQuery = useFetchExercise({ id });
  const [melody, setMelody] = useState<null | Melody>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (exerciseQuery.isLoading) {
      return;
    }

    const builder = new MelodyBuilder(exerciseQuery.data);
    const melody = builder.build();
    setMelody(melody);
  }, [exerciseQuery.isLoading]);

  
  if (shouldRenderSWRResponseHandler(exerciseQuery)) {
    return (
      <Box width={'100vw'} height={'100vh'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <SWRResponseHandler
          query={exerciseQuery}
          errorMessage={exerciseQuery.error?.error}
          />
      </Box>
    );
  }

  if (!melody) {
    return <Box>Loading...</Box>
  }
  
  return (
    <Box width={'100%'} height={'100%'}>
      {/* TODO: MelodyExercise cannot request microphone permission */}
      {started && <MelodyExercise
        melody={melody}
        started={started}
        setStarted={setStarted}
      />}
      <Modal
        open={!started}
      >
        <Box display={'flex'} justifyContent={'center'}>
          <Button color={'primary'} variant={'contained'} onClick={() => setStarted(true) }>
            Start
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}
