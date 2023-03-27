import { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { NOTE_TO_KEY_MAP } from './constants';


const StyledPianoKey = styled('div')(({ theme, isPressed }) => ({
  backgroundColor: !isPressed ? 'white' : 'lightblue',
  p: 4,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  boxShadow: theme.shadows[1],
}))

const StyledFlatPianoKey = styled('div')(({ theme, isPressed, width }) => ({
  backgroundColor: !isPressed ? 'black' : 'lightblue',
  p: 4,
  height: '80%',
  width,
  flexDirection: 'column',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  transform: 'translate(-50%)',
  boxShadow: theme.shadows[1],
}))

const noteIsFlat = (noteName: string) => {
  return noteName.length > 2;
}

interface PianoKeyProps {
  noteName: string;
  isPressed: boolean;
  onKeyPressed: (noteName: string) => void;
  onKeyReleased: (noteName: string) => void;
  totalPianoKeysCount: number;
}

function PianoKey({ noteName, isPressed, onKeyPressed, onKeyReleased, totalPianoKeysCount }: PianoKeyProps) {
  const boxRef = useRef(null);
  if (noteIsFlat(noteName)) {
    return (
      <Box sx={{ position: 'relative', width: 0 }} ref={boxRef}>
        <StyledFlatPianoKey
          width={`${window.innerWidth/totalPianoKeysCount/1.5}px`}
          isPressed={isPressed}
          role={'button'}
          onMouseDown={() => onKeyPressed(noteName)}
          onMouseUp={() => onKeyReleased(noteName)}
        >
        <Typography variant={'overline'} color={'white'} gutterBottom>
          ({NOTE_TO_KEY_MAP[noteName]})
        </Typography>
          <Typography variant={'overline'} color={'white'}>
            {noteName}
          </Typography>
        </StyledFlatPianoKey>
      </Box>
    );
  }

  return (
    <StyledPianoKey
      isPressed={isPressed}
      role={'button'}
      onMouseDown={() => onKeyPressed(noteName)}
      onMouseUp={() => onKeyReleased(noteName)}
    >
      <Typography variant={'overline'} gutterBottom>
        ({NOTE_TO_KEY_MAP[noteName]})
      </Typography>
      <Typography variant={'overline'}>
        {noteName}
      </Typography>
    </StyledPianoKey>
  );
}

export default PianoKey;