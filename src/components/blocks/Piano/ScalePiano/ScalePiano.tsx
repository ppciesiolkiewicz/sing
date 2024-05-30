import { useState, useMemo, useEffect } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { ScaleModule, NoteType } from "@/lib/music";
import { KEYBOARD_KEYS } from "./constants";

interface ScalePianoKeyProps {
  note: any;
  keyboardKey: string;
  isPressed: boolean;
  onMouseDown: (ev: any) => void;
  onMouseUp: (ev: any) => void;
}

function ScalePianoKey({
  note,
  keyboardKey,
  isPressed,
  onMouseDown,
  onMouseUp,
}: ScalePianoKeyProps) {
  return (
    <Grid item flexBasis={"80px"}>
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          background: isPressed ? "lightblue" : "white",
          userSelect: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        role={"button"}
      >
        <Box>
          <Typography
            display={"inline"}
            variant={"overline"}
            fontWeight={"bold"}
          >
            {note.name}
          </Typography>{" "}
          <Typography display={"inline"} variant={"overline"}>
            [ {note.interval} ]
          </Typography>
        </Box>
        <Typography variant={"overline"}>({keyboardKey})</Typography>
      </Paper>
    </Grid>
  );
}

interface ChordsPianoProps {
  keyTonic: string;
  keyType: string;
  onKeyPressed: (noteName: string) => void;
  onKeyReleased: (noteName: string) => void;
  onPressedKeysChanged: (noteNames: string[]) => void;
  lowestNoteName: string;
  highestNoteName: string;
}

export default function ScalePiano({
  keyTonic,
  keyType,
  onKeyPressed,
  onKeyReleased,
  onPressedKeysChanged,
  lowestNoteName, // TODO: unused, should we just keep?  [2, 3, 4, 5]?
  highestNoteName,
}: ChordsPianoProps) {
  const octaves = [2, 3, 4, 5];
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const scale = useMemo(
    () => ScaleModule.get(keyTonic, keyType),
    [keyTonic, keyType]
  );
  const keyboardKeyToNoteMap = useMemo(() => {
    const lowestNoteName_ = `${scale.notes[0]}${octaves[0]}`;
    const highestNoteName_ = `${scale.notes[scale.notes.length - 1]}${
      octaves[octaves.length - 1]
    }`;
    const scaleNotes = ScaleModule.getScaleNotes(
      keyTonic,
      keyType,
      lowestNoteName_,
      highestNoteName_
    );

    const keyboardKeyToNoteMap: Record<string, NoteType> = scaleNotes.reduce(
      (acc, note, i) => {
        const octIdx = Math.floor(i / scale.intervals.length);
        return {
          ...acc,
          [KEYBOARD_KEYS[octIdx][i % scale.intervals.length]]: {
            ...note,
            interval: scale.intervals[i % scale.intervals.length],
          },
        };
      },
      {}
    );

    return keyboardKeyToNoteMap;
  }, [scale]);

  const onPianoKeyPressed_ = (noteName: string) => {
    onKeyPressed(noteName);
    setPressedKeys((pressedKeys) => {
      const r = [...pressedKeys, noteName];
      onPressedKeysChanged(r);

      return r;
    });
  };
  const onPianoKeyReleased_ = (noteName: string) => {
    onKeyReleased(noteName);
    setPressedKeys((pressedKeys) => {
      const r = pressedKeys.filter((n) => n !== noteName);
      onPressedKeysChanged(r);

      return r;
    });
  };

  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (ev.repeat) {
        return;
      }
      const note = keyboardKeyToNoteMap[ev.key.toLowerCase()];
      if (!note) return;
      onPianoKeyPressed_(note.name);
    };

    const handleKeyUp = (ev) => {
      const note = keyboardKeyToNoteMap[ev.key.toLowerCase()];
      if (!note) return;
      onPianoKeyReleased_(note.name);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyboardKeyToNoteMap]);

  return (
    <Grid container spacing={1} justifyContent={"center"} width={"100%"}>
      {KEYBOARD_KEYS.map((keyboardKeys, i) => {
        const v = keyboardKeys.map((key, j) => {
          if (Object.keys(keyboardKeyToNoteMap).indexOf(key) < 0) {
            return null;
          }
          const note = keyboardKeyToNoteMap[key];
          return (
            <ScalePianoKey
              key={`${keyTonic}${keyType}${j}`}
              isPressed={pressedKeys.indexOf(note.name) > -1}
              note={note}
              keyboardKey={key}
              onMouseDown={() => onPianoKeyPressed_(note.name)}
              onMouseUp={() => onPianoKeyReleased_(note.name)}
            />
          );
        });

        return (
          <Grid
            item
            xs={12}
            md={6}
            container
            spacing={1}
            justifyContent={"center"}
            key={i}
          >
            {v}
          </Grid>
        );
      }).flat()}
    </Grid>
  );
}
