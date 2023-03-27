"use client"
import './globals.css'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import ErrorBoundary from '@/components/atoms/ErrorBoundary'


let theme = createTheme({
  palette: {
    primary: {
      main: '#F4D35E'
    },
    secondary: {
      main: '#0D82B5',
    },
    error: {
      main: '#F95738',
    },
    text: {
      primary: '#102E4A',
      secondary:'#000',
      disabled: '#88A09E',
    }
  },
  typography: {
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
  }
});
theme = responsiveFontSizes(theme);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
