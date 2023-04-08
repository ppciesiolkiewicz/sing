import type { IntervalsMelodyConfigType } from '@/lib/Melody'
import { useCallback } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import { MelodyBuilder, Melody } from '@/lib/Melody'
import { IntervalModule } from '@/lib/music'
import { MultiSelectField } from '@/components/atoms/MultiSelect';
import ConfigPanelNoteBoundaries from './ConfigPanelNoteBoundaries';
import ConfigPanelTimesCommon from './ConfigPanelTimesCommon';
import ConfigPanelInstrument from './ConfigPanelInstrument';
import { INSTRUMENT_PIANO1, CONFIG_TYPE_INTERVAL } from '@/constants';

type FormValues = Omit<
  IntervalsMelodyConfigType,
  'intervalNames' |
  'timePerNote' |
  'timeBetweenNotes' |
  'timeBetweenRepeats' |
  'lowestNoteName' |
  'highestNoteName'
> & {
  tempo: number;
  notesRange: [string, string];
  intervalNames: {
    label: string;
    value: string;
    key: string;
  }[];
};


const FormValidationSchema = Yup.object().shape({
  repeatTimes: Yup.number().required(),
  tempo: Yup.number().required(),
  notesRange: Yup.array().min(2).max(2).required(),
  intervalNames: Yup.array().min(1, 'Select at least 1 interval'),
  instrument: Yup.string().required(),
});


function ConfigPanelInterval({
  onStartClicked,
  children,
}: {
  onStartClicked: (melody: Melody) => void,
  children: JSX.Element,
}) {
  const intervals = IntervalModule.names();
  const options = intervals.map(interval => ({
    value: interval,
    label: interval,
  }))

  const initialValues: FormValues = {
    tempo: 60,
    repeatTimes: 3,
    notesRange: ['C3', 'C4'],
    intervalNames: [
      {value: '1P', label: '1P', key: '1P-0'},
      {value: '5P', label: '5P', key: '5P-1'},
      {value: '1P', label: '1P', key: '1P-2'},
    ],
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
        intervalNames: values.intervalNames.map(({ value }) => value),
        lowestNoteName: values.notesRange[0],
        highestNoteName: values.notesRange[1],
      };
      const builder = new MelodyBuilder({ config, configType: CONFIG_TYPE_INTERVAL });
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
            <MultiSelectField
              id={'intervalNames'}
              name={'intervalNames'}
              label={'Intervals'}
              options={options}
            />
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


export default ConfigPanelInterval;