import Grid from '@mui/material/Grid';
import { TextFieldField } from '@/components/atoms/TextField';
import { TempoSliderField } from '@/components/blocks/MusicFields';

function ConfigPanelTimesCommon() {
  return (
    <>
      <Grid item xs={12}>
        <TempoSliderField />
      </Grid>
      <Grid item xs={4}>
        <TextFieldField
          id="repeatTimes"
          name="repeatTimes"
          label="Repeat"
          type="number"
        />
      </Grid>
    </>
  );
}

export default ConfigPanelTimesCommon;