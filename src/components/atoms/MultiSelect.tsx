import { ChangeEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Field } from 'formik';

// TODO: props...
type MultiSelectProps = (
  Pick<Parameters<typeof Autocomplete>[0], "id" | "options" | "value"> &
  Pick<Parameters<typeof TextField>[0], "name" | "label"> &
  {
    onChange: any;
  }
)

function MultiSelect({
  id,
  name,
  label,
  options,
  value,
  onChange,
}: MultiSelectProps) {
  return (
    <Autocomplete
      multiple
      id={id}
      options={options}
      value={value}
      onChange={(ev, value) => {
        onChange({
          target: {
            name,
            value: value.map((v, i) => ({
                ...v,
                // TODO: key causes warning
                key: `${v.value}-${i}`
              })
            )
          }
        })
      }}
      renderInput={(params) => (
        <TextField {...params} name={name} label={label} />
      )}
    />
  );
}

function MultiSelectField({
  id,
  name,
  label,
  options,
}: Pick<MultiSelectProps, "id" | "name" | "label" | "options">) {
  return (
    <Field
      id={id}
      name={name}
    >
      {props => (
        <MultiSelect
          id={id}
          name={name}
          label={label}
          options={options}
          value={props.field.value}
          onChange={props.form.handleChange}
        />
      )}
    </Field>
  );
}

export default MultiSelect
export { MultiSelectField }