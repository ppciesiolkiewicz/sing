import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

function Loader({ m }: { m?: number }) {
  return (
    <Box m={m} display={'flex'} justifyContent={'center'} alignItems={'center'} width={'100%'} height={'100%'}>
      <CircularProgress />
    </Box>
  );
}

export default Loader;