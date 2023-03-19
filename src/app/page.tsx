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
      <Box>
        <SignUp />
      </Box>
      <Box mt={5}>
        <LogIn />
      </Box>
    </>
  )
}
