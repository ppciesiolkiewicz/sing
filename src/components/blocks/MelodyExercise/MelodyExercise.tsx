
import { useRef, useLayoutEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Melody } from '@/lib/Melody'
import MelodyAnimation from '@/lib/animation/MelodyAnimation';
import { useFetchUser } from '@/lib/fetch/hooks';
import MelodyExerciseScore  from './MelodyExerciseScore';


function MelodyExercise({
  melody,
  started,
  setStarted,
  onStopped = () => {},
}: {
  started: boolean,
  setStarted: (started: boolean) => void,
  melody: Melody | null,
  onStopped: () => void,
}) {
  const userQuery = useFetchUser();
  const [score, setScore] = useState<{ [noteName: string]: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<MelodyAnimation | null>(null);

  const onFinished = (score) => {
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

    processedScore = Object.keys(processedScore).reduce((acc, noteName) => {
      acc[noteName] = processedScore[noteName] / notesCount[noteName] * 100;
      return acc;
    }, {})

    setScore(processedScore);
  };

  useLayoutEffect(function render() {
    if (!canvasRef.current) {
      return;
    }

    if (!started) {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

    canvasRef.current.width = canvasParentRef.current.clientWidth;
    canvasRef.current.height =  canvasParentRef.current.clientHeight;
    canvasRef.current.style.width = canvasParentRef.current.clientWidth;
    canvasRef.current.style.height =  canvasParentRef.current.clientHeight;

    animationRef.current = new MelodyAnimation(
      melody!,
      canvasRef.current,
      onStopped,
      onFinished,
      userQuery.data.difficultyLevel,
    );
    animationRef.current.start();
  }, [started, melody]);

  return (
    <>
      <Box height={'100vh'} width={'100%'} display={'flex'} flexDirection={'column'}>
        <Box
          ref={canvasParentRef}
          sx={{
            flex: 1,
            position: 'relative',
          }}
        >
          <canvas id="canvas" ref={canvasRef} />
        </Box>
      </Box>
      <MelodyExerciseScore
        score={score}
        isOpened={Boolean(score)}
        onClose={() => {
          setScore(null);
        }}
        onRestartClicked={() => {
          setScore(null);
          setStarted(true);
        }}
      />
    </>
  );
}

export default MelodyExercise;