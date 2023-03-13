"use client";
import Link from 'next/link'
import Box from '@mui/material/Box';
import Container from '@/components/atoms/Container';
import { Melody, MelodyConfig } from '@/lib/Melody/index';

const chordsConfig = MelodyConfig.fromChords({
  chordNames: ['C3maj', 'G3maj'],
  includeAllChordComponents: true,
  repeatTimes: 3,
  noteValue: 1,
})

const chordsMelody = new Melody(chordsConfig, 60);


import { useRef, useLayoutEffect, useState } from 'react';
import MelodyAnimation from '@/lib/animation/MelodyAnimationTempoBased';
import Modal from '@/components/atoms/Modal';

function MelodyExercise({
  melody,
  started,
  setStarted,
}: {
  started: boolean,
  setStarted: (started: boolean) => void,
  melody: Melody | null,
}) {
  const [score, setScore] = useState<{ [noteName: string]: number } | null>(null);
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
    );
    animationRef.current.start();
  }, [started, melody]);

  return (
    <>
      <canvas style={{ width: '100%', height: '100%' }} id="canvas" ref={canvasRef} />
      <Modal
        open={Boolean(score)}
        onClose={() => setScore(null)}
      >
        <Box>
          Congratulations! Here is your score:
          {score && Object.keys(score)?.map(noteName => (
            <Box>
              {noteName}: {score[noteName].toFixed(0)}% hit
            </Box>
          ))}
        </Box>
      </Modal>
    </>
  );
}


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

console.log('intervalsConfig', intervalConfig)
console.log('intervalMelody', intervalMelody)
console.log('scaleConfig', scaleConfig)
console.log('scaleMelody', scaleMelody)
console.log('chordsConfig', chordsConfig)
console.log('chordsMelody', chordsMelody)

export default function Home() {
  return (
    <Container>
      {/* <Box display={'flex'} flexDirection={'column'}>
        <Link href={'/exercises'}>Exercises</Link>
        <Link href={'/exercise-configurator'}>Exercise Configurator</Link>
      </Box> */}
        <Box width={'100%'}>
          <MelodyExercise
            melody={intervalMelody}
            started={true}
            setStarted={() => {}}
          />
        </Box>
    </Container>
  )
}
