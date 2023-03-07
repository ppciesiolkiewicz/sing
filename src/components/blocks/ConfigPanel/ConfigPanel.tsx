import { Fragment, useState } from 'react';
import { Formik, Field, Form, FormikHelpers, FieldProps } from 'formik';
import MuiButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { MultiSelectField } from '@/components/atoms/MultiSelect';
import { TextFieldField } from '@/components/atoms/TextField';
import { SelectField } from '@/components/atoms/Select';
import { NoteSelectField } from '@/components/blocks/NoteSelect';
import {
  MelodyConfig,
  Melody,
} from '@/lib/Melody'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';


function IntervalMultiSelectField() {

}


function KeyTonicAndKeyTypeSelectField() {
  
}

const CONFIG_TYPE_INTERVAL = 'Interval';
const CONFIG_TYPE_SCALE = 'Scale';
const CONFIG_TYPE_CHORDS = 'Chords';
const CONFIG_TYPE_NOTES = 'Notes';


function ConfigPanelTimesCommon() {
  return (
    <>
      <Grid item xs={12}>
        <TextFieldField
          id="repeatTimes"
          name="repeatTimes"
          label="Repeat"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timePerNote"
          name="timePerNote"
          label="Time per note"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenNotes"
          name="timeBetweenNotes"
          label="Time between notes"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenRepeats"
          name="timeBetweenRepeats"
          label="Time between repeats"
          type="number"
        />
      </Grid>
    </>
  );
}

function ConfigPanelNoteBoundaries() {
  return (
    <>
      <Grid item xs={12}>
        <NoteSelectField
          id={'lowestNoteName'}
          name={'lowestNoteName'}
          label={'Lowest Note'}
        />
      </Grid>
      <Grid item xs={12}>
        <NoteSelectField
          id={'highestNoteName'}
          name={'highestNoteName'}
          label={'Highest Note'}
        />
      </Grid>
    </>
  );
}

function ConfigPanelInterval() {
  const intervals = ['1P', '2M', '3M', '4P', '5P', '6m', '7m'];
  const options = intervals.map(interval => ({
    value: interval,
    label: interval,
  }))
  return (
    <>
      <Grid item xs={12}>
        <MultiSelectField
          id={'intervalNames'}
          name={'intervalNames'}
          label={'Intervals'}
          options={options}
        />
      </Grid>
      <ConfigPanelNoteBoundaries />
      <ConfigPanelTimesCommon />
    </>
  );
}


function ConfigPanelScale() {
  // scale: ScaleModule.get('C', 'blues'),
  return (
    <>
      <Grid item xs={12}>
        <SelectField
          id={'keyTonic'}
          name={'keyTonic'}
          label={'Key Tonic'}
          // TODO: hack to get keyTonics...
          options={NoteModule.getAllNotes('C1', 'C2').map(n => ({
            label: n.pc,
            value: n.pc,
          }))}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectField
          id={'keyType'}
          name={'keyType'}
          label={'Key Type'}
          options={ScaleModule.names().map(n => ({
            label: n,
            value: n,
          }))}
        />
      </Grid>
      <ConfigPanelNoteBoundaries />
      <ConfigPanelTimesCommon />
    </>
  );
}

function ConfigPanelChords() {
  const chords = ChordModule.getAllRelevantChords('C3', 'C5');
  const options = chords.map(chord => ({
    value: chord,
    label: chord,
  }))
  return (
    <>
      <Grid item xs={12}>
        <MultiSelectField
          id={'chordNames'}
          name={'chordNames'}
          label={'Chords'}
          options={options}
        />
      </Grid>
      <ConfigPanelNoteBoundaries />
      <ConfigPanelTimesCommon />
      <Field
        name={'includeAllChordComponents'}
        id={'includeAllChordComponents'}
      >
        {props => (
          <FormControlLabel
          control={(
            <Switch
              id={props.field.id}
              name={props.field.name}
              onChange={props.form.handleChange}
              value={props.field.value}
            />
            )}
            labelPlacement="top"
            label={props.field.value ? "All chord notes" : "Root note only"}
          />
        )}
      </Field>
    </>
  )
}


function ConfigPanelNotes() {
  // fromNotes
  return (
    <>
      Not implemented
    </>
  );
}

function ConfigPanelForm({ configType }: { configType: string }) {
  switch(configType) {
    case CONFIG_TYPE_INTERVAL:
      return (
        <ConfigPanelInterval />
      );
    case CONFIG_TYPE_SCALE:
      return (
        <ConfigPanelScale />
      );
    case CONFIG_TYPE_CHORDS:
      return (
        <ConfigPanelChords />
      );
    case CONFIG_TYPE_NOTES:
      return (
        <ConfigPanelNotes />
      );
  }

  return (
    <Box>Invalid config type</Box>
  )
}

type ConfigPanelValues =
    Omit<Parameters<typeof MelodyConfig.fromScale>[0], 'chordNames'> &
    {
      chordNames: {
        label: string;
        value: string;
      }[];
    } &
    Parameters<typeof MelodyConfig.fromChords>[0] &
    Omit<Parameters<typeof MelodyConfig.fromIntervals>[0], 'intervalNames'> &
    {
      intervalNames: {
        label: string;
        value: string;
      }[];
    } &
    {
      configType: string;
    };

function ConfigPanel({
  onStartClick,
  started,
}: {
  onStartClick: (melody: Melody) => void,
  started: boolean,
}) {
  const configTypeOptions = [
    {
      label: 'Interval',
      value: CONFIG_TYPE_INTERVAL,
    },
    {
      label: 'Scale',
      value: CONFIG_TYPE_SCALE,
    },
    {
      label: 'Chords',
      value: CONFIG_TYPE_CHORDS,
    },
    {
      label: 'Notes',
      value: CONFIG_TYPE_NOTES,
    },
  ]

  return (
    <Box p={2} sx={{ backgroundColor: 'common.white' }}>
      <Formik
        initialValues={{
          configType: CONFIG_TYPE_CHORDS,
          repeatTimes: 3,
          timePerNote: 1,
          timeBetweenNotes: 0.1,
          timeBetweenRepeats: 1,
          highestNoteName: 'G4',
          lowestNoteName: 'A2',
          keyTonic: 'C',
          keyType: 'major',
          chordNames: [],
          intervalNames: [],
          includeAllChordComponents: true,
        }}
        onSubmit={(
          values: ConfigPanelValues,
          { setSubmitting }: FormikHelpers<ConfigPanelValues>
        ) => {
          console.log('values', values);
          let config = null;

          if (values.configType === CONFIG_TYPE_INTERVAL) {
            config = MelodyConfig.fromIntervals({
              // TODO: type
              intervalNames: values.intervalNames.map(({ value }) => value),
              lowestNoteName: values.lowestNoteName,
              highestNoteName: values.highestNoteName,
              repeatTimes: values.repeatTimes,
              timePerNote: values.timePerNote,
              timeBetweenNotes: values.timeBetweenNotes,
              timeBetweenRepeats: values.timeBetweenRepeats,
            })
          }  else if (values.configType === CONFIG_TYPE_SCALE) {
            config = MelodyConfig.fromScale({
              keyTonic: values.keyTonic,
              keyType: values.keyType,
              lowestNoteName: values.lowestNoteName,
              highestNoteName: values.highestNoteName,
              repeatTimes: values.repeatTimes,
              timePerNote: values.timePerNote,
              timeBetweenNotes: values.timeBetweenNotes,
              timeBetweenRepeats: values.timeBetweenRepeats,
            })
          } else if (values.configType === CONFIG_TYPE_CHORDS) { 
            config = MelodyConfig.fromChords({
              // TODO: type
              chordNames: values.chordNames.map(({ value }) => value),
              includeAllChordComponents: values.includeAllChordComponents,
              repeatTimes: values.repeatTimes,
              timePerNote: values.timePerNote,
              timeBetweenNotes: values.timeBetweenNotes,
              timeBetweenRepeats: values.timeBetweenRepeats,
            })
          } else {
            throw new Error("Unrecognized config type")
          }
          
          const melody = new Melody(config);
          onStartClick(melody);
        }}
      >
        {formik => {
          return (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SelectField
                    label="Exercise Type"
                    id="configType"
                    name="configType"
                    options={configTypeOptions}
                  />
                </Grid>
                <ConfigPanelForm
                  configType={formik.values.configType}
                />
                <Grid item xs={12}>
                  <MuiButton
                    fullWidth
                    variant={'contained'}
                    color={'primary'}
                    type={'submit'}
                    >
                    {started ? 'Stop' : 'Start'}
                  </MuiButton>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}


function ConfigPanelDrawer({ started, onStartClick }: Parameters<typeof ConfigPanel>[0]) {
  const [isOpened, setIsOpened] = useState(true);

  // const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
  const toggleDrawer = () => {
      // if (
      //   event.type === 'keydown' &&
      //   ((event as React.KeyboardEvent).key === 'Tab' ||
      //     (event as React.KeyboardEvent).key === 'Shift')
      // ) {
      //   return;
      // }

      setIsOpened(!isOpened);
    };

  return (
    <Fragment>
      <Fab
        color="secondary"
        aria-label="settings"
        onClick={toggleDrawer}
        sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
      >
        <EditIcon />
      </Fab>
      <SwipeableDrawer
        anchor={'right'}
        open={isOpened}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
      >
        <Box sx={{ width: '50vw' }}>
          <ConfigPanel
            started={started}
            onStartClick={(melody) => {
              toggleDrawer();
              onStartClick(melody);
            }}
          />
        </Box>
      </SwipeableDrawer>
    </Fragment>
  )
}

export default ConfigPanel;
export { ConfigPanelDrawer };