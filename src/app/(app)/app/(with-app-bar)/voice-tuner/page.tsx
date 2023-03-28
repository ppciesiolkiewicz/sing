"use client"
import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { Formik, Form, FormikHelpers, useFormik, useFormikContext } from 'formik';
import * as Tone from 'tone';
import { Box, Button, Grid, Fab } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@/components/atoms/Modal';
import Piano from '@/components/atoms/Piano';
import ChordsPiano from '@/components/atoms/ChordsPiano';
import PitchDetectionAnimation from '@/lib/animation/PitchDetectionAnimation';
import SWRResponseHandler, { shouldRenderSWRResponseHandler } from '@/components/atoms/SwrResponseHandler'
import { SelectField } from '@/components/atoms/Select';
import { useFetchUser } from '@/lib/fetch/hooks';
import { INSTRUMENTS } from '@/constants';
import {
  InstrumentTypeSelectField,
  ScaleKeyTonicSelectField,
  ScaleKeyTypeSelectField,
} from '@/components/blocks/MusicFields';

const PIANO_TYPE_NORMAL_PIANO = 'PIANO_TYPE_NORMAL_PIANO';
const PIANO_TYPE_CHORDS_PIANO = 'PIANO_TYPE_CHORDS_PIANO';
const PIANO_TYPE_OPTIONS = [
  {
    label: 'Normal Piano',
    value: PIANO_TYPE_NORMAL_PIANO,
  },
  {
    label: 'Chords Piano',
    value: PIANO_TYPE_CHORDS_PIANO,
  }
]

function PianoSettingsModal({ onSubmit }: { onSubmit: (settings: any) => void }) {
  const [isSettingsModalOpened, setIsSettingsModalOpened] = useState(false);
  const toggleSettingsModal = () => setIsSettingsModalOpened(!isSettingsModalOpened);

  return (
    <>
      <Modal
        title={"Piano settings"}
        open={isSettingsModalOpened}
        fullWidth
        maxWidth={'md'}
        onClose={() => setIsSettingsModalOpened(false)}
      >
        <Formik
          initialValues={PianoSettingsModal.initialValues}
          onSubmit={onSubmit}
        >
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InstrumentTypeSelectField />
              </Grid>
              <Grid item xs={12}>
                <SelectField
                  id="pianoType"
                  name="pianoType"
                  label="pianoType"
                  options={PIANO_TYPE_OPTIONS}
                />
              </Grid>
              <Grid item xs={12}>
                <ScaleKeyTonicSelectField />
              </Grid>
              <Grid item xs={12}>
                <ScaleKeyTypeSelectField />
              </Grid>
            </Grid>
            <Button
                variant={'contained'}
                color={'primary'}
                onClick={() => setIsSettingsModalOpened(false)}
                type={'submit'}
              >
                Ok
            </Button>
          </Form>
        </Formik>
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
PianoSettingsModal.initialValues = {
  instrument: InstrumentTypeSelectField.initialValue,
  keyTonic: ScaleKeyTonicSelectField.initialValue,
  keyType: ScaleKeyTypeSelectField.initialValue,
  pianoType: PIANO_TYPE_CHORDS_PIANO,
};


export default function VoiceTunerPage() {
  const [pianoSettings, setPianoSettings] = useState(PianoSettingsModal.initialValues);
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
          {/* <canvas id="canvas" ref={canvasRef} /> */}
        </Box>
        <Box height={['70px', '100px', '200px']} width={'100%'}>
          {pianoSettings.pianoType === PIANO_TYPE_NORMAL_PIANO && (
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
          )}
          {pianoSettings.pianoType === PIANO_TYPE_CHORDS_PIANO && (
            <ChordsPiano
              keyTonic={'C'}
              keyType={'major'}
              lowestNoteName={lowestNoteName}
              highestNoteName={highestNoteName}
              onKeyPressed={(noteNames: string[]) => {
                soundGenerator.triggerAttack(noteNames)
              }}
              onKeyReleased={(noteNames: string[]) => {
                soundGenerator.triggerRelease(noteNames)
              }}
            />
          )}
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
      <PianoSettingsModal onSubmit={values => setPianoSettings(values)}/>
    </>
  )
}
