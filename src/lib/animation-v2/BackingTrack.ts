import * as Tone from "tone";
import { Melody } from "@/lib/Melody";

export interface AnimationFrameEvent {
  delta: Second;
  time: Second;
  count: number;
  beat: number;
  beatDelta: number;
}

export default class BackingTrack {
  track: Melody["backingTrack"];
  soundGenerator: {
    triggerAttackRelease: (notes: string | string[], duration: number) => void;
  }[];

  constructor({ track }: { track: Melody["backingTrack"] }) {
    this.track = track;

    this.soundGenerator = [];
    track.forEach((t, i) => {
      this.soundGenerator.push(
        new Tone.Sampler({
          // TODO: hardcoded volume
          volume: -12 * i,
          ...t.instrumentConfig,
        }).toDestination()
      );
    });
  }

  onAnimationFrame(ev: Pick<AnimationFrameEvent, "beat">) {
    this.track.forEach((t, i) => {
      // TODO: don't modify the object - m.played
      // ev.time <= m.start + 0.1 when animation is out of focus to not play all the past notes at the same time
      // @see time comment above

      t.track.forEach((m) => {
        if (!m.played && ev.beat >= m.start && ev.beat <= m.start + 0.1) {
          this.soundGenerator[i].triggerAttackRelease(m.name, m.duration);
          m.played = true;
        }
      });
    });
  }
}
