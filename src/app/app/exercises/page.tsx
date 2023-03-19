"use client";
import Link from 'next/link'
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useFetchExercises  } from '@/lib/fetch/hooks';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'

export default function Exercises() {
  const exercisesQuery = useFetchExercises();

  if (shouldRenderSWRResponseHandler(exercisesQuery)) {
    return <SWRResponseHandler
      query={exercisesQuery}
      errorMessage={exercisesQuery.error?.error}
    />
  }

  return (
    <Box sx={theme => ({
      flex: 1,
      p: 6,
      m: 0,
      // backgroundColor: theme.palette.background.default, 
    })}>
      {exercisesQuery.data.map((e) => (
        <Box key={e.id}>
          <Link href={`/app/exercises/exercise?id=${e.id}`}>
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
    </Box>
  );
}
