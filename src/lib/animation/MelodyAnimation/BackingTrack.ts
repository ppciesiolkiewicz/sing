
import type {
  AnimationFrameEvent,
} from './types';
import * as Tone from 'tone';
import { Melody } from '@/lib/Melody'

export default class BackingTrack {
  track: Melody['backingTrack'];
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  }[];

  constructor({
    track,
  }: {
    track: Melody['backingTrack']
  }) {
    this.track = track;

    this.soundGenerator = [];
    track.forEach(t => {
      this.soundGenerator.push(new Tone.Sampler(t.instrumentConfig).toDestination());
    });
  }

  onAnimationFrame(ev: AnimationFrameEvent) {
    this.track.forEach((t, i) => {
      // TODO: don't modify the object - m.played 
      // ev.time <= m.start + 0.1 when animation is out of focus to not play all the past notes at the same time
      // @see time comment above

      t.track.forEach(m => {
        if (!m.played && ev.beat >= m.start && ev.beat <= m.start + 0.1) {
          this.soundGenerator[i].triggerAttackRelease(m.name, m.duration);
          m.played = true;
        }
      })
    });
  }
}