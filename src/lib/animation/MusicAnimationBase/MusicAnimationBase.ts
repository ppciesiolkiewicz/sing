
import type { NoteType } from '@/lib/music';
import paper, { view } from 'paper'
import { NoteModule, ScaleModule, ChordModule } from '@/lib/music';

const LOWEST_NOTE = NoteModule.get('C1') as NoteType;
const HIGHEST_NOTE = NoteModule.get('C6') as NoteType;
const PIXELS_PER_LOG_HERTZ = 500;

export default class MusicAnimationBase {
  constructor() {

  }

  private freqToCanvasYPosition(freq: Hz) {
      const part = -Math.log2(LOWEST_NOTE.freq!) * PIXELS_PER_LOG_HERTZ
      return (freq: Hz) => {
        return view.size.height - (Math.log2(freq) * PIXELS_PER_LOG_HERTZ + part );
      }
  }
}