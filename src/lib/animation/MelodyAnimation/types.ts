export type { AnimationFrameEvent } from '@/lib/animation/Timeline'; 

export interface MelodySingNoteScore {
  noteName: string;
  framesHit: number;
  totalFrames: number;
  started: boolean;
  percentHit: number;
};

// TODO: use instead of MelodySingNoteScore[]
export type MelodyAnimationScore = MelodySingNoteScore[];

export interface MelodyAnimationConfig {
  melodySingPixelsPerSecond: number;
  melodyNoteSelectedMaxFreqCentsDiff: number;
  melodyPercentFrameHitToAccept: number;
  paddingTop: Pixel;
  paddingBottom: Pixel;
}
export type freqToCanvasYPosition = (freq: Hz) => Pixel;