import paper, { view, Point, PointText } from 'paper'
import { Melody } from '@/lib/Melody'
import type { AnimationFrameEvent, MelodyAnimationConfig } from './types';

export default class MelodyLyricsAnimatonElement {
  path: PointText;
  highlight: Path.Rectangle;
  lyricsTrack: Melody['lyricsTrack'];
  currentLyricsLine?: Melody['lyricsTrack'][number];
  config: MelodyAnimationConfig;
  
  constructor({
    lyricsTrack,
    theme,
    config,
  }: {
    lyricsTrack: Melody['lyricsTrack'],
    theme: {
      
    },
    config: MelodyAnimationConfig,
  }) {
    this.config = config;
    this.lyricsTrack = lyricsTrack;

    // this.highlight = new Path.Rectangle(view.bounds);
    // this.highlight.fillColor = 'white';
    // this.highlight.blendMode = 'multiply';
  }

  onAnimationFrame(ev: AnimationFrameEvent) {
    const l = this.lyricsTrack.find(l => l.start < ev.time && l.end > ev.time);

    if (l && this.currentLyricsLine !== l) {
      console.log('lyrics', l)
      if (this.path) {
        this.path.remove()
      }
      this.currentLyricsLine = l;
      
      const fontSize = 12 * window.devicePixelRatio;
      this.path = new PointText(
        new Point(
          view.center.x,
          view.size.height - this.config.paddingBottom/2 + fontSize/2,
        )
      );
      this.path.content = l.text;
      this.path.style = {
          ...this.path.style,
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: fontSize,
          fillColor: new paper.Color('#ee6688'),
          justification: 'center'
      };
    }
  }
}
