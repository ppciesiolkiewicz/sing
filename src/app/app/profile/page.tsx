"use client";
import { Formik, Form, FormikHelpers } from 'formik';
import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { OptionsSliderField } from '@/components/atoms/Slider';
import { TextFieldField } from '@/components/atoms/TextField';
import { NoteModule } from '@/lib/music';
import { useFetchUser } from '@/lib/fetch/hooks';
import { updateUser } from '@/lib/fetch/api';

const options = NoteModule.getAllNotes('C1', 'C5').map(n => ({
  label: n.name,
  value: n.name,
}));

type FormValues = {
  voiceRange: [string, string];
};

export default function Profile() {
  const userQuery = useFetchUser();

  const initialValues = {
    voiceRange: [userQuery.data.lowNote, userQuery.data.highNote] as [string, string],
    name: userQuery.data.name,
  }
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    setSubmitting(true)
    const resp = await updateUser({
      lowNote: values.voiceRange[0],
      highNote: values.voiceRange[1],
    });
    setSubmitting(false)
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography mb={2} variant={'h5'}>
        Just set your voice range and you're good to go!
      </Typography>
      <Formik
        initialValues={initialValues}
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
