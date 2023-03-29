"use client";
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Grid, Box, Button, Typography } from '@mui/material';
import { enqueueSnackbar } from '@/components/atoms/Snackbar';
import { TextFieldField } from '@/components/atoms/TextField';
import { logIn } from '@/lib/fetch/api';
import { getAppDashboardPath } from '@/lib/urls';


type FormValues = {
  email: string;
  password: string;
};

const FormValidationSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

export default function Login() {
  const router = useRouter();
  const initialValues = {
    email: '',
    password: '',
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      setSubmitting(true);
      const resp = await logIn(values);
      setSubmitting(false);
      // TODO: remove timeout that gives time to browser to set the cookie...
      setTimeout(() => {
        router.push(getAppDashboardPath())
      }, 10)
    } catch(e: any) {
      setSubmitting(false);
      enqueueSnackbar({
        message: e.message,
        variant: 'error',
      })
    }
  }

  return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={FormValidationSchema}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form style={{ width: '100%' }}>
            <Typography sx={{ mb: 2 }} variant={'h6'}>Log In</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextFieldField
                  id="email"
                  name="email"
                  label="E-mail"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldField
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type={'submit'}
                  variant={'contained'}
                  disabled={formik.isSubmitting}
                >
                  Log in
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
