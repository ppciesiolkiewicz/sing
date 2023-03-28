import type { ChordType } from '@/lib/music';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { ChordModule, ScaleModule } from '@/lib/music';
import { KEYBOARD_KEYS } from './constants';

interface ChordPianoKeyProps {
  chord: ChordType;
  keyboardKey: string;
  isPressed: boolean;
}

function ChordPianoKey({
  chord,
  keyboardKey,
  isPressed,
}: ChordPianoKeyProps) {
  return (
    <Grid item xs={1}>
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: isPressed ? 'lightblue' : 'white',
        }}
      >
        <Typography variant={'overline'}>
          {chord.symbol}
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
  onKeyPressed: (noteNames: string[]) => void;
  onKeyReleased: (noteNames: string[]) => void;
}

export default function ChordsPiano({
  keyTonic,
  keyType,
  onKeyPressed,
  onKeyReleased,
}: ChordsPianoProps) {
  const octaves = [2, 3];
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const scale = useMemo(() => ScaleModule.get(keyTonic, keyType), [keyTonic, keyType]);
  const keyboardKeyToChordMap = useMemo(
    // TODO: extract to music.tsx
    () => octaves.map(octave =>
          [...scale.keyChords.triads, ...scale.keyChords.chords].map(chordName => ({ chordName, octave }))
        )
        .flat()
        .filter(Boolean)
        .reduce((acc, { chordName, octave }, i) => {
          const chord = ChordModule.get(chordName);
          if (!chord) {
            return acc;
          }
          return {
            ...acc,
            [KEYBOARD_KEYS[i]]: {
              ...chord,
              symbol: `${chord.symbol}${octave}`,
              notes: chord.notes.map(n =>`${n}${octave}`),
            }
          }
        }, {}),
    [scale], 
  );
  const chordSymbolToKeyboardKeyMap = useMemo(
    // TODO: lodash? lib? for reversing objects
    () => Object.keys(keyboardKeyToChordMap)
    .reduce((acc, key) => ({
        ...acc,
        [keyboardKeyToChordMap[key].symbol]: key
    }), {}),
    [keyboardKeyToChordMap],
    )

  const onPianoKeyPressed_ = (chord: ChordType) => {
    setPressedKeys([...pressedKeys, chord.symbol]);
    onKeyPressed(chord.notes);
  };
  const onPianoKeyReleased_ = (chord: ChordType) => {
    setPressedKeys(pressedKeys.filter(s => s !== chord.symbol));
    onKeyReleased(chord.notes);
  }

  useEffect(() => {
    // TODO: do it without refs or extract to component (ChordsPiano, Piano)
    onPianoKeyPressedRef.current = onPianoKeyPressed_;
    onPianoKeyReleasedRef.current = onPianoKeyReleased_;
  }, [pressedKeys])

  const onPianoKeyPressedRef = useRef(onPianoKeyPressed_);
  const onPianoKeyReleasedRef = useRef(onPianoKeyReleased_);

  const handleKeyDown = (ev) => {
    if (ev.repeat) {
      return;
    }
    const chord = keyboardKeyToChordMap[ev.key.toLowerCase()];
    if(!chord) return;
    onPianoKeyPressedRef.current(chord);
  }

  const handleKeyUp = (ev) => {
    const chord = keyboardKeyToChordMap[ev.key.toLowerCase()];
    if(!chord) return;
    onPianoKeyReleasedRef.current(chord);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, []);

  return (
    <Grid container spacing={2}>
      {KEYBOARD_KEYS.map(key => {
        if (Object.keys(keyboardKeyToChordMap).indexOf(key) < 0) {
          return null;
        }
        const chord = keyboardKeyToChordMap[key];
        return (
          <ChordPianoKey
            isPressed={pressedKeys.indexOf(chord.symbol) > -1}
            chord={chord}
            keyboardKey={key}
          />
        )
      })}
    </Grid>
  )
}