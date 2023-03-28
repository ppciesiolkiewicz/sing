import * as React from 'react';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabsProps {
  options: {
    children: JSX.Element;
    title: string;
  }[];
}

export default function Tabs({
  options
}: TabsProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <MuiTabs value={value} onChange={handleChange}>
          {options.map((o, i) => (
            <Tab key={i} label={o.title} />
          ))}
        </MuiTabs>
      </Box>
      {options.map((o, idx) => value === idx ? o.children : null)}
    </Box>
  );
}