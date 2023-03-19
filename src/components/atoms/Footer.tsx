import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';


const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 4,
}))


export default function Footer() {
  return (
    <StyledFooter>
      <Typography variant={'overline'}>
        Sing5&copy; 2023
      </Typography>
    </StyledFooter>
  );
}