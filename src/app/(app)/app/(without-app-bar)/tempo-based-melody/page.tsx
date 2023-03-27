"use client";
import Box from '@mui/material/Box';
import { Melody, MelodyConfig } from '@/lib/TempoBasedMelodyMelody/index';
import { useRef, useLayoutEffect, useState } from 'react';
import MelodyAnimation from '@/lib/animation/MelodyAnimationTempoBased/MelodyAnimationTempoBased';
import Modal from '@/components/atoms/Modal';
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
  const userQuery = useFetchUser()
  const [score, setScore] = useState<{ [noteName: string]: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<any>(null);
  const animationRef = useRef<MelodyAnimation | null>(null);

  useLayoutEffect(function render() {
    if (!animationRef.current) {
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

        console.log({ notesCount })

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
      <Modal
        title={'Congratulations! Here is your score'}
        open={Boolean(score)}
        onClose={() => setScore(null)}
        fullWidth
        maxWidth={'sm'}
      >
        <Box>
          {score && Object.keys(score)?.map(noteName => (
            <Box key={noteName}>
              {noteName}: {score[noteName].toFixed(0)}% hit
            </Box>
          ))}
        </Box>
      </Modal>
    </>
  );
}


const chordsConfig = MelodyConfig.fromChords({
  chordNames: ['C3maj', 'G3maj'],
  includeAllChordComponents: true,
  repeatTimes: 3,
  noteValue: 1,
})

const chordsMelody = new Melody(chordsConfig, 60);


const intervalConfig = MelodyConfig.fromIntervals({
  intervalNames: ['P1', 'P5'],
  lowestNoteName: 'C3',
  highestNoteName: 'G3',
  repeatTimes: 1,
  noteValue: 1,
})
const intervalMelody = new Melody(intervalConfig, 60);


const scaleConfig = MelodyConfig.fromScale({
  keyTonic: 'C',
  keyType: 'major',
  lowestNoteName: 'C3',
  highestNoteName: 'E3',
  repeatTimes: 3,
  noteValue: 1,
})
const scaleMelody = new Melody(scaleConfig, 60);

const notesConfig = MelodyConfig.fromNotes([
  {
    noteName: 'C3',
    noteValue: 1/4,
  },
  {
    noteName: 'E3',
    noteValue: 1,
  },
  {
    noteName: 'G3',
    noteValue: 1/4,
  },
  {
    noteName: 'F3',
    noteValue: 1/4,
  },
  {
    noteName: 'F3',
    noteValue: 1/4,
  },
  {
    noteName: 'F3',
    noteValue: 1/4,
  }
], [
  {
    text: 'C3',
    noteValue: 1/4,
  },
  {
    text: 'E3',
    noteValue: 1,
  },
  {
    text: 'G3',
    noteValue: 1/4,
  },
  {
    text: 'F3',
    noteValue: 1/4,
  },
  {
    text: 'F3',
    noteValue: 1/4,
  },
  {
    text: 'F3',
    noteValue: 1/4,
  }
])
const notesMelody = new Melody(notesConfig, 60);

console.log('intervalsConfig', intervalConfig)
console.log('intervalMelody', intervalMelody)
console.log('scaleConfig', scaleConfig)
console.log('scaleMelody', scaleMelody)
console.log('chordsConfig', chordsConfig)
console.log('chordsMelody', chordsMelody)
console.log('notesConfig', notesConfig)
console.log('notesMelody', notesMelody)

export default function Home() {
  return (
    <Box width={'100%'}>
      <MelodyExercise
        melody={notesMelody}
        started={true}
        setStarted={() => {}}
      />
    </Box>
  );
}
