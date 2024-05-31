import { useState, useMemo, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { NoteModule } from "@/lib/music";
import { KEY_TO_NOTE_MAP } from "./constants";
import PianoKey from "./PianoKey";

interface Props {
  lowestNoteName: string;
  highestNoteName: string;
  onKeyPressed: (noteName: string) => void;
  onKeyReleased: (noteName: string) => void;
  onPressedKeysChanged: (noteNames: string[]) => void;
}

export default function Piano({
  lowestNoteName,
  highestNoteName,
  onKeyPressed,
  onKeyReleased,
  onPressedKeysChanged,
}: Props) {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const notes = useMemo(() => {
    const notes = NoteModule.getNoteRange(lowestNoteName, highestNoteName);
    return notes;
  }, [lowestNoteName, highestNoteName]);

  // TODO: filter keys based on lowest/highest
  const keyToNoteMap = useMemo(
    () => KEY_TO_NOTE_MAP,
    [lowestNoteName, highestNoteName]
  );

  const onPianoKeyPressed_ = (noteName: string) => {
    console.log("onPianoKeyPressed_", noteName);
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

  const handleKeyDown = (ev) => {
    if (ev.repeat) {
      return;
    }
    const noteName = keyToNoteMap[ev.key.toLowerCase()];
    if (!noteName) return;
    onPianoKeyPressed_(noteName);
  };

  const handleKeyUp = (ev) => {
    const noteName = keyToNoteMap[ev.key.toLowerCase()];
    if (!noteName) return;
    onPianoKeyReleased_(noteName);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onKeyPressed, onKeyReleased]);

  return (
    <Box
      width={"100%"}
      height={"100%"}
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"center"}
      sx={{
        userSelect: "none",
      }}
    >
      {notes.map((note) => (
        <PianoKey
          isPressed={pressedKeys.indexOf(note.name) > -1}
          key={note.name}
          noteName={note.name}
          totalPianoKeysCount={notes.length}
          onKeyPressed={onPianoKeyPressed_}
          onKeyReleased={onPianoKeyReleased_}
        />
      ))}
    </Box>
  );
}
