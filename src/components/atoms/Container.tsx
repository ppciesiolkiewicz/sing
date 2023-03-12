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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {children}
    </MuiContainer>
  );
}

export default Container;