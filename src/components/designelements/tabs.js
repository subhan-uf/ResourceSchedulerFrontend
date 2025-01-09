import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function allyProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ tabNames, children, onChange }) {
  const [value, setValue] = React.useState(0);  // Tracks the active tab index

  const handleChange = (event, newValue) => {
    setValue(newValue);  // Update local state to reflect the active tab
    if (onChange) {
      onChange(event, newValue);  // Pass the change to parent component
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}  // Correctly handles tab switch
          aria-label="basic tabs example"
          variant="fullWidth"
          centered
        >
          {tabNames.map((name, index) => (
            <Tab key={index} label={name} {...allyProps(index)} />
          ))}
        </Tabs>
      </Box>

      {/* Render children conditionally based on the active tab */}
      {React.Children.map(children, (child, index) => (
        <CustomTabPanel value={value} index={index}>
          {child}
        </CustomTabPanel>
      ))}
    </Box>
  );
}

BasicTabs.propTypes = {
  tabNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,  // Allow parent component to handle tab change
};
