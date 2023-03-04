import { SelectField } from '@/components/atoms/Select';
import { NoteModule } from '@/app/music';



function NoteSelectField({
  id,
  name,
  label,
}: Pick<Parameters<typeof SelectField>[0], "id" | "name" | "label">) {
  const options = NoteModule.getAllNotes('C1', 'C5').map(n => ({
    label: n.name,
    value: n.name,
  }));

  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      options={options}
    />
  )
}

export { NoteSelectField }