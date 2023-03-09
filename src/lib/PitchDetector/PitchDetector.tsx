import { PitchDetector as PD } from 'pitchy';
import ml5, { Pitch } from 'ml5';

const SAMPLE_RATE = 44100 / 8;
const ANALYSER_SMOOTHING_TIME_CONSTANT = 0.85;
const FFT_SIZE = 2048 * 2;

// TODO: Preserve order of original values but filter out the outliers.
function getFilteredOutliers(array: [Hz, number, number][], samplesCount = 10) {  
  // Copy the values, rather than operating on references to existing values
  const PITCH_IDX = 0;
  var values = array
    .slice(array.length - samplesCount, array.length)
    .filter(([pitch]) => pitch > 0);

  if (values.length < 4) {
    return [[0, 0, 0]]
  }

  // Then sort
  values.sort(function(a, b) {
    return a[0] - b[0];
  });

  /* Then find a generous IQR. This is generous because if (values.length / 4) 
   * is not an int, then really you should average the two elements on either 
   * side to find q1.
   */     
  var q1 = values[Math.floor((values.length / 4))][0];
  // Likewise for q3. 
  var q3 = values[Math.ceil((values.length * (3 / 4)))][0];
  var iqr = q3 - q1;

  // Then find min and max values
  var maxValue = q3 + iqr*1.5;
  var minValue = q1 - iqr*1.5;

  // Then filter anything beyond or beneath these values.
  var filteredValues = values.filter(function(x) {
      return (x[0] <= maxValue) && (x[0] >= minValue);
  });


  // Then return
  return filteredValues;
}

function exponentialMovingAverage(array: [Hz, number, number][], samplesCount = 3, alpha = 0.9): [Hz, number, number] {  
  const beta = 1 - alpha;

  const [smoothPitch, smoothClarity, smoothVolume] = array
    .slice(-1 * samplesCount)
    .reduce(([emaPitch, emaClarity, emaVolume], [pitch, clarity, volume]) => [
      emaPitch*beta + pitch*alpha,
      emaClarity*beta + clarity*alpha,  
      emaVolume*beta + volume*alpha,
    ], array[array.length - 1]);

    return [smoothPitch, smoothClarity, smoothVolume];
}


class PitchDetector {
  private initialized_: boolean = false;
  private analyserNode: any;
  private detector: any;
  private input: any;
  private audioContext: any;

  constructor() {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const analyserMinDecibels = -100
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = ANALYSER_SMOOTHING_TIME_CONSTANT
      const audioContext = new window.AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "interactive",
      });
      const analyserNode = audioContext.createAnalyser();
      console.log(audioContext, analyserNode);
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
      analyserNode.fftSize = FFT_SIZE;
    
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


class PitchDetectorWithExponentialMovingAverage {
  private initialized_: boolean = false;
  private analyserNode: any;
  private detector: any;
  private input: any;
  private audioContext: any;
  private pitchHistory: [Hz, number, number][] = [];

  constructor() {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const analyserMinDecibels = -100
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = ANALYSER_SMOOTHING_TIME_CONSTANT
      const audioContext = new window.AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "interactive",
      });
      const analyserNode = audioContext.createAnalyser();
      console.log(audioContext, analyserNode);
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
      analyserNode.fftSize = FFT_SIZE;
    
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
    

    const smoothingSamples = 10;
    const alpha = 0.9;
    const beta = 1 - alpha;
    this.pitchHistory.push([pitch, clarity, volume])

    // TODO: return sorted so smoothing's inertia doesn't work 
    const filteredPitchHistory = getFilteredOutliers(this.pitchHistory, smoothingSamples)

    const [smoothPitch, smoothClarity, smoothVolume] = filteredPitchHistory
      .slice(this.pitchHistory.length - smoothingSamples, this.pitchHistory.length)
      .reduce(([emaPitch, emaClarity, emaVolume], [pitch, clarity, volume]) => [
        emaPitch*beta + pitch*alpha,
        emaClarity*beta + clarity*alpha,  
        emaVolume*beta + volume*alpha,
      ], [pitch, clarity, volume]);


    return [smoothPitch, smoothClarity, smoothVolume]
  }

  get initialized() {
    return this.initialized_;
  }
}

class PitchDetectorWithBestOutOfSelection {
  private initialized_: boolean = false;
  private analyserNode: any;
  private detector: any;
  private input: any;
  private audioContext: any;
  private pitchHistory: [Hz, number, number][] = [];

  constructor() {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const analyserMinDecibels = -100
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = ANALYSER_SMOOTHING_TIME_CONSTANT
      const audioContext = new window.AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "interactive",
      });
      const analyserNode = audioContext.createAnalyser();
      console.log(audioContext, analyserNode);
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
      analyserNode.fftSize = FFT_SIZE;
    
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
    

    const samplesCount = 10;
    this.pitchHistory.push([pitch, clarity, volume])
    const [smoothPitch, smoothClarity, smoothVolume] = this.pitchHistory
      .slice(this.pitchHistory.length - samplesCount, this.pitchHistory.length)
      .sort((a, b) => a[1] - b[1])[0];

    return [smoothPitch, smoothClarity, smoothVolume]
  }

  get initialized() {
    return this.initialized_;
  }
}


class PitchDetector2 {
  private initialized_: boolean = false;
  private analyserNode: any;
  private audioContext: any;
  private pitchHistory: [Hz, number, number][] = [];

  constructor() {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const analyserMinDecibels = -100
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = ANALYSER_SMOOTHING_TIME_CONSTANT
      const audioContext = new window.AudioContext({
        sampleRate: SAMPLE_RATE,
        latencyHint: "interactive",
      });
      const analyserNode = audioContext.createAnalyser();
      console.log(audioContext, analyserNode);
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
      analyserNode.fftSize = FFT_SIZE;
    
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);

      this.analyserNode = analyserNode;
      this.audioContext = audioContext;
      this.initialized_ = true;
    })();
  }

  getPitch(): [Hz, number, number] {
    if (!this.initialized) {
      return [0, 0, 0];
    }
    const bufferLength = this.analyserNode.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.analyserNode.getFloatTimeDomainData(buffer);
    const autoCorrelatedPitch = this.autoCorrelate(buffer, this.audioContext.sampleRate);
    
    
    const clarity = 1;
    const volume = 1;
    const samplesCount = 5;
    this.pitchHistory.push([autoCorrelatedPitch, clarity, volume])
    const [smoothPitch, smoothClarity, smoothVolume] = getFilteredOutliers(this.pitchHistory, samplesCount)[0];

    return [smoothPitch, smoothClarity, smoothVolume]
  }

  private autoCorrelate(buffer, sampleRate) {
    // Perform a quick root-mean-square to see if we have enough signal
    var SIZE = buffer.length;
    var sumOfSquares = 0;
    for (var i = 0; i < SIZE; i++) {
      var val = buffer[i];
      sumOfSquares += val * val;
    }
    var rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
    if (rootMeanSquare < 0.01) {
      return -1;
    }
  
    // Find a range in the buffer where the values are below a given threshold.
    var r1 = 0;
    var r2 = SIZE - 1;
    var threshold = 0.2;
  
    // Walk up for r1
    for (var i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
  
    // Walk down for r2
    for (var i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }
  
    // Trim the buffer to these ranges and update SIZE.
    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length
  
    // Create a new array of the sums of offsets to do the autocorrelation
    var c = new Array(SIZE).fill(0);
    // For each potential offset, calculate the sum of each buffer value times its offset value
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j+i]
      }
    }
  
    // Find the last index where that value is greater than the next one (the dip)
    var d = 0;
    while (c[d] > c[d+1]) {
      d++;
    }
  
    // Iterate from that index through the end and find the maximum sum
    var maxValue = -1;
    var maxIndex = -1;
    for (var i = d; i < SIZE; i++) {
      if (c[i] > maxValue) {
        maxValue = c[i];
        maxIndex = i;
      }
    }
  
    var T0 = maxIndex;
  
    // Not as sure about this part, don't @ me
    // From the original author:
    // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
    // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
    // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
    var x1 = c[T0 - 1];
    var x2 = c[T0];
    var x3 = c[T0 + 1]
  
    var a = (x1 + x3 - 2 * x2) / 2;
    var b = (x3 - x1) / 2
    if (a) {
      T0 = T0 - b / (2 * a);
    }
  
    return sampleRate/T0;
  }

  get initialized() {
    return this.initialized_;
  }
}


class PitchDetector3 {
  private  modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  public pitchHistory: [Hz, number, number][] = [];
  public emaPitchHistory: [Hz, number, number][] = [];
  private pitchDetector: ReturnType<typeof ml5.pitchDetection>;

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
      this.pitchDetector = await ml5.pitchDetection(this.modelUrl, audioContext, stream);
      this.startPitchLoop();
    })();
  }

  private startPitchLoop() {
    this.pitchDetector.getPitch((err: Error, frequency: Hz) => {
      if (err) throw new Error(err.message)
      if (frequency) {
        this.pitchHistory.push([frequency, 1, 1])
      }

      setTimeout(() => {
        this.startPitchLoop()
      }, 1);
    });
  }

  getPitch(): [Hz, number, number] {
    if (!this.initialized) {
      return [0, 0, 0];
    }

    const ema = exponentialMovingAverage(this.pitchHistory, 10, 0.2);
    this.emaPitchHistory.push(ema)

    return ema;
  }

  get initialized() {
    return this.pitchHistory.length > 0
  }
}




export default PitchDetector3;