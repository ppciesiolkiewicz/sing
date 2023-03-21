"use client";
import { Box, Typography, Divider, Paper } from '@mui/material';
import LogIn from './login/page';
import SignUp from './signup/page';
import Footer from '@/components/atoms/Footer'

export default function Home() {
  return (
    <>
      <Box maxWidth={'md'} margin={'auto'} p={[1, 4, 8]}>
        <Typography variant={'h3'}>
            Sing5
        </Typography>
        <Typography variant={'subtitle1'}>
          All things singing
        </Typography>

        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} mt={5}>
          <Box>
            <Typography variant={'h5'} gutterBottom>
              Learn to Sing with Ease
            </Typography>
            <Typography variant={'body1'}>
              Our app is designed to help you improve your singing skills through targeted exercises that focus on singing scales, singing over chords, and singing intervals. With the help of our experienced vocal coaches, you can develop your voice and reach new heights in your singing journey.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4, mx: -6 }}></Divider>

        <Typography variant={'h5'} gutterBottom mt={3} mb={2}>
          How to start?
        </Typography>

        {/* <Divider sx={{ my: 3 }}>
          <Typography variant={'overline'} gutterBottom>
            How to start?
          </Typography>
        </Divider> */}
        
        <Paper sx={{ p: 4 }}>
          <SignUp />
        </Paper>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant={'overline'} gutterBottom>
            Or
          </Typography>
        </Divider>
        
        <Paper sx={{ p: 4 }}>
          <LogIn />
        </Paper>

        <Divider sx={{ my: 3, mx: -6 }}>
          <Typography variant={'overline'} gutterBottom>
              Learn more
            </Typography>
        </Divider>

        <Box mt={5} display={'flex'} flexDirection={'column'} alignItems={'center'}>
          <Box>
            <Typography variant={'h5'} gutterBottom>
              Singing Scales
            </Typography>
            <Typography variant={'body1'} gutterBottom>
                Master the basics of singing by practicing scales. Our app provides a range of exercises to help you develop your pitch, tone, and control. Whether you are a beginner or an experienced singer, our scales exercises will help you improve your voice.
            </Typography>

            <Divider sx={{ my: 3 }}></Divider>

            <Typography variant={'h5'} gutterBottom>
              Singing Over Chords
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Learning to sing over chords is an essential skill for any singer. Our app provides a variety of exercises that teach you how to sing confidently and accurately over different chord progressions. With our app, you can develop your ability to sing in key and stay on pitch.
            </Typography>

            <Divider sx={{ my: 3 }}></Divider>

            <Typography variant={'h5'} gutterBottom>
              Singing Intervals
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Singing intervals is an advanced skill that can take your singing to the next level. Our app provides a range of exercises that help you develop your ability to sing intervals accurately and confidently. With our app, you can train your ear to recognize intervals and sing them with ease.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }}></Divider>

        <Box mt={5} display={'flex'} flexDirection={'column'} alignItems={'center'}>
          <Box>
            <Typography variant={'h5'} gutterBottom>
              Want to know more?
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Looking to improve your singing voice and take it to the next level? Our web application offers a comprehensive set of vocal exercises that can help you achieve your singing goals. Whether you're a beginner or an experienced singer, our exercises are designed to help you develop your voice, improve your pitch accuracy, increase your range, and enhance your tone.
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Our singing scales exercise will help you build your vocal range, improve your pitch control, and strengthen your voice. You'll be able to sing up and down the scale in different keys, which will help you become more comfortable with different notes and tones.
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              With our singing over the chords exercise, you'll be able to practice your ability to stay on pitch while navigating chord changes. This is an essential skill for any singer, and our exercise will help you develop your ear and improve your accuracy.
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Our singing intervals exercise will help you develop your ability to recognize and sing intervals accurately. This exercise is important for building your musical ear and improving your overall pitch control.
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              Our web application also includes other vocal exercises, such as breathing exercises, vocal warm-ups, and tongue and lip trills. These exercises are designed to help you prepare your voice for singing, improve your breath support, and develop better articulation and control over your voice.
            </Typography>
            <Typography variant={'body1'} gutterBottom>
              So, what are you waiting for? Start your vocal journey today and unlock your full singing potential with our web application's comprehensive vocal exercises.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
