"use client";
import Link from 'next/link'
import { useState } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Melody } from '@/lib/Melody';
import Container from '@/components/atoms/Container';
import MelodyExercise from '@/components/blocks/MelodyExercise';
import { useFetchExercises  } from '@/hooks/fetch';


export default function Exercises() {
  const exercisesQuery = useFetchExercises();

  if (exercisesQuery.isLoading) {
    return <Box>Loading...</Box>
  }

  console.log(exercisesQuery)

  return (
    <Container>
      <Grid container spacing={2}>
        {exercisesQuery.data.map((e) => (
          <Grid item xs={12} key={e.title}>
            <Link href={`/exercises/exercise?id=${e.id}`}>
              <Paper>
                {e.title}
                {e.description}
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
