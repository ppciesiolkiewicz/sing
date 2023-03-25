
import { useRef, useLayoutEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Melody } from '@/lib/Melody'
import MelodyAnimation from '@/lib/animation/MelodyAnimation';
import Modal from '@/components/atoms/Modal';
import LinearProgressWithLabel from '@/components/atoms/LinearProgressWithLabel';
import { useFetchUser } from '@/lib/fetch/hooks';


function MelodyExercise({
  melody,
  started,
  setStarted,
}: {
  started: boolean,
  setStarted: (started: boolean) => void,
  melody: Melody | null,
}) {
  const userQuery = useFetchUser();
  const [score, setScore] = useState<{ [noteName: string]: number } | null>();
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<MelodyAnimation | null>(null);

  useLayoutEffect(function render() {
    if (!started) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

    animationRef.current = new MelodyAnimation(
      melody!,
      canvasRef.current,
      (score) => {
        setStarted(false);

        const notesCount = score.reduce((acc, s) => {
          if (typeof acc[s.noteName] === 'number') {
            acc[s.noteName] += 1;
          } else {
            acc[s.noteName] = 1;
          }
          return acc;
        }, {});

        let processedScore = score.reduce((acc, s) => {
          // TODO: not correct should be totalFramesHit / totalFrames
          if (typeof acc[s.noteName] === 'number') {
            acc[s.noteName] += s.percentHit;
          } else {
            acc[s.noteName] = s.percentHit;
          }
          return acc;
        }, {});

        console.log({ processedScore })

        processedScore = Object.keys(processedScore).reduce((acc, noteName) => {
          acc[noteName] = processedScore[noteName] / notesCount[noteName] * 100;
          return acc;
        }, {})
        console.log({ processedScore })

        setScore(processedScore);
      },
      userQuery.data.difficultyLevel,
    );
    animationRef.current.start();
  }, [started, melody]);

  return (
    <>
      {/* TODO: AppBar.height again  */}
      <canvas style={{ height: '100vh - 65.5px', width: '100%' }} id="canvas" ref={canvasRef} />
      <Modal
        title={'Congratulations! Here is your score'}
        open={Boolean(score)}
        onClose={() => setScore(null)}
        fullWidth
        maxWidth={'sm'}
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
    </>
  );
}

export default MelodyExercise;