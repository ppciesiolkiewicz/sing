import { SelectField } from '@/components/atoms/Select';
import { OptionsSliderField } from '@/components/atoms/OptionsSlider';
import { SliderField } from '@/components/atoms/Slider';
import { INSTRUMENT_OPTIONS } from '@/constants';
import { NoteModule, ScaleModule } from '@/lib/music';


type NoteSelectFieldProps = Pick<Parameters<typeof SelectField>[0], "id" | "name" | "label"> & {
  withOctaves?: boolean;
}

const noteWithOctaveOptions = NoteModule.getNoteRange('C1', 'C6').map(n => ({
  label: n.name,
  value: n.name,
}));

const noteOptions = NoteModule.names().map(n => ({
  label: n,
  value: n,
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

function NoteWithOctaveSelectField({
  id,
  name,
  label,
}: NoteSelectFieldProps) {
  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      options={noteWithOctaveOptions}
    />
  )
}
NoteWithOctaveSelectField.initialValue = noteWithOctaveOptions[0].value;

function NoteSliderField({
  id,
  name,
  label,
}: NoteSelectFieldProps) {
  return (
    <OptionsSliderField
      id={id}
      name={name}
      label={label}
      options={noteOptions}
    />
  )
}
NoteSliderField.initialValue = noteOptions[0].value;

function NoteWithOctaveSliderField({
  id,
  name,
  label,
}: NoteSelectFieldProps) {
  return (
    <OptionsSliderField
      id={id}
      name={name}
      label={label}
      options={noteWithOctaveOptions}
    />
  )
}
NoteWithOctaveSliderField.initialValue = noteWithOctaveOptions[0].value;


const scaleKeyTypeOptions = ScaleModule.relevantNames().map(n => ({
  label: n,
  value: n,
}));

function ScaleKeyTypeSelectField() {
  return (
    <SelectField
      id={'keyType'}
      name={'keyType'}
      label={'Scale Type'}
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
      label={'Key Tonic'}
    />
  );
}
ScaleKeyTonicSelectField.initialValue = NoteSelectField.initialValue;


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

function TempoSliderField() {
  return (
    <SliderField
      name={'tempo'}
      id={'tempo'}
      label={'Tempo'}
      step={1}
      min={20}
      max={220}
    />
  );
}
TempoSliderField.initialValue = 100;

export {
  NoteSliderField,
  NoteSelectField,
  NoteWithOctaveSliderField,
  NoteWithOctaveSelectField,
  ScaleKeyTypeSelectField,
  ScaleKeyTonicSelectField,
  InstrumentTypeSelectField,
  TempoSliderField,
}