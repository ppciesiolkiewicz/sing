"use client";
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Melody } from '@/lib/Melody';
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

  return (
    <Container>
      <pre>
        {JSON.stringify(exerciseQuery.data)}
      </pre>
    </Container>
  )
}
