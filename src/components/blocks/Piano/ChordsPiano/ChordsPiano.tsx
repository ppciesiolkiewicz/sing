import type { ChordType } from '@/lib/music';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { ChordModule, ScaleModule, NoteModule } from '@/lib/music';
import { KEYBOARD_KEYS } from './constants';


export const CHORDS_PIANO_MODE_ALL_NOTES = 'ALL_NOTES';
export const CHORDS_PIANO_MODE_ARPEGGIO = 'ARPEGGIO';

interface ChordPianoKeyProps {
  chord: ChordType;
  keyboardKey: string;
  isPressed: boolean;
  onMouseDown: (ev: any) => void;
  onMouseUp: (ev: any) => void;
}

function ChordPianoKey({
  chord,
  keyboardKey,
  isPressed,
  onMouseDown,
  onMouseUp,
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
          userSelect: 'none'
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        role={'button'}
      >
        <Typography variant={'overline'} fontWeight={'bold'}>
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
  modeConfig: {
    mode: typeof CHORDS_PIANO_MODE_ARPEGGIO;
    tempo: number;
  } | {
    mode: typeof CHORDS_PIANO_MODE_ALL_NOTES;
  }
}

function arpeggioAnimation({
  chord,
  tempo,
  onKeyPressed,
  onKeyReleased,
  pressedChordSymbolKeysRef
}) {
  const notes = chord.notes.length == 3
    ? [...chord.notes, chord.notes[chord.notes.length - 2]]
    : chord.notes;
  let start: Second;
  let wasNotePlayedInBarArray = new Array(notes.length).fill(false);
  const timeToBeat = (time: Second, tempo: number) => {
    const secondsPerBeat = tempo / 60;
    const beatNo = time * secondsPerBeat;
    return Math.floor(beatNo % 4);
  }
  const arpeggio = (chord: ChordType) => (timestamp: MilliSecond) => {
    if (start === undefined) {
      start = timestamp / 1000;
    }
    timestamp = timestamp / 1000;

    const time: Second = timestamp - start;
    const beatNo = timeToBeat(time, tempo);
    const noteIdx = beatNo % notes.length;


    if (!wasNotePlayedInBarArray[noteIdx]) {
      wasNotePlayedInBarArray[noteIdx] = true;
      wasNotePlayedInBarArray[(noteIdx + 1) % wasNotePlayedInBarArray.length] = false;
      onKeyPressed([notes[noteIdx]])
      onKeyReleased(noteIdx === 0 ? [notes[notes.length - 1]] : [notes[noteIdx - 1]])
    }

    if (pressedChordSymbolKeysRef.current.indexOf(chord.symbol) > -1) {
      window.requestAnimationFrame(arpeggio(chord))
    }
  }
  window.requestAnimationFrame(arpeggio(chord));
}

export default function ChordsPiano({
  keyTonic,
  keyType,
  onKeyPressed,
  onKeyReleased,
  modeConfig,
}: ChordsPianoProps) {
  // TODO: octaves based on vocal range?
  const octaves = [2, 3, 4];
  const [pressedChordSymbolKeys, setPressedChordSymbolKeys] = useState<string[]>([]);
  const pressedChordSymbolKeysRef = useRef(pressedChordSymbolKeys);
  const scale = useMemo(() => ScaleModule.get(keyTonic, keyType), [keyTonic, keyType]);
  const keyboardKeyToChordMap = useMemo(
    // TODO: extract to music.tsx
    () => {
      const map = octaves.map(octave =>
          [...scale.keyChords.triads]//, ...scale.keyChords.chords]
            .map(chordName => ({ chordName, octave }))
        )
        .flat()
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
              notes: chord.notes.map(n =>`${n}${octave}`).map(NoteModule.simplify),
            }
          }
        }, {});

      return map;
    },
    [scale], 
  );

  useEffect(() => {
    pressedChordSymbolKeysRef.current = pressedChordSymbolKeys;
  }, [pressedChordSymbolKeys])
  

  const onPianoKeyPressed_ = (chord: ChordType) => {
    setPressedChordSymbolKeys([...pressedChordSymbolKeys, chord.symbol]);
    
    if (modeConfig.mode === CHORDS_PIANO_MODE_ARPEGGIO) {
      arpeggioAnimation({
        chord,
        tempo: modeConfig.tempo,
        onKeyPressed,
        onKeyReleased,
        pressedChordSymbolKeysRef,
      });
    } else if (modeConfig.mode  === CHORDS_PIANO_MODE_ALL_NOTES) {
      onKeyPressed(chord.notes);
    }
  };


  const onPianoKeyReleased_ = (chord: ChordType) => {
    setPressedChordSymbolKeys(pressedChordSymbolKeys.filter(s => s !== chord.symbol));
    onKeyReleased(chord.notes);
  }

  const onPianoKeyPressedRef = useRef(onPianoKeyPressed_);
  const onPianoKeyReleasedRef = useRef(onPianoKeyReleased_);
  useEffect(() => {
    onPianoKeyPressedRef.current = onPianoKeyPressed_;
    onPianoKeyReleasedRef.current = onPianoKeyReleased_;
  }, [pressedChordSymbolKeys, modeConfig, scale])

  
  useEffect(() => {
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [keyboardKeyToChordMap]);

  return (
    <Grid container spacing={2}>
      {/* iterating over KEYBOARD_KEYS to preserve the order */}
      {KEYBOARD_KEYS.map((key, idx) => {
        if (Object.keys(keyboardKeyToChordMap).indexOf(key) < 0) {
          return null;
        }
        const chord = keyboardKeyToChordMap[key];
        return (
          <ChordPianoKey
            key={`${keyTonic}${keyType}${idx}`}
            isPressed={pressedChordSymbolKeys.indexOf(chord.symbol) > -1}
            chord={chord}
            keyboardKey={key}
            onMouseDown={() => onPianoKeyPressed_(chord)}
            onMouseUp={() => onPianoKeyReleased_(chord)}
          />
        )
      })}
    </Grid>
  )
}