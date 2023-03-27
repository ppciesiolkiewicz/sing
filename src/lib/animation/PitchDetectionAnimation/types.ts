export interface AnimationFrameEvent {
  delta: number;
  time: number;
  count: number;
}

export interface PitchDetectionAnimationConfig {
  melodySingPixelsPerSecond: number;
  paddingTop: Pixel;
  paddingBottom: Pixel;
}

export type freqToCanvasYPosition = (freq: Hz) => Pixel;