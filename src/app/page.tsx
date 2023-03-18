"use client";
import Link from 'next/link'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRef, useLayoutEffect, useState } from 'react';

export default function Home() {
  return (
    <>
      <Typography variant={'h5'}>
        Home Page
      </Typography>
      <Box>
        <Link href="/login">Log in</Link>
      </Box>
      <Box>
        <Link href="/signup">Sign up</Link>
      </Box>
    </>
  )
}
