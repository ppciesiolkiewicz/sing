import MuiContainer from "@mui/material/Container";


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
        paddingTop: '10px',
      }}
    >
      {children}
    </MuiContainer>
  );
}

export default Container;