"use client"
import './globals.css'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

const theme = createTheme({
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
      secondary:'#102E4A',
      disabled: '#88A09E',
    }
  },
  typography: {
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
  }
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <html lang="en">
          {/*
            <head /> will contain the components returned by the nearest parent
            head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
          */}
          <head />
          <body>
            {children}
          </body>
        </html>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
