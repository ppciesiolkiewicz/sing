import MuiTextField from '@mui/material/TextField';
import { Field } from 'formik';

function TextFieldField({
  id,
  name,
  type,
  label,
}: Pick<Parameters<typeof MuiTextField>[0], "id" | "name" | "type" | "label">) {
  return (
    <Field
      id={id}
      name={name}
      // placeholder="john@acme.com"
      // type="email"
    >
      {props => (
        <MuiTextField
          fullWidth
          id={id}
          name={name}
          label={label}
          type={type}
          value={props.field.value}
          onChange={props.form.handleChange}
          variant={'outlined'}
          color={'primary'}
        />
      )}
    </Field>
  );
}

export { TextFieldField }