import type { ScaleMelodyConfig } from '@/lib/Melody/MelodyBuilder';
import { useCallback } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import { MelodyBuilder, Melody } from '@/lib/Melody'
import { INSTRUMENT_PIANO1, CONFIG_TYPE_SCALE } from '@/constants';
import {
  ScaleKeyTonicSelectField,
  ScaleKeyTypeSelectField,
} from '@/components/blocks/MusicFields';
import ConfigPanelNoteBoundaries from './ConfigPanelNoteBoundaries';
import ConfigPanelTimesCommon from './ConfigPanelTimesCommon';
import ConfigPanelInstrument from './ConfigPanelInstrument';

type FormValues = Omit<
  ScaleMelodyConfig,
  'timePerNote' |
  'timeBetweenNotes' |
  'timeBetweenRepeats' |
  'lowestNoteName' |
  'highestNoteName'
> & {
  tempo: number;
  notesRange: [string, string];
};

const FormValidationSchema = Yup.object().shape({
  repeatTimes: Yup.number().required(),
  tempo: Yup.number().required(),
  notesRange: Yup.array().min(2).max(2).required(),
  keyTonic: Yup.string().required(),
  keyType: Yup.string().required(),
  instrument: Yup.string().required(),
});

function ConfigPanelScale({
  onStartClicked,
  children,
}: {
  onStartClicked: (melody: Melody) => void,
  children: JSX.Element,
}) {
  const initialValues: FormValues = {
    repeatTimes: 3,
    tempo: 60,
    notesRange: ['C3', 'C4'],
    keyTonic: 'C',
    keyType: 'major',
    instrument: INSTRUMENT_PIANO1,
  };

  const handleSubmit = useCallback(
    (
      values: FormValues,
      { setSubmitting }: FormikHelpers<FormValues>
    ) => {
      console.log('values', values);
      const config = {
        ...values,
        timePerNote: 1,
        timeBetweenNotes: 0,
        timeBetweenRepeats: 3,
        lowestNoteName: values.notesRange[0],
        highestNoteName: values.notesRange[1],
      }
      const builder = new MelodyBuilder({ config: config, configType: CONFIG_TYPE_SCALE });
      const melody = builder.build();
      onStartClicked(melody);
    },
    [onStartClicked]
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={FormValidationSchema}
    >
      <Form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ScaleKeyTonicSelectField />
          </Grid>
          <Grid item xs={12}>
            <ScaleKeyTypeSelectField />
          </Grid>
          <ConfigPanelNoteBoundaries />
          <ConfigPanelTimesCommon />
          <ConfigPanelInstrument />
          {children}
        </Grid>
      </Form>
    </Formik>
  );
}


export default ConfigPanelScale;