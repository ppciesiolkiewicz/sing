import MuiContainer from "@mui/material/Container";
import Box from "@mui/material/Box";


function Container({
  children
}: Pick<Parameters<typeof MuiContainer>[0], 'children'>) {
  return (
    <MuiContainer
      maxWidth={'xl'}
      component={'main'}
      sx={{
        width: '100vw',
        minHeight: 'calc(100vh - 68.5px)', // AppBar.height
        display: 'flex',
      }}
    >
      {children}
    </MuiContainer>
  );
}

export default Container;