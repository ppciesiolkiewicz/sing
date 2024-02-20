
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Melody } from '@/lib/Melody'
import MelodyAnimation from '@/lib/animation/MelodyAnimation';
import { useFetchUser } from '@/lib/fetch/hooks';
import MelodyExerciseScore  from './MelodyExerciseScore';

const animationState = {
  STARTED: 'STARTED',
  RESTARTED: 'RESTARTED',
  STOPPED: 'STOPPED',
  PAUSED: 'PAUSED',
};


interface useMelodyExerciseStateManagementReturnValue {
  state: typeof animationState.STARTED |
    typeof animationState.RESTARTED |
    typeof animationState.STOPPED |
    typeof animationState.PAUSED;
  start: () => void;
  stop: () => void;
  pause: () => void;
  restart: () => void;
  isStarted: () => boolean;
  isRestarted: () => boolean;
  isPaused: () => boolean;
  isStopped: () => boolean;
}

function useMelodyExerciseStateManagement() {
  const [state, setState] = useState(animationState.STOPPED);

  return {
    state,
    start() {
      setState(animationState.STARTED);
    },
    stop() {
      setState(animationState.STOPPED);
    },
    pause() {
      setState( animationState.PAUSED);
    },
    restart() {
      setState(animationState.RESTARTED);
    },
    isStarted() {
      return this.state === animationState.STARTED || this.state === animationState.RESTARTED;
    },
    isRestarted() {
      return this.state === animationState.RESTARTED;
    },
    isPaused() {
      return this.state === animationState.PAUSED;
    },
    isStopped() {
      return this.state === animationState.STOPPED;
    },
  };
}

function MelodyExercise({
  melody,
  stateManagement,
  onStopped = () => {},
  onPaused = () => {},
  tempoOverwrite,
}: {
  melody: Melody | null,
  onStopped: () => void,
  onPaused: () => void,
  tempoOverwrite?: number,
  stateManagement: useMelodyExerciseStateManagementReturnValue,
}) {
  const userQuery = useFetchUser();
  const [score, setScore] = useState<{ [noteName: string]: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<MelodyAnimation | null>(null);

  useEffect(() => {
    if (!tempoOverwrite) {
      return;
    }
    animationRef.current?.setTempo(tempoOverwrite);
  }, [tempoOverwrite])

  const onFinished = (score) => {
    stateManagement.start()

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

  useEffect(() => {
    return () => animationRef.current?.stop();
  }, []);

  useLayoutEffect(function startAnimation() {
    if (!canvasRef.current) {
      return;
    }

    if (stateManagement.isPaused()) {
      animationRef.current?.pause();
      return;
    } else if (stateManagement.isStopped()) {
      animationRef.current?.stop();
      return;  
    } else if (stateManagement.isStarted() && !stateManagement.isRestarted()) {
      animationRef.current?.start();
      return;
    }

    // initial start and restart
    canvasRef.current.width = canvasParentRef.current.clientWidth;
    canvasRef.current.height =  canvasParentRef.current.clientHeight;
    canvasRef.current.style.width = canvasParentRef.current.clientWidth;
    canvasRef.current.style.height =  canvasParentRef.current.clientHeight;

    animationRef.current = new MelodyAnimation(
      melody!,
      canvasRef.current,
      onStopped,
      onPaused,
      onFinished,
      userQuery.data.difficultyLevel,
    );
    animationRef.current.start();
  }, [stateManagement.state, melody]);

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
          stateManagement.start();
        }}
      />
    </>
  );
}

export default MelodyExercise;
export { useMelodyExerciseStateManagement };