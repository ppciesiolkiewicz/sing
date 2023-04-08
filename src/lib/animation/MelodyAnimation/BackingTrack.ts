
import type {
  AnimationFrameEvent,
} from './types';
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody'

export default class BackingTrack {
  track: Melody['backingTrack'];
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  };

  constructor({
    track,
    instrumentConfig
  }: {
    track: Melody['backingTrack']
    instrumentConfig: Melody['instrumentConfig'],
  }) {
    this.track = track;
    this.soundGenerator = new Tone.Sampler(instrumentConfig).toDestination();
  }

  onAnimationFrame(ev: AnimationFrameEvent) {
    this.track.forEach((m) => {
      // TODO: don't modify the object - m.played 
      // ev.time <= m.start + 0.1 when animation is out of focus to not play all the past notes at the same time
      // @see time comment above
      if (!m.played && ev.beat >= m.start && ev.beat <= m.start + 0.1) {
        this.soundGenerator.triggerAttackRelease(m.name, m.duration);
        m.played = true;
      }
    });
  }
}