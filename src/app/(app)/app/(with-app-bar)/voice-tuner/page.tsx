"use client"
import { useRef, useLayoutEffect, useState } from 'react';
import * as Tone from 'tone';
import { Box, Button } from "@mui/material";
import Modal from '@/components/atoms/Modal';
import Piano from '@/components/atoms/Piano';
import PitchDetectionAnimation from '@/lib/animation/PitchDetectionAnimation';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { enqueueSnackbar } from '@/components/atoms/Snackbar';
import { useFetchUser } from '@/lib/fetch/hooks';
import { INSTRUMENT_PIANO1, INSTRUMENTS } from '@/constants';


export default function VoiceTunerPage() {
  const [started, setStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<PitchDetectionAnimation | null>(null);
  const userQuery = useFetchUser();
  const soundGenerator = new Tone.Sampler(INSTRUMENTS[INSTRUMENT_PIANO1]).toDestination();

  
  useLayoutEffect(function render() {
    if (!canvasRef.current || !userQuery.data) {
      return;
    }

    if (!started) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }
    
    canvasRef.current.width = canvasParentRef.current.clientWidth;
    canvasRef.current.height =  canvasParentRef.current.clientHeight;
    canvasRef.current.style.width = canvasParentRef.current.clientWidth;
    canvasRef.current.style.height =  canvasParentRef.current.clientHeight;
    
    const lowestNoteName = userQuery.data.lowNote;
    const highestNoteName = userQuery.data.highNote;
    animationRef.current = new PitchDetectionAnimation(
      lowestNoteName,
      highestNoteName,
      canvasRef.current as HTMLCanvasElement,
    );
    animationRef.current.start();
  }, [started, userQuery.data]);

  if (shouldRenderSWRResponseHandler(userQuery)) {
    return <SWRResponseHandler
      errorMessage={userQuery.error?.error}
      query={userQuery}
    />
  }

  const lowestNoteName = userQuery.data.lowNote;
  const highestNoteName = userQuery.data.highNote;

  return (
    <>
      <Box height={'calc(100vh - 65.5px)'} width={'100%'} display={'flex'} flexDirection={'column'}>
        <Box
          ref={canvasParentRef}
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <canvas id="canvas" ref={canvasRef} />
        </Box>
        <Box height={'200px'} width={'100%'}>
          <Piano
            lowestNoteName={lowestNoteName}
            highestNoteName={highestNoteName}
            onKeyPressed={(noteName) => {
              soundGenerator.triggerAttack(noteName)
            }}
            onKeyReleased={(noteName) => {
              soundGenerator.triggerRelease(noteName)
            }}
          />
        </Box>
      </Box>
      <Modal
        title={"Let's start"}
        open={!started}
        fullWidth
        maxWidth={'sm'}
      >
        <Box display={'flex'} justifyContent={'center'}>
          <Button color={'primary'} variant={'contained'} onClick={() => {
            setStarted(true);
          }}>
            Start
          </Button>
        </Box>
      </Modal>
    </>
  )
}
