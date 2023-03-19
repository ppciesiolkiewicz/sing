import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MuiSlider from '@mui/material/Slider';
import { Field } from 'formik';

type Props =
  Pick<Parameters<typeof MuiSlider>[0], | 'value' | 'name' | 'id'> &
  {
    label: string;
    options: {
      label: string;
      value: any;
    }[];
    onChange: (ev: any, value: any | any[]) => void;
  };

function OptionsSlider({
  id,
  name,
  label,
  onChange,
  value,
  options,
}: Props) {
  const min = 0;
  const max = options.length - 1;
  const valueIndex = options
   .map((o, i) => {
    if (Array.isArray(value)) {
      return value.indexOf(o.value) > -1 ? i : null;
    } 
    return o.value === value ? i : null;
   })
  .filter(Boolean);

  function valueLabelFormat(valueIndex: number) {
    return options[valueIndex].label
  }

  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <MuiSlider
          color={'secondary'}
          id={id}
          name={name}
          valueLabelFormat={valueLabelFormat}
          value={valueIndex}
          onChange={(ev, valueIndex: number | number[], activeThumb) => {
            const value = Array.isArray(valueIndex)
              ? valueIndex.map(idx => options[idx].value)
              : options[valueIndex].value;

            ev.target.value = value;
            onChange!(ev, value);
          }}
          valueLabelDisplay="on"
          min={min}
          step={1}
          max={max}
        />
    </FormControl>
  );
}

function OptionsSliderField({
  id,
  name,
  label,
  options,
}: Pick<Parameters<typeof OptionsSlider>[0], "id" | "name" | "label" | "options">) {
  return (
    <Field
      id={id}
      name={name}
    >
      {(props) => {
        return (
          <OptionsSlider
            id={props.field.id}
            name={props.field.name}
            label={label}
            onChange={props.form.handleChange}
            value={props.field.value}
            options={options}
          />
        )
      }}
  </Field>
  );
}


export default OptionsSlider;
export { OptionsSliderField }
