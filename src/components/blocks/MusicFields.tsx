import { SelectField } from '@/components/atoms/Select';
import { INSTRUMENT_OPTIONS } from '@/constants';
import { NoteModule, ScaleModule } from '@/lib/music';


type NoteSelectFieldProps = Pick<Parameters<typeof SelectField>[0], "id" | "name" | "label">;

const noteOptions = NoteModule.getAllNotes('C1', 'C5').map(n => ({
  label: n.name,
  value: n.name,
}));
function NoteSelectField({
  id,
  name,
  label,
}: NoteSelectFieldProps) {
  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      options={noteOptions}
    />
  )
}
NoteSelectField.initialValue = noteOptions[0].value;

const scaleKeyTypeOptions = ScaleModule.relevantNames().map(n => ({
  label: n,
  value: n,
}));

function ScaleKeyTypeSelectField() {
  return (
    <SelectField
      id={'keyType'}
      name={'keyType'}
      label={'keyType'}
      options={scaleKeyTypeOptions}
    />
  );
}
ScaleKeyTypeSelectField.initialValue = scaleKeyTypeOptions[0].value;

function ScaleKeyTonicSelectField() {
  return (
    <NoteSelectField
      id={'keyTonic'}
      name={'keyTonic'}
      label={'keyTonic'}
    />
  );
}
ScaleKeyTonicSelectField.initialValue  =NoteSelectField.initialValue;


function InstrumentTypeSelectField() {
  return (
    <SelectField
      id="instrument"
      name="instrument"
      label="Instrument"
      options={INSTRUMENT_OPTIONS}
    />
  );
}
InstrumentTypeSelectField.initialValue = INSTRUMENT_OPTIONS[0].value;

export {
  NoteSelectField,
  ScaleKeyTypeSelectField,
  ScaleKeyTonicSelectField,
  InstrumentTypeSelectField,
}