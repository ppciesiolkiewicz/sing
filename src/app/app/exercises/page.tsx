"use client";
import Link from 'next/link'
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Loader from '@/components/atoms/Loader';
import { useFetchExercises  } from '@/lib/fetch/hooks';


export default function Exercises() {
  const exercisesQuery = useFetchExercises();

  if (exercisesQuery.isLoading) {
    return <Loader />
  }

  return (
    <>
      {exercisesQuery.data.map((e) => (
        <Box>
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
    </>
  );
}
