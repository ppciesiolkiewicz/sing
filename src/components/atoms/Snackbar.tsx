import { enqueueSnackbar as notistackEnqueueSnackbar } from 'notistack';
import { Typography } from '@mui/material';

type Props = Parameters<typeof notistackEnqueueSnackbar>;

export function enqueueSnackbar(props: Props) {
  notistackEnqueueSnackbar({
    ...props,
    message: <Typography variant={'body1'}>
      {props.message || 'Something went wrong and the '}
    </Typography>
  })
}