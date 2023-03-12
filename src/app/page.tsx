"use client";
import Link from 'next/link'
import Box from '@mui/material/Box';
import Container from '@/components/atoms/Container';

export default function Home() {
  return (
    <Container>
      <Box display={'flex'} flexDirection={'column'}>
        <Link href={'/exercises'}>Exercises</Link>
        <Link href={'/exercise-configurator'}>Exercise Configurator</Link>
      </Box>
    </Container>
  )
}
