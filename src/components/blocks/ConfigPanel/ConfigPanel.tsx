import { Fragment, useState } from 'react';
import { Grid, Box, Button, SwipeableDrawer, Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Select from '@/components/atoms/Select';
import { Melody } from '@/lib/Melody'
import ConfigPanelInterval from './ConfigPanelInterval';
import ConfigPanelChords from './ConfigPanelChords';
import ConfigPanelScale from './ConfigPanelScale';
import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';

const CONFIG_TYPE_OPTIONS = [
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
  // {
  //   label: 'Notes',
  //   value: CONFIG_TYPE_NOTES,
  // },
];

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
  onStartClicked,
  children,
}: {
  configType: string,
  onStartClicked: (melody: Melody) => void,
  children: JSX.Element,
}) {
  switch(configType) {
    case CONFIG_TYPE_INTERVAL:
      return (
        <ConfigPanelInterval onStartClicked={onStartClicked}>
          {children}
        </ConfigPanelInterval>
      );
    case CONFIG_TYPE_SCALE:
      return (
        <ConfigPanelScale onStartClicked={onStartClicked}>
          {children}
        </ConfigPanelScale>
      );
    case CONFIG_TYPE_CHORDS:
      return (
        <ConfigPanelChords onStartClicked={onStartClicked}>
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
  onStartClicked,
  onResumeClicked,
  isAnimationPaused,
}: {
  onStartClicked: (melody: Melody) => void,
  onResumeClicked: () => void,
  isAnimationPaused: boolean,
}) {
  const [configType, setConfigType] = useState(CONFIG_TYPE_SCALE);

  return (
    <Box p={2} sx={{ backgroundColor: 'common.white' }}>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12}>
          <Select
            label="Exercise Type"
            id="configType"
            name="configType"
            options={CONFIG_TYPE_OPTIONS}
            onChange={ev => setConfigType(ev.target.value)}
            value={configType}
          />
        </Grid>
      </Grid>
      <ConfigPanelForm
        configType={configType}
        onStartClicked={onStartClicked}
      >
        <>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant={'contained'}
              color={'primary'}
              type={'submit'}
              >
              {isAnimationPaused ? 'Restart' : 'Start'}
            </Button>
          </Grid>
          {isAnimationPaused && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant={'contained'}
                color={'secondary'}
                onClick={onResumeClicked}
              >
                Resume
              </Button>
          </Grid>
          )}
        </>
      </ConfigPanelForm>
    </Box>
  );
}

function ConfigPanelDrawer({
  onStartClicked,
  onResumeClicked,
  isOpened,
  onOpen,
  onClose,
  isAnimationPaused,
}: Parameters<typeof ConfigPanel>[0] & {
  isOpened: boolean,
  onOpen: () => void,
  onClose: () => void,
  isAnimationPaused: boolean,
}) {
  return (
    <Fragment>
      <Fab
        color="secondary"
        aria-label="settings"
        onClick={onOpen}
        sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
      >
        <EditIcon />
      </Fab>
      <SwipeableDrawer
        anchor={'right'}
        open={isOpened}
        onClose={onClose}
        onOpen={onOpen}
      >
        <Box sx={{ width: '50vw' }}>
          <ConfigPanel
            onStartClicked={(melody) => {
              onClose();
              onStartClicked(melody);
            }}
            onResumeClicked={onResumeClicked}
            isAnimationPaused={isAnimationPaused}
          />
        </Box>
      </SwipeableDrawer>
    </Fragment>
  )
}

export default ConfigPanel;
export { ConfigPanelDrawer };