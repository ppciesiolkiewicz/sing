
import { useRef, useLayoutEffect } from 'react';
import { Melody } from '@/lib/Melody'
import MelodyAnimation from '@/lib/animation/MelodyAnimation';

function MelodyExercise({
  melody,
  started,
  setStarted,
}: {
  started: boolean,
  setStarted: (started: boolean) => void,
  melody: Melody | null,
}) {
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
      melody!, canvasRef.current, () => setStarted(false),
    );
    animationRef.current.start();
  }, [started, melody]);

  return (
    <canvas style={{ width: '100%', height: '100%' }} id="canvas" ref={canvasRef} />
  );
}

export default MelodyExercise;