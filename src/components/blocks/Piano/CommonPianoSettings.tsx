import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Grid, Fab, Divider, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@/components/atoms/Modal';
import {
  InstrumentTypeSelectField,
  ScaleKeyTonicSelectField,
  ScaleKeyTypeSelectField,
  ExtendedScaleKeyTypeSelectField,
  TempoSliderField,
} from '@/components/blocks/MusicFields';
import { RadioGroupField } from '@/components/atoms/RadioGroup';
import {
  CHORDS_PIANO_MODE_ALL_NOTES,
  CHORDS_PIANO_MODE_ARPEGGIO,
} from './ChordsPiano';

/*

  TODO: there's a setting name overlap between Scale and Chords Piano - it's rather broken but okay for personal use
  @see ExtendedScaleKeyTypeSelectField and ScaleKeyTypeSelectField
*/


function ChordsPianoModeSelectField() {
  return (
    <RadioGroupField
      id="chordsPianoMode"
      name="chordsPianoMode"
      label="Play Mode"
      options={[
        {
          label: 'All Notes',
          value: CHORDS_PIANO_MODE_ALL_NOTES,
        }, {
          label: 'Arpeggio',
          value: CHORDS_PIANO_MODE_ARPEGGIO,
        }
      ]}
      row={true}
    />
  );
}
ChordsPianoModeSelectField.initialValue = CHORDS_PIANO_MODE_ALL_NOTES as
  typeof CHORDS_PIANO_MODE_ALL_NOTES | typeof CHORDS_PIANO_MODE_ARPEGGIO;

interface CommonPianoSettingsProps {
  onSubmit: (settings: any) => void;
}

export default function CommonPianoSettings({ onSubmit }: CommonPianoSettingsProps) {
  return (
    <Formik
      initialValues={CommonPianoSettings.initialValues}
      onSubmit={onSubmit}
    >
      <Form>
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12}>
            <Typography variant={'h6'}>Common Piano Settings</Typography>
          </Grid>
          <Grid item xs={6}>
            <InstrumentTypeSelectField />
          </Grid>
          <Divider />
          <Grid item xs={12}>
            <Typography variant={'h6'}>Chords Piano Settings</Typography>
          </Grid>
          <Grid item xs={6}>
            <ScaleKeyTonicSelectField />
          </Grid>
          <Grid item xs={6}>
            <ScaleKeyTypeSelectField />
          </Grid>
          <Grid item xs={12}>
            <ChordsPianoModeSelectField />
          </Grid>
          <Grid item xs={12}>
            <TempoSliderField />
          </Grid>
          <Grid item xs={12}>
            <Typography variant={'h6'}>Scale Piano Settings</Typography>
          </Grid>
          <Grid item xs={6}>
            <ScaleKeyTonicSelectField />
          </Grid>
          <Grid item xs={6}>
            <ExtendedScaleKeyTypeSelectField />
          </Grid>
        </Grid>
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Button
              variant={'contained'}
              color={'primary'}
              type={'submit'}
            >
              Ok
          </Button>
        </Box>
      </Form>
    </Formik>
  )
}

CommonPianoSettings.initialValues = {
  instrument: InstrumentTypeSelectField.initialValue,
  keyTonic: ScaleKeyTonicSelectField.initialValue,
  keyType: ScaleKeyTypeSelectField.initialValue,
  chordsPianoMode: ChordsPianoModeSelectField.initialValue,
  tempo: TempoSliderField.initialValue,
};


export function CommonPianoSettingsModal({ onSubmit }: CommonPianoSettingsProps) {
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
        keepMounted
      >
        <CommonPianoSettings
          onSubmit={(values) => {
            setIsSettingsModalOpened(false);
            onSubmit(values);
          }}
        />
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
CommonPianoSettingsModal.initialValues = CommonPianoSettings.initialValues;
