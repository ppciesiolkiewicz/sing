import { Fragment, useState } from 'react';
import MuiButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import Select from '@/components/atoms/Select';
import { Melody } from '@/lib/Melody'
import ConfigPanelInterval from './ConfigPanelInterval';
import ConfigPanelChords from './ConfigPanelChords';
import ConfigPanelScale from './ConfigPanelScale';

const CONFIG_TYPE_INTERVAL = 'Interval';
const CONFIG_TYPE_SCALE = 'Scale';
const CONFIG_TYPE_CHORDS = 'Chords';
const CONFIG_TYPE_NOTES = 'Notes';
const configTypeOptions = [
  {
    label: 'Interval',
    value: CONFIG_TYPE_INTERVAL,
  },
  {
    label: 'Scale',
    value: CONFIG_TYPE_SCALE,
  },
  {
    label: 'Chords',
    value: CONFIG_TYPE_CHORDS,
  },
  {
    label: 'Notes',
    value: CONFIG_TYPE_NOTES,
  },
];

// TODO:
function IntervalMultiSelectField() {}
function KeyTonicAndKeyTypeSelectField() {}


function ConfigPanelNotes() {
  // fromNotes
  return (
    <>
      Not implemented
    </>
  );
}

function ConfigPanelForm({
  configType,
  onStartClick,
  children,
}: {
  configType: string,
  onStartClick: (melody: Melody) => void,
  children: JSX.Element,
}) {
  switch(configType) {
    case CONFIG_TYPE_INTERVAL:
      return (
        <ConfigPanelInterval onStartClick={onStartClick}>
          {children}
        </ConfigPanelInterval>
      );
    case CONFIG_TYPE_SCALE:
      return (
        <ConfigPanelScale onStartClick={onStartClick}>
          {children}
        </ConfigPanelScale>
      );
    case CONFIG_TYPE_CHORDS:
      return (
        <ConfigPanelChords onStartClick={onStartClick}>
          {children}
        </ConfigPanelChords>
      );
    case CONFIG_TYPE_NOTES:
      return (
        <ConfigPanelNotes />
      );
  }

  return (
    <Box>Invalid config type</Box>
  )
}

function ConfigPanel({
  onStartClick,
  started,
}: {
  onStartClick: (melody: Melody) => void,
  started: boolean,
}) {
  const [configType, setConfigType] = useState(CONFIG_TYPE_INTERVAL);

  return (
    <Box p={2} sx={{ backgroundColor: 'common.white' }}>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12}>
          <Select
            label="Exercise Type"
            id="configType"
            name="configType"
            options={configTypeOptions}
            onChange={ev => setConfigType(ev.target.value)}
            value={configType}
          />
        </Grid>
      </Grid>
      <ConfigPanelForm
        configType={configType}
        onStartClick={onStartClick}
      >
        <Grid item xs={12}>
          <MuiButton
            fullWidth
            variant={'contained'}
            color={'primary'}
            type={'submit'}
            >
            {started ? 'Stop' : 'Start'}
          </MuiButton>
        </Grid>
      </ConfigPanelForm>
    </Box>
  );
}


function ConfigPanelDrawer({ started, onStartClick }: Parameters<typeof ConfigPanel>[0]) {
  const [isOpened, setIsOpened] = useState(true);

  // const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
  const toggleDrawer = () => {
      // if (
      //   event.type === 'keydown' &&
      //   ((event as React.KeyboardEvent).key === 'Tab' ||
      //     (event as React.KeyboardEvent).key === 'Shift')
      // ) {
      //   return;
      // }

      setIsOpened(!isOpened);
    };

  return (
    <Fragment>
      <Fab
        color="secondary"
        aria-label="settings"
        onClick={toggleDrawer}
        sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
      >
        <EditIcon />
      </Fab>
      <SwipeableDrawer
        anchor={'right'}
        open={isOpened}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
      >
        <Box sx={{ width: '50vw' }}>
          <ConfigPanel
            started={started}
            onStartClick={(melody) => {
              toggleDrawer();
              onStartClick(melody);
            }}
          />
        </Box>
      </SwipeableDrawer>
    </Fragment>
  )
}

export default ConfigPanel;
export { ConfigPanelDrawer };