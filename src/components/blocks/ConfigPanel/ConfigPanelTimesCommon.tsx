import Grid from '@mui/material/Grid';
import { TextFieldField } from '@/components/atoms/TextField';

function ConfigPanelTimesCommon() {
  return (
    <>
      <Grid item xs={12}>
        <TextFieldField
          id="repeatTimes"
          name="repeatTimes"
          label="Repeat"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timePerNote"
          name="timePerNote"
          label="Time per note"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenNotes"
          name="timeBetweenNotes"
          label="Time between notes"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenRepeats"
          name="timeBetweenRepeats"
          label="Time between repeats"
          type="number"
        />
      </Grid>
    </>
  );
}

export default ConfigPanelTimesCommon;