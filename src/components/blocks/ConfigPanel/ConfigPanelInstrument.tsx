import Grid from '@mui/material/Grid';
import { SelectField } from '@/components/atoms/Select';
import { INSTRUMENT_OPTIONS } from '@/constants';

function ConfigPanelTimesCommon() {
  return (
    <>
      <Grid item xs={12}>
        <SelectField
          id="instrument"
          name="instrument"
          label="Instrument"
          options={INSTRUMENT_OPTIONS}
        />
      </Grid>
    </>
  );
}

export default ConfigPanelTimesCommon;