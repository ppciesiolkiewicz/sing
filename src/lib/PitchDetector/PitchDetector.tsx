import ml5, { Pitch } from "ml5";

const SAMPLE_RATE = 44100 / 8;

// TODO:  change shape of pitchHistory: [Hz, number, number][] for PitchDetector3
interface PitchResult {
  pitch: Hz;
  isAccepted: boolean;
  volume: number;
}
class PitchDetector {
  private modelUrl =
    "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";
  private HISTORY_MAX_LENGTH = 10;
  public pitchHistory: Hz[] = [];
  public emaPitchHistory: Hz[] = [];

  private pitch: Hz = -1;
  private emaPitch: Hz = -1;
  private pitchDetector: ReturnType<typeof ml5.pitchDetection>;
  private initialized_: boolean = false;

  constructor() {
    (async () => {
      const audioContext = new window.AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "interactive",
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.pitchDetector = await ml5.pitchDetection(
        this.modelUrl,
        audioContext,
        stream
      );
      this.startPitchLoop();
    })();
  }

  private startPitchLoop() {
    this.pitchDetector.getPitch((err: Error, frequency: Hz) => {
      if (err) throw new Error(err.message);
      if (frequency) {
        // the lower the alpha the bigger the smoothing factor - use with difficulty?
        const alpha = 0.5;
        const beta = 1 - alpha;
        this.pitch = frequency;

        if (this.emaPitch === -1) {
          this.emaPitch = frequency;
        } else {
          this.emaPitch = this.emaPitch * beta + frequency * alpha;
        }

        // this.pitchHistory.push(frequency);
        // if (this.pitchHistory.length == 1) {
        //   this.emaPitchHistory.push(this.pitchHistory[0]);
        // } else {
        //   const alpha = 0.2;
        //   const beta = 1 - alpha;
        //   const lastEmaPitch =
        //     this.emaPitchHistory[this.emaPitchHistory.length - 1];
        //   this.emaPitchHistory.push(
        //     lastEmaPitch * beta +
        //       this.pitchHistory[this.pitchHistory.length - 1] * alpha
        //   );
        // }
      } else {
        this.pitch = -1;
        this.emaPitch = -1;
      }

      this.initialized_ = true;

      setTimeout(() => {
        this.startPitchLoop();
      }, 1);
    });
  }

  getPitch(): Hz {
    if (!this.initialized) {
      return -1;
    }

    return this.emaPitch;
    // return this.emaPitchHistory[this.emaPitchHistory.length - 1];
  }

  get initialized() {
    return this.initialized_;
  }
}

export default PitchDetector;
