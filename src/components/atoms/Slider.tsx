import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MuiSlider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { Field } from 'formik';


type Props =
  Pick<Parameters<typeof MuiSlider>[0], | 'value' | 'name' | 'id' | 'onChange' | 'step' | 'min' | 'max'> &
  {
    label: string;
  };

function Slider({
  id,
  name,
  label,
  onChange,
  value,
  step,
  min,
  max,
}: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`} sx={{ ml: -2 }}>{label}</InputLabel>
      <Box mt={10}>
        <MuiSlider
          color={'secondary'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          valueLabelDisplay={'on'}
          min={min}
          step={step}
          max={max}
        />
      </Box>
    </FormControl>
  );
}

type SliderFieldProps = Pick<
  Parameters<typeof Slider>[0],
  "id" | "name" | "label" | "min" | "max" | "step"
>;

function SliderField({
  id,
  name,
  label,
  min,
  max,
  step
}: SliderFieldProps) {
  return (
    <Field
      id={id}
      name={name}
    >
      {(props) => {
        return (
          <Slider
            id={props.field.id}
            name={props.field.name}
            label={label}
            onChange={props.form.handleChange}
            value={props.field.value}
            min={min}
            step={step}
            max={max}
        />
        )
      }}
  </Field>
  );
}


export default Slider;
export { SliderField }
