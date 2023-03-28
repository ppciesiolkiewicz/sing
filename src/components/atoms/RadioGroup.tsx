import type { RadioGroupProps as MuiRadioGroupProps } from '@mui/material';
import * as React from 'react';
import { Field } from 'formik';
import Radio from '@mui/material/Radio';
import MuiRadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

type RadioGroupProps = {
  label: string;
  options: {
    label: string,
    value: string;
  }[];
} & Pick<MuiRadioGroupProps, 'id' | 'name' | 'onChange' | 'value' | 'row'>;

export default function RadioGroup({
  id,
  name,
  label,
  options,
  onChange,
  value,
  row,
}: RadioGroupProps) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <MuiRadioGroup
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        row={row}
      >
        {options.map(o => (
          <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
}

type RadioGroupFieldProps = Pick<RadioGroupProps, 'id' | 'name' | 'options' | 'label' | 'row'>;

  
export function RadioGroupField({
  id,
  name,
  options,
  label,
  row,
}: RadioGroupFieldProps) {
  return (
    <Field
      id={id}
      name={name}
    >
      {(props) => {
        return (
          <RadioGroup
            id={props.field.id}
            name={props.field.name}
            label={label}
            options={options}
            onChange={props.form.handleChange}
            value={props.field.value}
            row={row}
          />
        )
      }}
    </Field>
  );
}