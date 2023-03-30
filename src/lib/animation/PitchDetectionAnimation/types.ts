export type { AnimationFrameEvent } from '@/lib/animation/Timeline'; 

export interface PitchDetectionAnimationConfig {
  melodySingPixelsPerSecond: number;
  paddingTop: Pixel;
  paddingBottom: Pixel;
}

export type freqToCanvasYPosition = (freq: Hz) => Pixel;