"use client"
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';
import NoSSRWrapper from '@/components/atoms/NoSSRWrapper';
import AppBar from '@/components/atoms/AppBar';
import Container from '@/components/atoms/Container'; // TODO: maybe bundle with AppBar?
import Loader from '@/components/atoms/Loader';
import { useFetchUser } from '@/lib/fetch/hooks';
import {
  getLandingPagePath,
} from '@/lib/urls';

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

  if (userQuery.isLoading) {
    return (
      <Box width={'100vw'} height={'100vh'}>
        <Loader />
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
