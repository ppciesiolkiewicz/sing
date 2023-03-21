"use client"
import { useRouter } from 'next/navigation';
import { Box, Fab } from "@mui/material";
import ArrowBack from '@mui/icons-material/ArrowBack';
import { getAppExercisesPath } from '@/lib/urls';

export default function GoBackLayout({ children }: { children: JSX.Element }) {
  const router = useRouter();

  return (
    <>
      <Fab
        color="primary"
        aria-label="settings"
        size={'small'}
        onClick={() => {
          router.push(getAppExercisesPath());
        }}
        sx={{ position: 'absolute', left: '10px', top: '10px' }}
      >
        <ArrowBack />
      </Fab>
      <Box>
        {children}
      </Box>
    </>
  );
}