import { enqueueSnackbar as notistackEnqueueSnackbar } from 'notistack';
import type { VariantType } from 'notistack'
import { Typography } from '@mui/material';

interface Props {
  message: string;
  variant: VariantType;
}

export function enqueueSnackbar(props: Props) {
  notistackEnqueueSnackbar({
    ...props,
    message: (
      <Typography variant={'body1'}>
        {props.message || 'Something went wrong and the '}
      </Typography>
    ),
  })
}