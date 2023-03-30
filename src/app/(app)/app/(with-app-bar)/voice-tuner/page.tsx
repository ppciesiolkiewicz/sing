"use client"
import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { Box, Button } from "@mui/material";
import Modal from '@/components/atoms/Modal';
import Piano from '@/components/blocks/Piano/Piano';
import ChordsPiano from '@/components/blocks/Piano/ChordsPiano';
import Tabs from '@/components/atoms/Tabs';
import PitchDetectionAnimation from '@/lib/animation/PitchDetectionAnimation';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { useFetchUser } from '@/lib/fetch/hooks';
import { INSTRUMENTS } from '@/constants';
import { CommonPianoSettingsModal } from '@/components/blocks/Piano/CommonPianoSettings';

export default function VoiceTunerPage() {
  const [pianoSettings, setPianoSettings] = useState(CommonPianoSettingsModal.initialValues);
  const [started, setStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<PitchDetectionAnimation | null>(null);
  const userQuery = useFetchUser();
  const soundGenerator = useMemo(
    () => new Tone.Sampler(INSTRUMENTS[pianoSettings.instrument]).toDestination(),
    [pianoSettings.instrument]
  );

  
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
        // TODO fix that canvas height... 
        sx={theme => ({
          height: `calc(100vh - 65.5px - ${theme.spacing(16)})`,
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
          <Tabs
            options={[
              {
                title: 'Piano',
                children: (
                  <>
                    <Piano
                      lowestNoteName={lowestNoteName}
                      highestNoteName={highestNoteName}
                      onKeyPressed={(noteName) => {
                        soundGenerator.triggerAttack(noteName)
                        animationRef.current?.setHighlightedNoteLines([noteName]);
                      }}
                      onKeyReleased={(noteName) => {
                        soundGenerator.triggerRelease(noteName)
                        animationRef.current?.unsetHighlightedNoteLines([noteName]);
                      }}
                    />
                  </>
                ),
              },
              {
                title: 'Chords Piano',
                children: (
                  <>
                    <ChordsPiano
                      keyTonic={pianoSettings.keyTonic}
                      keyType={pianoSettings.keyType}
                      lowestNoteName={lowestNoteName}
                      highestNoteName={highestNoteName}
                      modeConfig={{
                        mode: pianoSettings.chordsPianoMode,
                        tempo: pianoSettings.tempo,
                      }}
                      onKeyPressed={(noteNames: string[]) => {
                        soundGenerator.triggerAttack(noteNames)
                        animationRef.current?.setHighlightedNoteLines(noteNames);
                      }}
                      onKeyReleased={(noteNames: string[]) => {
                        soundGenerator.triggerRelease(noteNames)
                        animationRef.current?.unsetHighlightedNoteLines(noteNames);
                      }}
                    />
                  </>
                ),
              },
            ]}
          />
        </Box>
      </Box>
      <CommonPianoSettingsModal
        onSubmit={values => setPianoSettings(values)}
      />
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
