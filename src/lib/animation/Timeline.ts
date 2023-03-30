
export interface AnimationFrameEvent {
  delta: Second;
  time: Second;
  count: number;
}

export default class Timeline {
  onFrame: (ev: AnimationFrameEvent) => void;
  private initialStarted: boolean;
  private started: boolean;
  private paused: boolean;

  constructor(onFrame: (ev: AnimationFrameEvent) => void) {
    this.onFrame = onFrame;
    this.initialStarted = false;
    this.started = false;
    this.paused = false;
  }

  public start() {
    this.paused = false;
    this.started = true;
    
    if (this.initialStarted) {
      return;
    }
    this.initialStarted = true;

    let startTime: Second;
    let previousTime: Second = 0;
    let totalTime: Second = 0;
    let pausedTime: Second = 0;
    let animationTime: Second = 0;
    let count = 0;

    const updateLoop = (timestamp: MilliSecond) => {
      const timestampSeconds: Second = timestamp / 1000;
      if (startTime === undefined) {
        startTime = timestampSeconds;
      }
      totalTime = timestampSeconds - startTime;
      const delta = totalTime - previousTime;
      previousTime = totalTime;
      count += 1;
      if (this.paused) {
        pausedTime += delta;
      }

      animationTime = totalTime - pausedTime;      

      if (!this.paused) {
      this.onFrame({
          delta,
          time: animationTime,
          count,
        });
      }

      if (!this.started) {
        return;
      }


      window.requestAnimationFrame(updateLoop)
    };

    window.requestAnimationFrame(updateLoop)
  }

  public pause() {
    this.paused = true;
  }

  public stop() {
    this.initialStarted = false;
    this.paused = false;
    this.started = false;
  }
}