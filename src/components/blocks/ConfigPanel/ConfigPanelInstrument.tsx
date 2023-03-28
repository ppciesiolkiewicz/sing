import Grid from '@mui/material/Grid';
import { InstrumentTypeSelectField } from '@/components/blocks/MusicFields';
import { INSTRUMENT_OPTIONS } from '@/constants';

function ConfigPanelInstrument() {
  return (
    <>
      <Grid item xs={12}>
        <InstrumentTypeSelectField />
      </Grid>
    </>
  );
}

export default ConfigPanelInstrument;