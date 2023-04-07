

import { Box, Typography, Button } from '@mui/material';
import Modal from '@/components/atoms/Modal';
import LinearProgressWithLabel from '@/components/atoms/LinearProgressWithLabel';

export default function MelodyExerciseScore({
  score,
  isOpened,
  onClose,
  onRestartClicked,
}: {
  score: { [noteName: string]: number } | null;
  isOpened: boolean;
  onClose: () => void;
  onRestartClicked: () => void;
}) {
  return (
      <Modal
        title={'Congratulations! Here is your score'}
        open={isOpened}
        onClose={onClose}
        fullWidth
        maxWidth={'sm'}
        slots={{
          actions: (
            <Button
              variant={'contained'}
              color={'primary'}
              onClick={onRestartClicked}
            >
              Restart
            </Button>
          )
        }}
      >
        <Box>
          {score && Object.keys(score)?.map(noteName => (
            <Box key={noteName} display={'flex'} width={'100%'}>
              <Typography variant={'overline'} mr={1}>
                {noteName}
              </Typography>
              <LinearProgressWithLabel sx={{ flex: 1 }} color={"success"} value={score[noteName]} />
            </Box>
          ))}
        </Box>
      </Modal>
    );
}