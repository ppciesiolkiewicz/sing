"use client";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Melody } from '@/lib/Melody';
import Container from '@/components/atoms/Container';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import { fetchExercise  } from '@/hooks/fetch';

export default function Exercise() {
  const router = useRouter()
  const id = router.query.id as string;
  const exerciseQuery = fetchExercise({ id });

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
