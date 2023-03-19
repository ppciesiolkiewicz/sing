"use client";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LogIn from './login/page';
import SignUp from './signup/page';

export default function Home() {
  return (
    <>
      <Typography variant={'h5'}>
        Home Page
      </Typography>
      <Typography variant={'body1'}>
        Looking to improve your singing voice and take it to the next level? Our web application offers a comprehensive set of vocal exercises that can help you achieve your singing goals. Whether you're a beginner or an experienced singer, our exercises are designed to help you develop your voice, improve your pitch accuracy, increase your range, and enhance your tone.

        Our singing scales exercise will help you build your vocal range, improve your pitch control, and strengthen your voice. You'll be able to sing up and down the scale in different keys, which will help you become more comfortable with different notes and tones.

        With our singing over the chords exercise, you'll be able to practice your ability to stay on pitch while navigating chord changes. This is an essential skill for any singer, and our exercise will help you develop your ear and improve your accuracy.

        Our singing intervals exercise will help you develop your ability to recognize and sing intervals accurately. This exercise is important for building your musical ear and improving your overall pitch control.

        Our web application also includes other vocal exercises, such as breathing exercises, vocal warm-ups, and tongue and lip trills. These exercises are designed to help you prepare your voice for singing, improve your breath support, and develop better articulation and control over your voice.

        So, what are you waiting for? Start your vocal journey today and unlock your full singing potential with our web application's comprehensive vocal exercises.
      </Typography>
      <Box>
        <SignUp />
      </Box>
      <Box mt={5}>
        <LogIn />
      </Box>
    </>
  )
}
