import { Melody } from "@/lib/Melody";

export interface MelodyAnimationConfig {
  melodySingPixelsPerSecond: number;
  melodyNoteSelectedMaxFreqCentsDiff: number;
  melodyPercentFrameHitToAccept: number;
  paddingTop: Pixel;
  paddingBottom: Pixel;
}

export interface AnimationFrameEvent {
  delta: Second;
  time: Second;
  count: number;
  beat: number;
  beatDelta: number;
}

export default class MelodyLyricsAnimatonElement {
  // path: PointText;
  // highlight: Shape.Rectangle;
  lyricsTrack: Melody["lyricsTrack"];
  currentLyricsLine?: Melody["lyricsTrack"][number];

  constructor({ lyricsTrack }: { lyricsTrack: Melody["lyricsTrack"] }) {
    this.lyricsTrack = lyricsTrack;

    // const rect = new Rectangle(new Point(0, 0), new Size(0, 0));
    // this.highlight = new Shape.Rectangle(rect);
    // this.highlight.fillColor = new paper.Color("#226688");
    // this.highlight.strokeColor = "blue";
    // this.highlight.strokeWidth = 3;
    // this.highlight.blendMode = 'soft-light';
  }

  onAnimationFrame(ev: AnimationFrameEvent) {
    const l = this.lyricsTrack.find(
      (l) => l.start < ev.beat && l.end > ev.beat
    );

    if (!l && this.currentLyricsLine) {
      this.path.remove();
      this.highlight.visible = false;
    }

    if (l && this.currentLyricsLine !== l) {
      if (this.path) {
        this.path.remove();
      }
      this.currentLyricsLine = l;

      const fontSize = 12 * window.devicePixelRatio;
      this.path = new PointText(
        new Point(
          view.center.x,
          view.size.height - this.config.paddingBottom / 2 + fontSize / 2
        )
      );
      this.path.content = l.text;
      this.path.style = {
        ...this.path.style,
        fontFamily: "Courier New",
        fontWeight: "bold",
        fontSize: fontSize,
        fillColor: new paper.Color("#ee6688"),
        justification: "center",
      };

      const size = new Size(this.path.bounds.right - this.path.bounds.left, 1);
      this.highlight.size = size;
      this.highlight.position = new Point(
        this.path.position.x,
        this.path.bounds.bottom
      );
      this.highlight.visible = true;
    }

    if (this.currentLyricsLine) {
      const duration = this.currentLyricsLine.duration;

      this.highlight.size = new Size(
        this.highlight.size.width -
          (ev.beatDelta / duration) * this.path.bounds.size.width,
        this.highlight.size.height
      );
      this.highlight.position = new Point(
        this.highlight.position.x +
          (ev.beatDelta / duration / 2) * this.path.bounds.size.width,
        this.highlight.position.y
      );
    }
  }
}
