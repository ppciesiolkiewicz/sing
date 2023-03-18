"use client";
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import Box from "@mui/material/Box";
import { Melody, MelodyConfig } from '@/lib/Melody';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import { useFetchExercise } from '@/hooks/fetch';

export default function Exercise() {
  const params = useSearchParams()
  const id = params?.get('id') as string;
  const exerciseQuery = useFetchExercise({ id });
  const [melody, setMelody] = useState<null | Melody>(null);

  useEffect(() => {
    if (exerciseQuery.isLoading) {
      return;
    }

    const melodyConfig = MelodyConfig.fromObject(exerciseQuery.data)
    const melody = new Melody(melodyConfig)
    setMelody(melody);
  }, [exerciseQuery.isLoading]);

  if (exerciseQuery.isLoading || !melody) {
    return <Box>Loading...</Box>
  }


  return (
    <Box width={'100%'}>
      <MelodyExercise
        melody={melody}
        started={true}
        setStarted={() => {}}
      />
    </Box>
  )
}
