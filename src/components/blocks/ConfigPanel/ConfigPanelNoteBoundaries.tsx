
import Grid from '@mui/material/Grid';
import { NoteWithOctaveSelectField } from '@/components/blocks/MusicFields';

function ConfigPanelNoteBoundaries() {
  return (
    <>
      <Grid item xs={12}>
        <NoteWithOctaveSelectField
          id={'lowestNoteName'}
          name={'lowestNoteName'}
          label={'Lowest Note'}
        />
      </Grid>
      <Grid item xs={12}>
        <NoteWithOctaveSelectField
          id={'highestNoteName'}
          name={'highestNoteName'}
          label={'Highest Note'}
        />
      </Grid>
    </>
  );
}

export default ConfigPanelNoteBoundaries;