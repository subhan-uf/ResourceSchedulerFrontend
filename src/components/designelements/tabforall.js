import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import PropTypes from 'prop-types';
import ListIcon from '@mui/icons-material/List';
import KeyboardIcon from '@mui/icons-material/Keyboard';
export default function TabsTeachers({ tabLabels = [], tabContent = [] }) {
  const [index, setIndex] = React.useState(0);
  const colors = ['primary', 'danger', 'success', 'warning'];

  return (
    <Box
      sx={{
        flexGrow: 1,
        m: -3,
        p: 4,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        bgcolor: `${'var(--colors-index)'}.500`,
      }}
      style={{ '--colors-index': colors[index] }}
    >
      <Tabs
        size="lg"
        aria-label="Bottom Navigation"
        value={index}
        onChange={(event, value) => setIndex(value)}
        sx={(theme) => ({
          p: 1,
          borderRadius: 16,
          maxWidth: 400,
          mx: 'auto',
          boxShadow: theme.shadow.s,
          '--joy-shadowChannel': theme.vars.palette[colors[index]].darkChannel,
          [`& .${tabClasses.root}`]: {
            py: 1,
            flex: 1,
            transition: '0.3s',
            fontWeight: 'md',
            fontSize: 'md',
            [`&:not(.${tabClasses.selected}):not(:hover)`]: {
              opacity: 0.7,
            },
          },
        })}
      >
        <TabList
          variant="plain"
          size="sm"
          disableUnderline
          sx={{ borderRadius: 'lg', p: 0 }}
        >
          {tabLabels.length > 0 ? (
            tabLabels.map((label, i) => (
              <Tab
                key={i}
                disableIndicator
                orientation="vertical"
                {...(index === i && { color: colors[i % colors.length] })}
              >
                <ListItemDecorator>
                  {i === 0 ? <ListIcon/> : <KeyboardIcon />}
                </ListItemDecorator>
                {label}
              </Tab>
            ))
          ) : (
            <Tab disabled>No Tabs Available</Tab> // Show a fallback message if no labels
          )}
        </TabList>
      </Tabs>
      <Box
        sx={{
          mt: 3, // Margin top for spacing
          p: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {tabContent[index]} {/* Display content based on active tab */}
      </Box>
    



    </Box>

    
  );
}

TabsTeachers.propTypes = {
  tabLabels: PropTypes.arrayOf(PropTypes.string),
  tabContent: PropTypes.arrayOf(PropTypes.node),
};

// Define defaultProps to provide default values if props are not passed
TabsTeachers.defaultProps = {
  tabLabels: [], // Default to an empty array
  tabContent: [], // Default to an empty array
};
