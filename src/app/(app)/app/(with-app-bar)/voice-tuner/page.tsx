"use client"
import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { Box, Button, Fab } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@/components/atoms/Modal';
import Piano from '@/components/atoms/Piano';
import PitchDetectionAnimation from '@/lib/animation/PitchDetectionAnimation';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import Select from '@/components/atoms/Select';
import { useFetchUser } from '@/lib/fetch/hooks';
import { INSTRUMENT_OPTIONS, INSTRUMENT_PIANO1, INSTRUMENTS } from '@/constants';


export default function VoiceTunerPage() {
  const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENT_PIANO1);
  const [started, setStarted] = useState(false);
  const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<PitchDetectionAnimation | null>(null);
  const userQuery = useFetchUser();
  const soundGenerator = useMemo(
    () => new Tone.Sampler(INSTRUMENTS[selectedInstrument]).toDestination(),
    [selectedInstrument]
  );

  const toggleSettingsModal = () => setIsSettingsModalOpened(!isSettingsModalOpened);
  
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
      <Box 
        sx={theme => ({
          height: `calc(100vh - 65.5px - ${theme.spacing(4)})`,
           mt: 4,
           width: '100%',
           display: 'flex',
           flexDirection: 'column',
        })}
      >
        <Box
          ref={canvasParentRef}
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <canvas id="canvas" ref={canvasRef} />
        </Box>
        <Box height={['70px', '100px', '200px']} width={'100%'}>
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
      <Modal
        title={"Piano settings"}
        open={isSettingsModalOpened}
        fullWidth
        maxWidth={'md'}
        onClose={() => setIsSettingsModalOpened(false)}
        slots={{
          actions: (
            <Button variant={'contained'} color={'primary'} onClick={() => setIsSettingsModalOpened(false)}>
              Ok
            </Button>
          )
        }}
      >
        <Box display={'flex'} justifyContent={'center'}>
          <Select
            id="instrument"
            name="instrument"
            label="Instrument"
            options={INSTRUMENT_OPTIONS}
            value={selectedInstrument}
            onChange={(ev) => setSelectedInstrument(ev.target.value)}
          />
        </Box>
      </Modal>
      <Fab
        color="secondary"
        aria-label="settings"
        onClick={toggleSettingsModal}
        sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
      >
        <EditIcon />
      </Fab>
    </>
  )
}
