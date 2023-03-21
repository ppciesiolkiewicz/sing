"use client";
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { enqueueSnackbar } from '@/components/atoms/Snackbar';
import { Grid, Box, Button, Typography, Paper } from '@mui/material';
import { OptionsSliderField } from '@/components/atoms/Slider';
import { TextFieldField } from '@/components/atoms/TextField';
import { SelectField } from '@/components/atoms/Select';
import { NoteModule } from '@/lib/music';
import { useFetchUser } from '@/lib/fetch/hooks';
import { updateUser } from '@/lib/fetch/api';
import { DIFFICULTY_LEVEL_OPTIONS } from '@/constants';
import type { DifficultyLevel } from '@/constants';


const options = NoteModule.getAllNotes('C1', 'C6').map(n => ({
  label: n.name,
  value: n.name,
}));

type FormValues = {
  name: string;
  voiceRange: [string, string];
  difficultyLevel: DifficultyLevel;
};

const FormValidationSchema = Yup.object().shape({
  voiceRange: Yup.array().required('Voice range is required field').min(2),
  name: Yup.string().required(),
  difficultyLevel: Yup.string().required('Difficulty level is required field'),
});


export default function Profile() {
  const userQuery = useFetchUser();

  const initialValues = {
    voiceRange: [userQuery.data.lowNote, userQuery.data.highNote] as [string, string],
    difficultyLevel: userQuery.data.difficultyLevel,
    name: userQuery.data.name,
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      setSubmitting(true)
      const resp = await updateUser({
        lowNote: values.voiceRange[0],
        highNote: values.voiceRange[1],
        difficultyLevel: values.difficultyLevel,
      });
      setSubmitting(false)
    } catch(e: any) {
      setSubmitting(false)
      enqueueSnackbar({
        message: e.message,
        variant: 'error',
      });
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography mb={2} variant={'h5'}>
        Just set your voice range and you're good to go!
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={FormValidationSchema}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form style={{ width: '100%' }}>
            <Box display={'flex'} justifyContent={'center'}>
              <Grid container spacing={6} maxWidth={'sm'}>
                <Grid item xs={12}>
                  <OptionsSliderField
                    id={'voiceRange'}
                    name={'voiceRange'}
                    label={'Voice Range'}
                    options={options}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SelectField
                    id={'difficultyLevel'}
                    name={'difficultyLevel'}
                    label={"Difficulty level"}
                    options={DIFFICULTY_LEVEL_OPTIONS}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextFieldField
                    id="name"
                    name="name"
                    label="Name"
                    type="text"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant={'contained'}
                    type={'submit'}
                    disabled={formik.isSubmitting}
                    color={'secondary'}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Form>
        )}
    </Formik>
  </Paper>
  );
}
