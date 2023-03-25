import type { ScaleMelodyConfigType } from '@/lib/Melody/MelodyBuilder';
import { useCallback } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import { SelectField } from '@/components/atoms/Select';
import { MelodyBuilder, Melody } from '@/lib/Melody'
import { NoteModule, ScaleModule } from '@/lib/music';
import ConfigPanelNoteBoundaries from './ConfigPanelNoteBoundaries';
import ConfigPanelTimesCommon from './ConfigPanelTimesCommon';
import ConfigPanelInstrument from './ConfigPanelInstrument';
import { INSTRUMENT_PIANO1, CONFIG_TYPE_SCALE } from '@/constants';

type FormValues = ScaleMelodyConfigType;

const FormValidationSchema = Yup.object().shape({
  repeatTimes: Yup.number().required(),
  timePerNote: Yup.number().required(),
  timeBetweenNotes: Yup.number().required(),
  timeBetweenRepeats: Yup.number().required(),
  highestNoteName: Yup.string().required(),
  lowestNoteName: Yup.string().required(),
  keyTonic: Yup.string().required(),
  keyType: Yup.string().required(),
  instrument: Yup.string().required(),
});

function ConfigPanelScale({
  onStartClick,
  children,
}: {
  onStartClick: (melody: Melody) => void,
  children: JSX.Element,
}) {
  const initialValues: FormValues = {
    repeatTimes: 3,
    timePerNote: 1,
    timeBetweenNotes: 0.1,
    timeBetweenRepeats: 1,
    highestNoteName: 'C4',
    lowestNoteName: 'C3',
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
      const builder = new MelodyBuilder({ config: values, configType: CONFIG_TYPE_SCALE });
      const melody = builder.build();
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
          <ConfigPanelInstrument />
          {children}
        </Grid>
      </Form>
    </Formik>
  );
}


export default ConfigPanelScale;