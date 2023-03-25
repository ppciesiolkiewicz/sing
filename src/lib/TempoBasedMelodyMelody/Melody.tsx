import { MelodyConfig } from './MelodyConfig'

class Melody extends MelodyConfig {
  tempo: number;

  constructor(config: MelodyConfig, tempo: number) {
    super(config);
    this.tempo = tempo;
  }

  static fromJSON() {
    // TODO:
  }

  toJSON() {
    // TODO:
  }
}

export {
  Melody,
}