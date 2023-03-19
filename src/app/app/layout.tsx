"use client"
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';
import NoSSRWrapper from '@/components/atoms/NoSSRWrapper';
import AppBar from '@/components/atoms/AppBar';
import Container from '@/components/atoms/Container'; // TODO: maybe bundle with AppBar?
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
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
      <AppBar />
      <Container>
        <NoSSRWrapper>
          {children}
        </NoSSRWrapper>
      </Container>
    </>
  )
}
