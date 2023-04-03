
import Grid from '@mui/material/Grid';
import { NoteWithOctaveSliderField } from '@/components/blocks/MusicFields';

function ConfigPanelNoteBoundaries() {
  return (
    <Grid item xs={12}>
      <NoteWithOctaveSliderField
        id={'notesRange'}
        name={'notesRange'}
        label={'Vocal Range'}
      />
    </Grid>
  );
}

export default ConfigPanelNoteBoundaries;