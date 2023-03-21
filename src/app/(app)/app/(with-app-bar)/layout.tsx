"use client"
import NoSSRWrapper from '@/components/atoms/NoSSRWrapper';
import AppBar from '@/components/atoms/AppBar';
import Container from '@/components/atoms/Container'; // TODO: maybe bundle with AppBar?

export default function LoggedInAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
