import * as React from 'react';
import MuiModal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

type Props =
  Pick<Parameters<typeof MuiModal>[0], 'onClose' | 'open'> &
  Pick<Parameters<typeof Box>[0], 'children'>;

function Modal({
  open,
  onClose,
  children
}: Props) {

  return (
    <MuiModal
      open={open}
      onClose={onClose}
    >
      <Box sx={style}>
        {children}
      </Box>
    </MuiModal>
  );
}

export default Modal;