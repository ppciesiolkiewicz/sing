import type { ChordType } from '@/lib/music';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { ChordModule, ScaleModule, NoteModule, MeasureModule } from '@/lib/music';
import { KEYBOARD_KEYS } from './constants';



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
    <Grid item xs={1}>
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: isPressed ? 'lightblue' : 'white',
          userSelect: 'none'
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        role={'button'}
      >
        <Typography variant={'overline'} fontWeight={'bold'}>
          {note.name}
        </Typography>
        <Typography variant={'overline'}>
          [ {note.interval} ]
        </Typography>
        <Typography variant={'overline'}>
          ({keyboardKey})
        </Typography>
      </Paper>
    </Grid>
  )
}

interface ChordsPianoProps {
  keyTonic: string;
  keyType: string;
  onKeyPressed: (noteNames: string) => void;
  onKeyReleased: (noteNames: string) => void;
  // lowestNoteName: string;
  // highestNoteName: string;
}

export default function ScalePiano({
  keyTonic,
  keyType,
  onKeyPressed,
  onKeyReleased,
  // lowestNoteName,
  // highestNoteName,
}: ChordsPianoProps) {
  // TODO: octaves based on vocal range?
  const octaves = [2, 3, 4];
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const scale = useMemo(() => ScaleModule.get(keyTonic, keyType), [keyTonic, keyType]);
  const keyboardKeyToNoteMap = useMemo(
    () => {
      const lowestNoteName_ = `${scale.notes[0]}${octaves[0]}`
      const highestNoteName_ =  `${scale.notes[scale.notes.length - 1]}${octaves[octaves.length - 1]}`
      const notes = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName_, highestNoteName_);
      const map = notes.reduce((acc, note, i) => ({
          ...acc,
          [KEYBOARD_KEYS[i]]: {
            ...note,
            interval: scale.intervals[i % scale.intervals.length],
          },
        }), {});

      return map;
    },
    [scale], 
  );
  

  const onPianoKeyPressed_ = (noteName: string) => {
    setPressedKeys([...pressedKeys, noteName]);
    onKeyPressed(noteName);
  };
  const onPianoKeyReleased_ = (noteName: string) => {
    setPressedKeys(pressedKeys.filter(n => n !== noteName));
    onKeyReleased(noteName);
  }

  const onPianoKeyPressedRef = useRef(onPianoKeyPressed_);
  const onPianoKeyReleasedRef = useRef(onPianoKeyReleased_);
  useEffect(() => {
    onPianoKeyPressedRef.current = onPianoKeyPressed_;
    onPianoKeyReleasedRef.current = onPianoKeyReleased_;
  }, [pressedKeys, scale])

  
  useEffect(() => {
    const handleKeyDown = (ev) => {
      if (ev.repeat) {
        return;
      }
      const note = keyboardKeyToNoteMap[ev.key.toLowerCase()];
      if(!note) return;
      onPianoKeyPressedRef.current(note.name);
    }
  
    const handleKeyUp = (ev) => {
      const note = keyboardKeyToNoteMap[ev.key.toLowerCase()];
      if(!note) return;
      onPianoKeyReleasedRef.current(note.name);
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [keyboardKeyToNoteMap]);

  return (
    <>
      <Grid container spacing={2}>
        {/* iterating over KEYBOARD_KEYS to preserve the order */}
        {KEYBOARD_KEYS.map((key, idx) => {
          if (Object.keys(keyboardKeyToNoteMap).indexOf(key) < 0) {
            return null;
          }
          const note = keyboardKeyToNoteMap[key];
          return (
            <ScalePianoKey
              key={`${keyTonic}${keyType}${idx}`}
              isPressed={pressedKeys.indexOf(note) > -1}
              note={note}
              keyboardKey={key}
              onMouseDown={() => onPianoKeyPressedRef.current(note.name)}
              onMouseUp={() => onPianoKeyReleasedRef.current(note.name)}
            />
          )
        })}
      </Grid>
      <Box mt={5}>
        {scale.type}
        <pre>
          {JSON.stringify(scale.notes)}
        </pre>
        <pre>
          {JSON.stringify(scale.intervals)}
        </pre>
      </Box>
    </>
  )
}