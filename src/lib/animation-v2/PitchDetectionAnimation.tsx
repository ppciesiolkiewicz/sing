"use client";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import {
  Renderer,
  Application,
  Graphics,
  Text,
  TextStyle,
  Container,
} from "pixi.js";
import PitchDetector from "@/lib/PitchDetector";
import Modal from "@/components/atoms/Modal";
import { Melody } from "../Melody";
import BackingTrack from "./BackingTrack";

const THEME = {
  backgroundColor: 0xfefefe,
  noteLines: {
    color: 0x020202,
    highlightedColor: 0x44ee77,
    textColor: 0x020202,
  },
  notesRects: {
    color: 0xfefefe,
    borderColor: 0x778877,
  },
  pitchCirle: {
    color: 0xfefefe,
    borderColor: 0x020202,
  },
};

const NOTE_LINE_X_RIGHT_OFFSET = 60;
const NOTE_LINE_HEIGHT = 2;
const DISTANCE_BETWEEN_NOTE_LINES = 30;
const NOTE_BLOCK_HEIGHT = 30;
const NOTE_LINE_FONT_SIZE = 24;

// TODO: use either b or #
// prettier-ignore
const NOTES = [
  "C2", "Db2", "D2", "Eb2", "E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2",
  "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3",
  "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4",
  "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5",
  "C6"
].reverse();

// prettier-ignore
const NOTES_SHARP = [
  "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
  "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
  "C6"
].reverse();

const LOW_NOTE_FREQUENCY = 65.41;
const HIGH_NOTE_FREQUENCY = 1046.5;

const MELODY_PIXELS_PER_SECOND = 100;
const TIME_TO_TEMPO_FACTOR = MELODY_PIXELS_PER_SECOND / 1000;

function getXPositionOffset(
  time: { lastTime: number; elapsedMS: number; deltaTime: number },
  tempo: number
) {
  // 60 is base tempo so 1 Second duration = 1 Second
  //  TODO: tempo here vs ticker.speed=(tempo / melody.tempo);
  // console.log(
  //   "getXPositionOffset",
  //   TIME_TO_TEMPO_FACTOR,
  //   time.lastTime / TIME_TO_TEMPO_FACTOR
  // );
  return time.elapsedMS * TIME_TO_TEMPO_FACTOR * (tempo / 60);
}

function noteNameToYPosition(noteName: string, heightOffset: number = 0) {
  // TODO: consistently use NOTES or NOTES_SHARP
  const index1 = NOTES.indexOf(noteName);
  const index = index1 >= 0 ? index1 : NOTES_SHARP.indexOf(noteName);
  return noteIndexToYPosition(index, heightOffset);
}

function noteIndexToYPosition(index: number, heightOffset: number = 0) {
  // TOOD: use precalculated NOTES_Y_POSITIONS for speed
  return index * DISTANCE_BETWEEN_NOTE_LINES - heightOffset / 2;
}

const calculateDistance = (note, lyric) => {
  const startDistance = Math.abs(lyric.start - note.start);
  const endDistance = Math.abs(lyric.end - note.end);
  return startDistance + endDistance;
};

const findClosestLyric = (note, lyrics) => {
  return lyrics.reduce((closest, lyric) => {
    const currentDistance = calculateDistance(note, lyric);
    if (!closest || currentDistance < closest.distance) {
      return { lyric, distance: currentDistance };
    }
    return closest;
  }, null).lyric;
};

const NOTES_Y_POSITIONS = NOTES.map((_, i) =>
  noteIndexToYPosition(i, NOTE_BLOCK_HEIGHT)
);

const getText = ({
  text,
  fontSize,
  x,
  y,
}: {
  text: string;
  fontSize: number;
  x: number;
  y: number;
}) => {
  const style = new TextStyle({
    fontFamily: "Arial",
    fontSize,
    fill: THEME.noteLines.textColor,
    stroke: { color: THEME.noteLines.textColor, width: 1, join: "round" },
  });
  const basicText = new Text({ text, style });
  basicText.x = x;
  basicText.y = y;

  return basicText;
};

const NOTE_LINES_HEIGHT = (NOTES.length - 1) * DISTANCE_BETWEEN_NOTE_LINES;
const minNoteLogFreq: LogHz = Math.log2(LOW_NOTE_FREQUENCY);
const maxNoteLogFreq: LogHz = Math.log2(HIGH_NOTE_FREQUENCY);
const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
const pixelsPerLogHertz = NOTE_LINES_HEIGHT / diffLogFreq;
const pitchOffset = minNoteLogFreq * pixelsPerLogHertz;
function pitchToYPosition(pitch: number) {
  if (pitch < LOW_NOTE_FREQUENCY) {
    pitch = LOW_NOTE_FREQUENCY - 5;
  }

  if (pitch > HIGH_NOTE_FREQUENCY) {
    pitch = HIGH_NOTE_FREQUENCY + 20;
  }

  return NOTE_LINES_HEIGHT - Math.log2(pitch) * pixelsPerLogHertz + pitchOffset;
}

class PitchAnimationAnimationPixie {
  ready: boolean = false;
  app: Application<Renderer> = new Application();
  canvas: HTMLCanvasElement | null = null;
  updateHighlightedNotesRequired: boolean = false;
  highlightedNotes: string[] = [];
  melody?: Melody;

  initialStarted_ = false;
  paused_ = false;
  started_ = false;
  tempo_ = 60;

  constructor(
    canvasContainer: HTMLElement,
    onReady: (ready: boolean) => void,
    melody?: Melody,
    tempo?: number
  ) {
    this.app.init({ antialias: true, resizeTo: canvasContainer }).then(() => {
      this.canvas = this.app.canvas;
      canvasContainer.appendChild(this.app.canvas);
      this.app.stop();
      this.ready = true;
      onReady(true);
    });
    console.log("Melody: s", melody);
    this.melody = melody;
    this.tempo_ = melody?.tempo || tempo || 60;
  }

  public start() {
    if (!this.ready) {
      return;
    }

    // Init
    const app = this.app;
    const pitchDetector: PitchDetector = new PitchDetector();
    const width = app.canvas.width,
      height = app.canvas.height;

    // Note lines
    // TODO: separate graphics, destroy to optimize memory
    const notesLinesContainer = new Container();
    const noteLinesGraphics = new Graphics();
    notesLinesContainer.addChild(noteLinesGraphics);
    // TODO: global notesLinesContainer|noteLinesGraphics
    drawNoteLines();

    // TODO: Create/Load score
    // TODO: should have separate graphics for each rect for collision detection?
    const melodyContainer = new Container();
    if (this.melody) {
      for (let n of this.melody.singTrack) {
        const notesRectsGraphics = new Graphics();
        notesRectsGraphics.rect(
          width / 2 + n.start * MELODY_PIXELS_PER_SECOND,
          noteNameToYPosition(n.name, NOTE_BLOCK_HEIGHT),
          n.duration * MELODY_PIXELS_PER_SECOND,
          NOTE_BLOCK_HEIGHT
        );
        notesRectsGraphics.fill(THEME.notesRects.color);
        notesRectsGraphics.stroke({
          width: 2,
          color: THEME.notesRects.borderColor,
        });
        melodyContainer.addChild(notesRectsGraphics);

        const noteNameText = getText({
          x: width / 2 + n.start * MELODY_PIXELS_PER_SECOND + 7,
          y: noteNameToYPosition(n.name, NOTE_BLOCK_HEIGHT),
          text: n.name,
          fontSize: NOTE_LINE_FONT_SIZE,
        });
        melodyContainer.addChild(noteNameText);

        if (this.melody.lyricsTrack.length) {
          const l = findClosestLyric(n, this.melody.lyricsTrack);
          if (l) {
            const lyricsText = getText({
              x:
                width / 2 +
                n.start * MELODY_PIXELS_PER_SECOND +
                7 +
                NOTE_LINE_FONT_SIZE * 2,
              y: noteNameToYPosition(n.name, NOTE_BLOCK_HEIGHT),
              text: l.text,
              fontSize: NOTE_LINE_FONT_SIZE,
            });
            melodyContainer.addChild(lyricsText);
          }
        }
      }

      // Backing Track
      // TODO: tempo param for backing track
      const backingTrack = new BackingTrack({
        track: this.melody.backingTrack,
      });

      let totalTime = 0;
      const melodyTicker = app.ticker.add((time) => {
        if (!this.melody) {
          return;
        }
        const beat = (totalTime * this.melody.tempo) / 1000 / 60;
        melodyContainer.position.x -= getXPositionOffset(
          time,
          this.melody?.tempo || 60
        );
        backingTrack.onAnimationFrame({
          beat,
        });
        totalTime += time.elapsedMS;
      });
    }

    // Pitch related updates
    // const noteHighlightGraphics = new Graphics();
    const pitchHistoryGraphics = new Graphics();
    const pitchGraphics = new Graphics();
    pitchGraphics.circle(width / 2, 0, 8);
    pitchGraphics.fill(THEME.pitchCirle.color);
    pitchGraphics.stroke({ width: 1, color: THEME.pitchCirle.borderColor });

    app.ticker.add((time) => {
      const pitch = pitchDetector.getPitch();
      pitchHistoryGraphics.position.x -= getXPositionOffset(
        time,
        this.melody?.tempo || 60
      );
      if (pitch < 0) {
        pitchGraphics.visible = false;
      } else {
        const yPosition = pitchToYPosition(pitch);
        pitchGraphics.position.y = yPosition;
        pitchGraphics.visible = true;

        pitchHistoryGraphics.circle(
          width / 2 - pitchHistoryGraphics.position.x,
          pitchGraphics.position.y,
          2
        );
        pitchHistoryGraphics.fill(THEME.pitchCirle.color);
        pitchHistoryGraphics.stroke({
          width: 1,
          color: THEME.pitchCirle.borderColor,
        });

        // TOOD: smoothen moving stage
        // TODO: cap movement to the melody notes + STAGE_MOVE_MARGIN_WHEN_MELODY_LAODED
        if (yPosition) {
          app.stage.position.y = height / 2 - yPosition;
        }
      }

      // const NOTE_HIT_TOLERANCE = 10;
      // const closestNoteYPosition = NOTES_Y_POSITIONS.find(
      //   (yPos) => Math.abs(yPosition - yPos) < NOTE_HIT_TOLERANCE
      // );
      // noteHighlightGraphics.position.x = -xPositionOffset;
      // if (closestNoteYPosition) {
      //   const HIGHLIGHTED_NOTE_LENGTH_PER_TICK = 10;
      //   noteHighlightGraphics.rect(
      //     width / 2 + xPositionOffset - HIGHLIGHTED_NOTE_LENGTH_PER_TICK,
      //     closestNoteYPosition,
      //     HIGHLIGHTED_NOTE_LENGTH_PER_TICK,
      //     NOTE_BLOCK_HEIGHT
      //   );
      //   noteHighlightGraphics.fill(0x33a578);
      // }
    });

    // Highlighted note lines
    let highlightedNoteLinesGraphics = new Graphics();
    app.ticker.add((time) => {
      if (!this.updateHighlightedNotesRequired) {
        return;
      }
      console.log("Updating highlights: ", this.highlightedNotes);
      this.updateHighlightedNotesRequired = false;

      // TODO: highlightedNoteLinesGraphics.clear() doesn't clear.. so we drawNoteLines
      drawNoteLines();
      highlightedNoteLinesGraphics.clear();
      this.highlightedNotes.forEach((noteName) => {
        noteLinesGraphics.rect(
          NOTE_LINE_X_RIGHT_OFFSET,
          noteNameToYPosition(noteName, NOTE_LINE_HEIGHT),
          width,
          NOTE_LINE_HEIGHT
        );
        noteLinesGraphics.fill(0x22a775);
      });
    });

    app.renderer.background.color = THEME.backgroundColor;
    app.stage.addChild(notesLinesContainer);
    app.stage.addChild(melodyContainer);
    app.stage.addChild(pitchGraphics);
    app.stage.addChild(pitchHistoryGraphics);
    app.stage.addChild(highlightedNoteLinesGraphics);

    function drawNoteLines() {
      noteLinesGraphics.rect(width / 2, 0, 1, NOTE_LINES_HEIGHT);
      noteLinesGraphics.fill(0xaeaeae);
      for (let i = 0; i < NOTES_SHARP.length; i++) {
        const noteName = NOTES_SHARP[i];

        const style = new TextStyle({
          fontFamily: "Arial",
          fontSize: NOTE_LINE_FONT_SIZE,
          fill: THEME.noteLines.textColor,
          stroke: { color: THEME.noteLines.textColor, width: 1, join: "round" },
        });
        const basicText = new Text({ text: noteName, style });
        basicText.x = 4;
        basicText.y = noteIndexToYPosition(i, NOTE_LINE_FONT_SIZE + 2);
        notesLinesContainer.addChild(basicText);

        noteLinesGraphics.rect(
          NOTE_LINE_X_RIGHT_OFFSET,
          noteIndexToYPosition(i, NOTE_LINE_HEIGHT),
          width,
          NOTE_LINE_HEIGHT
        );
        noteLinesGraphics.fill(THEME.noteLines.color);
      }
    }

    app.start();
  }

  public setHighlightedNoteLines(notes: string[]) {
    this.updateHighlightedNotesRequired = true;
    this.highlightedNotes = notes;
  }

  public pause() {
    this.paused_ = true;
    this.app.ticker.stop();
  }

  public stop() {
    if (!this.ready) {
      // TODO: Why stop is called multiple times
      console.log("Cannot stop animation - not ready");
      return;
    }

    this.initialStarted_ = false;
    this.paused_ = false;
    this.started_ = false;

    this.app.stop();
  }

  public setTempo(tempo: number) {
    this.tempo_ = tempo;
  }

  get started() {
    return this.started_;
  }
  get paused() {
    return this.paused_;
  }
}

interface Props {
  highlightedNotes?: string[];
  melody?: Melody;
  tempo?: number;
}

export default function PitchDetectionAnimation({
  highlightedNotes = [],
  melody,
  tempo,
}: Props) {
  const [started, setStarted] = useState(false);
  const [animation, setAnimation] = useState<PitchAnimationAnimationPixie>();
  const [ready, setReady] = useState(false);
  const animationRef = useRef<PitchAnimationAnimationPixie>();

  useLayoutEffect(() => {
    if (animationRef.current) {
      return;
    }

    const anim = new PitchAnimationAnimationPixie(
      document.getElementById("render")!,
      setReady,
      melody,
      tempo
    );
    animationRef.current = anim;
    setAnimation(anim);
  }, [animation, setAnimation, melody, tempo]);

  useEffect(() => {
    return () => {
      return animationRef.current?.stop();
    };
  }, []);

  useLayoutEffect(() => {
    if (!ready || !animation?.ready) {
      return;
    }

    animation?.setHighlightedNoteLines(highlightedNotes);
  }, [highlightedNotes, animation, ready]);

  return (
    <Box
      id={"render"}
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Modal title={"Let's start"} open={!started} fullWidth maxWidth={"sm"}>
        <Box display={"flex"} justifyContent={"center"}>
          <Button
            color={"primary"}
            variant={"contained"}
            onClick={() => {
              if (!ready || !animation?.ready) {
                return;
              }

              setStarted(true);
              animation.start();
            }}
          >
            Start
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
