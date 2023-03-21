"use client";
import Link from 'next/link'
import { Grid, Box, Divider, Typography } from '@mui/material';
import { useFetchExercises  } from '@/lib/fetch/hooks';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import Card from '@/components/atoms/Card'
import { getAppExercisesExercisePath } from '@/lib/urls';

export default function Exercises() {
  const exercisesQuery = useFetchExercises();

  if (shouldRenderSWRResponseHandler(exercisesQuery)) {
    return <SWRResponseHandler
      query={exercisesQuery}
      errorMessage={exercisesQuery.error?.error}
    />
  }

  return (
    <Box mt={6}>
      <Typography variant={'h5'}>Vocal exercises</Typography>
      <Typography variant={'subtitle1'}>
        Vocal exercises based on your selected difficulty level and voice range
      </Typography>
      <Grid mt={2} container spacing={2}>
        {exercisesQuery.data.map((e) => (
          <Grid item xs={12} sm={4} md={4} xl={6}>
            <Link href={getAppExercisesExercisePath({ exerciseId: e.id })}>
              <Card
                key={e.id}
                cardContentSlot={
                  <>
                    <Typography variant="h6">
                      {e.title}
                    </Typography>
                    <Typography variant="body1">
                      {e.description}
                    </Typography>
                  </>
                }
                cardActionsSlot={<div></div>}
                />
              </Link> 
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
