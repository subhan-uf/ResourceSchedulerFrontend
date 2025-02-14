import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import ListIcon from '@mui/icons-material/List';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import PropTypes from 'prop-types';

export default function TabsTeachers({
  tabLabels = [],
  tabContent = [],
  externalIndex = null,       // new optional prop
  onIndexChange = null,       // new optional prop
}) {
  // local state for index if parent not controlling
  const [localIndex, setLocalIndex] = React.useState(0);

  // figure out which index to use
  const currentIndex = externalIndex !== null ? externalIndex : localIndex;

  const colors = ['primary', 'danger', 'success', 'warning'];

  const handleTabChange = (event, value) => {
    if (onIndexChange) {
      onIndexChange(value);
    } else {
      setLocalIndex(value);
    }
  };

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
      style={{ '--colors-index': colors[currentIndex] }}
    >
      <Tabs
        size="lg"
        aria-label="Bottom Navigation"
        value={currentIndex}
        onChange={handleTabChange}
        sx={(theme) => ({
          p: 1,
          borderRadius: 16,
          maxWidth: 400,
          mx: 'auto',
          boxShadow: theme.shadow.s,
          '--joy-shadowChannel': theme.vars.palette[colors[currentIndex]].darkChannel,
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
                {...(currentIndex === i && { color: colors[i % colors.length] })}
              >
                <ListItemDecorator>
                  {i === 0 ? <ListIcon /> : <KeyboardIcon />}
                </ListItemDecorator>
                {label}
              </Tab>
            ))
          ) : (
            <Tab disabled>No Tabs Available</Tab>
          )}
        </TabList>
      </Tabs>
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {typeof tabContent[currentIndex] === 'function'
          ? tabContent[currentIndex]()
          : tabContent[currentIndex]}
      </Box>
    </Box>
  );
}

TabsTeachers.propTypes = {
  tabLabels: PropTypes.arrayOf(PropTypes.string),
  tabContent: PropTypes.arrayOf(PropTypes.node),
  externalIndex: PropTypes.number,
  onIndexChange: PropTypes.func,
};

TabsTeachers.defaultProps = {
  tabLabels: [],
  tabContent: [],
  externalIndex: null,
  onIndexChange: null,
};
