"use client"
import './globals.css'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import NoSSRWrapper from '@/components/atoms/NoSSRWrapper';

const theme = createTheme({
  palette: {
    primary: {
      main: '#fa6'
    }
  }
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <html lang="en">
        {/*
          <head /> will contain the components returned by the nearest parent
          head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
        */}
        <head />
        <body>
          <NoSSRWrapper>
            {children}
          </NoSSRWrapper>
        </body>
      </html>
    </ThemeProvider>
  )
}
