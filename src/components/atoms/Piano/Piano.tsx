import { useState, useMemo, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { NoteModule } from '@/lib/music';
import { KEY_TO_NOTE_MAP } from './constants';
import PianoKey from './PianoKey';

interface Props {
  lowestNoteName: string;
  highestNoteName: string;
  onKeyPressed: (noteName: string) => void;
  onKeyReleased: (noteName: string) => void;
}

export default function Piano(props: Props) {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const {
    lowestNoteName,
    highestNoteName,
    onKeyPressed,
    onKeyReleased,
  } = props;
  
  const notes = useMemo(
    () => {
      const notes = NoteModule.getAllNotes(lowestNoteName, highestNoteName);
      return notes;
    },
    [lowestNoteName, highestNoteName]
  );

  // TODO: filter keys based on lowest/highest
  const keyToNoteMap = useMemo(
    () => KEY_TO_NOTE_MAP,
    [lowestNoteName, highestNoteName]
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
    // TODO: do it without refs
    onPianoKeyPressedRef.current = onPianoKeyPressed_;
    onPianoKeyReleasedRef.current = onPianoKeyReleased_;
  }, [pressedKeys])

  const handleKeyDown = (ev) => {
    if (ev.repeat) {
      return;
    }
    const noteName = keyToNoteMap[ev.key.toLowerCase()];
    if(!noteName) return;
    onPianoKeyPressedRef.current(noteName);
  }

  const handleKeyUp = (ev) => {
    const noteName = keyToNoteMap[ev.key.toLowerCase()];
    if(!noteName) return;
    onPianoKeyReleasedRef.current(noteName);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }, [])
  
  return (
    <Box
      width={'100%'} height={'100%'} display={'flex'} flexDirection={'row'} justifyContent={'center'}
      sx={{
        userSelect: 'none',
      }}
    >
      {notes.map(note => (
        <PianoKey
          isPressed={pressedKeys.indexOf(note.name) > -1}
          key={note.name}
          noteName={note.name}
          totalPianoKeysCount={notes.length}
          onKeyPressed={onPianoKeyPressedRef.current}
          onKeyReleased={onPianoKeyReleasedRef.current}
        />
      ))}
    </Box>
  );
}