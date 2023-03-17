"use client";
import Link from 'next/link'
import Box from '@mui/material/Box';
import Container from '@/components/atoms/Container';
import { useRef, useLayoutEffect, useState } from 'react';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import { OptionsSliderField } from '@/components/atoms/Slider';
import { NoteModule } from '@/lib/music';

const options = NoteModule.getAllNotes('C1', 'C5').map(n => ({
  label: n.name,
  value: n.name,
}));

type FormValues = {
  voiceRange: [string, string];
};

export default function Home() {
  const initialValues = {
    voiceRange: ['C3', 'G3'] as [string, string],
  }
  const handleSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    fetch(
      '/user/',
      {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'foo',
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      },
    );
  }

  return (
    <Container>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <Form>
        <OptionsSliderField
          id={'voiceRange'}
          name={'voiceRange'}
          label={'Voice Range'}
          options={options}
        />
        </Form>
    </Formik>
    </Container>
  )
}
