"use client"
import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { Box, Fab } from "@mui/material";
import ArrowBack from '@mui/icons-material/ArrowBack';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { useFetchUser } from '@/lib/fetch/hooks';
import { getLandingPagePath, getAppExercisesPath } from '@/lib/urls';

export default function GoBackLayout({ children }: { children: JSX.Element }) {
  const router = useRouter();
  const userQuery = useFetchUser();
  
  useEffect(() => {
    if (!userQuery.data && !userQuery.isValidating) {
      redirect(getLandingPagePath())
    }
  }, [userQuery.data, userQuery.isValidating]);

  if (shouldRenderSWRResponseHandler(userQuery)) {
    return (
      <Box width={'100vw'} height={'100vh'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <SWRResponseHandler
          query={userQuery}
          errorMessage={userQuery.error?.error}
        />
      </Box>
    );
  }

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