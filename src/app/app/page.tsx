"use client";
import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@/components/atoms/Card';
import ProfilePage from './profile/page'
import {
  getAppExercisesPath,
  getAppCustomExercisesPath,
} from '@/lib/urls';


export default function Dashboard() {
  return (
    <Box sx={theme => ({
      flex: 1,
      p: 6,
      m: 0,
      // backgroundColor: theme.palette.background.default, 
    })}>
      <ProfilePage />
      <Grid container spacing={2} mt={4} alignItems="stretch">
        <Grid item xs={6}>
          <Link href={getAppExercisesPath()}>
            <Card
              cardContentSlot={
                <Typography variant={'body1'}>
                  Singing scales, intervals, and over the chords are vocal exercises that help singers improve their pitch accuracy, expand their vocal range, and warm up their voice, leading to better control and flexibility.
                </Typography>
              }
              cardActionsSlot={
                <Button variant={'contained'} color={'secondary'}>
                  Go to exercises
                </Button>
              }
            />
          </Link>
        </Grid>
        <Grid item xs={6}>
          <Link href={getAppCustomExercisesPath()}>
            <Card
              cardContentSlot={
                <Typography variant={'body1'}>
                  Our customizable vocal exercises app allows users to create personalized warm-up routines, practice pitch accuracy, breath control, and vocal agility. With adjustable difficulty levels, users can track their progress and achieve their singing goals.
                </Typography>
              }
              cardActionsSlot={
                <Button variant={'contained'} color={'secondary'}>
                  Go to exercise configurator
                </Button>
              }
            />
          </Link>
        </Grid>
      </Grid>
    </Box>
  )
}
