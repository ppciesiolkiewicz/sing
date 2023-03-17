"use client";
import Link from 'next/link'
import { useState } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Melody } from '@/lib/Melody';
import Container from '@/components/atoms/Container';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import { useFetchExercises  } from '@/hooks/fetch';


export default function Exercises() {
  const exercisesQuery = useFetchExercises();

  if (exercisesQuery.isLoading) {
    return <Box>Loading...</Box>
  }

  return (
    <Container>
      {exercisesQuery.data.map((e) => (
        <Box>
          <Link href={`/exercises/exercise?id=${e.id}`}>
            <Box>
              <Typography variant="h6">
                {e.title}
              </Typography>
              <Typography variant="body1">
                {e.description}
              </Typography>
            </Box>
          </Link>
        </Box>
      ))}
    </Container>
  )
}
