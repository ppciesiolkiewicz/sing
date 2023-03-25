export interface AnimationFrameEvent {
  delta: number;
  time: number;
  count: number;
}

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
}
export type freqToCanvasYPosition = (freq: Hz) => Pixel;