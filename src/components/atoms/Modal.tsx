import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}


type Props =
  Pick<Parameters<typeof BootstrapDialogTitle>[0], 'onClose'> &
  Pick<Parameters<typeof Dialog>[0], 'open' | 'maxWidth' | 'fullWidth'> & {
    children: JSX.Element;
    title: string;
    slots?: {
      actions: JSX.Element;
    };
  };

export default function CustomizedDialogs({
  onClose,
  open,
  title,
  slots,
  children,
  fullWidth,
  maxWidth,
}: Props) {
return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="dialog-title"
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
    >
      <BootstrapDialogTitle id="dialog-title" onClose={onClose}>
        {title}
      </BootstrapDialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      {slots?.actions && (
        <DialogActions>
          {slots.actions}
        </DialogActions>
      )}
    </BootstrapDialog>
  );
}