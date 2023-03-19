"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { logOut } from '@/lib/fetch/api';
import {
  getLandingPagePath,
} from '@/lib/urls';


export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await logOut();
      router.push(getLandingPagePath())
    })();
  });

  return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
      Logging out
    </Box>
  )
}
