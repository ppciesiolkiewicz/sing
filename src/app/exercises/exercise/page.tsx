"use client";
import { useSearchParams } from 'next/navigation'
import Box from "@mui/material/Box";
import { Melody, MelodyConfig } from '@/lib/Melody';
import Container from '@/components/atoms/Container';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import { useFetchExercise  } from '@/hooks/fetch';

export default function Exercise() {
  const params = useSearchParams()
  const id = params?.get('id') as string;
  const exerciseQuery = useFetchExercise({ id });

  if (exerciseQuery.isLoading) {
    return <Box>Loading...</Box>
  }

  const melodyConfig = MelodyConfig.fromObject(exerciseQuery.data)
  const melody = new Melody(melodyConfig)
  return (
    <Container>
      <MelodyExercise
        melody={melody}
        started={true}
        setStarted={() => {}}
      />
    </Container>
  )
}
