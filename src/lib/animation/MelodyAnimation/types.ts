export type { AnimationFrameEvent } from '@/lib/animation/Timeline'; 

export interface MelodySingNoteScore {
  noteName: string;
  framesHit: number;
  totalFrames: number;
  started: boolean;
  percentHit: number;
};

export interface MelodyAnimationConfig {
  melodySingPixelsPerSecond: number;
  melodyNoteSelectedMaxFreqCentsDiff: number;
  melodyPercentFrameHitToAccept: number;
  paddingTop: Pixel;
  paddingBottom: Pixel;
}
export type freqToCanvasYPosition = (freq: Hz) => Pixel;