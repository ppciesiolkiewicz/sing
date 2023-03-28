
import Grid from '@mui/material/Grid';
import { NoteSelectField } from '@/components/blocks/MusicFields';

function ConfigPanelNoteBoundaries() {
  return (
    <>
      <Grid item xs={12}>
        <NoteSelectField
          id={'lowestNoteName'}
          name={'lowestNoteName'}
          label={'Lowest Note'}
        />
      </Grid>
      <Grid item xs={12}>
        <NoteSelectField
          id={'highestNoteName'}
          name={'highestNoteName'}
          label={'Highest Note'}
        />
      </Grid>
    </>
  );
}

export default ConfigPanelNoteBoundaries;