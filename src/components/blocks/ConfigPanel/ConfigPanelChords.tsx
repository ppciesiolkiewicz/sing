import type { ChordsMelodyConfigType } from '@/lib/Melody'
import { useCallback } from 'react';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { MultiSelectField } from '@/components/atoms/MultiSelect';
import { MelodyBuilder, Melody } from '@/lib/Melody'
import { ChordModule } from '@/lib/music';
import ConfigPanelNoteBoundaries from './ConfigPanelNoteBoundaries';
import ConfigPanelTimesCommon from './ConfigPanelTimesCommon';
import ConfigPanelInstrument from './ConfigPanelInstrument';
import { INSTRUMENT_PIANO1, CONFIG_TYPE_CHORDS } from '@/constants';


type FormValues =
  Omit<ChordsMelodyConfigType, 'chordNames'> &
  {
    chordNames: {
      label: string;
      value: string;
      key: string;
    }[];
    instrument: string;
  };

const FormValidationSchema = Yup.object().shape({
  repeatTimes: Yup.number().required(),
  timePerNote: Yup.number().required(),
  timeBetweenNotes: Yup.number().required(),
  timeBetweenRepeats: Yup.number().required(),
  chordNames: Yup.array().min(1, 'Select at least 1 chord'),
  includeAllChordComponents: Yup.boolean().required(),
  instrument: Yup.string().required(),
});

function ConfigPanelChords({
  onStartClick,
  children,
}: {
  onStartClick: (melody: Melody) => void,
  children: JSX.Element,
}) {
  const chords = ChordModule.getAllRelevantChords('C3', 'C5');
  const options = chords.map(chord => ({
    value: chord,
    label: chord,
  }))

  const initialValues: FormValues = {
    chordNames: [
      {value: 'C3maj', label: 'C3maj', key: 'C3maj-0'},
      {value: 'G3maj', label: 'G3maj', key: 'G3maj-0'},
    ],
    repeatTimes: 3,
    timePerNote: 3,
    timeBetweenNotes: 0.2,
    timeBetweenRepeats: 2,
    includeAllChordComponents: true,
    instrument: INSTRUMENT_PIANO1
  };

  const handleSubmit = useCallback(
    (
      values: FormValues,
      { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
      console.log('values', values);
      const config = {
        ...values,
        chordNames: values.chordNames.map(({ value }) => value),
      };
      const builder = new MelodyBuilder({ config, configType: CONFIG_TYPE_CHORDS });
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
            <MultiSelectField
              id={'chordNames'}
              name={'chordNames'}
              label={'Chords'}
              options={options}
            />
          </Grid>
          {/* <ConfigPanelNoteBoundaries />  TODO: not included in the FormValues */}
          <ConfigPanelTimesCommon />
          <Grid item xs={12}>
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
                  labelPlacement="start"
                  label={props.field.value ? "All chord notes" : "Root note only"}
                />
              )}
            </Field>
          </Grid>
          <ConfigPanelInstrument />
          {children}
        </Grid>
      </Form>
    </Formik>
  );
}


export default ConfigPanelChords;