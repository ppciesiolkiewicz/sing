import { PitchDetector as PD } from 'pitchy';


class PitchDetector {
  private initialized_: boolean = false;
  private analyserNode: any;
  private detector: any;
  private input: any;
  private audioContext: any;

  constructor() {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const analyserMinDecibels = -35
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = 0.85
      const audioContext = new window.AudioContext();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
    
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      const detector = PD.forFloat32Array(analyserNode.fftSize);
      const input = new Float32Array(detector.inputLength);
    
      this.analyserNode = analyserNode;
      this.detector = detector;
      this.input = input;
      this.audioContext = audioContext;
      this.initialized_ = true;
    })();
  }

  getPitch(): [Hz, number, number] {
    if (!this.initialized) {
      return [0, 0, 0];
    }

    this.analyserNode.getFloatTimeDomainData(this.input);
  
    let sumSquares = 0;
    for (const amplitude of this.input) {
      sumSquares += amplitude*amplitude;
    }
    const volume = Math.sqrt(sumSquares / this.input.length);
    const [pitch, clarity] = this.detector.findPitch(this.input, this.audioContext.sampleRate);
  
    return [pitch, clarity, volume]
  }

  get initialized() {
    return this.initialized_;
  }
}




export default PitchDetector;