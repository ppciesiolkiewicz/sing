"use client"
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import NoSSRWrapper from '@/components/atoms/NoSSRWrapper';
import AppBar from '@/components/atoms/AppBar';
import Container from '@/components/atoms/Container'; // TODO: maybe bundle with AppBar?
import Loader from '@/components/atoms/Loader';
import { useFetchUser } from '@/hooks/fetch';


export default function LoggedInAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userQuery = useFetchUser();
  
  useEffect(() => {
    if (!userQuery.data && !userQuery.isValidating) {
      redirect('/login')
    }
  }, [userQuery.data, userQuery.isValidating]);

  if (userQuery.isLoading) {
    return (
      <Loader />
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
