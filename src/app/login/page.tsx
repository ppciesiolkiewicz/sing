"use client";
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TextFieldField } from '@/components/atoms/TextField';
import { logIn } from '@/lib/fetch/api';
import {
  getAppProfilePath,
} from '@/lib/urls';


type FormValues = {
  email: string;
  password: string;
};

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
    setSubmitting(true);
    const resp = await logIn(values);
    setSubmitting(false);

    // TODO: improve handling with try-catch
    // if (resp.status === 200) {
    router.push(getAppProfilePath())
  }

  return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form>
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
