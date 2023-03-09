import { useCallback } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import { MelodyConfig, Melody } from '@/lib/Melody'
import { MultiSelectField } from '@/components/atoms/MultiSelect';
import ConfigPanelNoteBoundaries from './ConfigPanelNoteBoundaries';
import ConfigPanelTimesCommon from './ConfigPanelTimesCommon';


type FormValues =
  Omit<Parameters<typeof MelodyConfig.fromIntervals>[0], 'intervalNames'> &
  {
    intervalNames: {
      label: string;
      value: string;
    }[];
  };

const FormValidationSchema = Yup.object().shape({
  repeatTimes: Yup.number().required(),
  timePerNote: Yup.number().required(),
  timeBetweenNotes: Yup.number().required(),
  timeBetweenRepeats: Yup.number().required(),
  highestNoteName: Yup.string().required(),
  lowestNoteName: Yup.string().required(),
  intervalNames: Yup.array().min(1, 'Select at least 1 interval'),
});


function ConfigPanelInterval({
  onStartClick,
  children,
}: {
  onStartClick: (melody: Melody) => void,
  children: JSX.Element,
}) {
  const intervals = ['1P', '2M', '3M', '4P', '5P', '6m', '7m'];
  const options = intervals.map(interval => ({
    value: interval,
    label: interval,
  }))

  const initialValues: FormValues = {
    repeatTimes: 3,
    timePerNote: 1,
    timeBetweenNotes: 0.1,
    timeBetweenRepeats: 1,
    highestNoteName: 'C4',
    lowestNoteName: 'C3',
    intervalNames: [],
  };

  const handleSubmit = useCallback(
    (
      values: FormValues,
      { setSubmitting }: FormikHelpers<FormValues>
    ) => {
      console.log('values', values);
      const config = MelodyConfig.fromIntervals({
        intervalNames: values.intervalNames.map(({ value }) => value),
        lowestNoteName: values.lowestNoteName,
        highestNoteName: values.highestNoteName,
        repeatTimes: values.repeatTimes,
        timePerNote: values.timePerNote,
        timeBetweenNotes: values.timeBetweenNotes,
        timeBetweenRepeats: values.timeBetweenRepeats,
      });
      const melody = new Melody(config);
      onStartClick(melody);
    },
    [onStartClick]
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
          {children}
        </Grid>
      </Form>
    </Formik>
  );
}


export default ConfigPanelInterval;