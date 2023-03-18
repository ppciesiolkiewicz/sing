"use client";
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { TextFieldField } from '@/components/atoms/TextField';

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function SignUp() {
  const router = useRouter();
  const initialValues = {
    name: '',
    email: '',
    password: '',
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    setSubmitting(true);
    const resp = await fetch(
      '/api/user',
      {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      },
    );
    setSubmitting(false);

    if (resp.status === 200) {
      router.push('/profile')
    }
  }

  return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form>
            <Grid container spacing={2} maxWidth={'600px'}>
              <Grid item xs={12}>
                <TextFieldField
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                />
              </Grid>
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
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
