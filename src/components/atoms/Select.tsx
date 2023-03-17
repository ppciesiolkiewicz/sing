import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select';
import { Field } from 'formik';

function Select({
  options,
  onChange,
  value,
  label,
  id,
  name,
}: {
  label: string,
  id: string,
  name: string,
  options: {
    label: string,
    value: any,
  }[],
  onChange: any,
  value: any,
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <MuiSelect
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={onChange}
        name={name}
        variant={'filled'}
      >
        {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </MuiSelect>
    </FormControl>
  )
}


function SelectField({
  id,
  name,
  options,
  label,
}: Pick<Parameters<typeof Select>[0], "id" | "name" | "options" | "label">) {
  return (
    <Field
      id={id}
      name={name}
    >
      {(props) => {
        return (
          <Select
            id={props.field.id}
            name={props.field.name}
            label={label}
            options={options}
            onChange={props.form.handleChange}
            value={props.field.value}
          />
        )
      }}
  </Field>
  );
}

export default Select
export { SelectField }