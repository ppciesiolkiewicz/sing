import { MeasureModule } from '@/lib/music';

export interface AnimationFrameEvent {
  delta: Second;
  time: Second;
  count: number;
  beat: number;
  beatDelta: number;
}

export default class Timeline {
  onFrame: (ev: AnimationFrameEvent) => void;
  private initialStarted: boolean;
  private started_: boolean;
  private paused_: boolean;
  private tempo: number;

  private startTime?: Second = 0;
  private previousTime: Second = 0;
  private totalTime: Second = 0;
  private pausedTime: Second = 0;
  private animationTime: Second = 0;
  private count = 0;
  private beat = 0;
  private tempoChangeBeat = 0;
  private tempoChangeAnimationTime = 0;

  constructor(onFrame: (ev: AnimationFrameEvent) => void, tempo: number) {
    this.onFrame = onFrame;
    this.initialStarted = false;
    this.started_ = false;
    this.paused_ = false;
    this.tempo = tempo;
  }

  public start() {
    this.paused_ = false;
    this.started_ = true;
    
    if (this.initialStarted) {
      return;
    }
    this.initialStarted = true;


    this.startTime = undefined;
    this.previousTime = 0;
    this.totalTime = 0;
    this.pausedTime = 0;
    this.animationTime = 0;
    this.count = 0;
    this.beat = 0;
    this.tempoChangeBeat = 0;
    this.tempoChangeAnimationTime = 0;

    const updateLoop = (timestamp: MilliSecond) => {
      const timestampSeconds: Second = timestamp / 1000;
      if (this.startTime === undefined) {
        this.startTime = timestampSeconds;
      }
      this.totalTime = timestampSeconds - this.startTime;
      const delta = this.totalTime - this.previousTime;
      this.previousTime = this.totalTime;
      this.count += 1;
      if (this.paused_) {
        this.pausedTime += delta;
      }

      this.animationTime = this.totalTime - this.pausedTime;    
      this.beat = this.tempoChangeBeat + MeasureModule.timeToBeat(
        this.animationTime - this.tempoChangeAnimationTime, this.tempo
      )

      if (!this.paused_) {
        this.onFrame({
          delta,
          time: this.animationTime,
          count: this.count,
          beat: this.beat,
          beatDelta: MeasureModule.timeToBeat(delta, this.tempo),
        });
      }

      if (!this.started_) {
        return;
      }


      window.requestAnimationFrame(updateLoop)
    };

    window.requestAnimationFrame(updateLoop)
  }

  public pause() {
    this.paused_ = true;
  }

  public stop() {
    this.initialStarted = false;
    this.paused_ = false;
    this.started_ = false;
  }

  public setTempo(tempo: number) {
    this.tempo = tempo;
    this.tempoChangeBeat = this.beat;
    this.tempoChangeAnimationTime = this.animationTime;
  }

  get started() {
    return this.started_;
  }
  get paused() {
    return this.paused_;
  }
}