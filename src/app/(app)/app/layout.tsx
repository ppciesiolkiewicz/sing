"use client"
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { enqueueSnackbar } from '@/components/atoms/Snackbar';
import { useFetchUser } from '@/lib/fetch/hooks';
import { getLandingPagePath } from '@/lib/urls';

export default function LoggedInAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userQuery = useFetchUser();
  
  useEffect(() => {
    if (!userQuery.data && !userQuery.isValidating) {
      enqueueSnackbar({
        message: 'Please Log In to use the app',
        variant: 'warning',
      })
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


  return children;
}
