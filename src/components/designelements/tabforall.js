import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import ListIcon from '@mui/icons-material/List';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import PropTypes from 'prop-types';
import ClassIcon from '@mui/icons-material/Class';
export default function TabsTeachers({
  tabLabels = [],
  tabContent = [],
  externalIndex = null,
  onIndexChange = null,
}) {
  const [localIndex, setLocalIndex] = React.useState(0);
  const currentIndex = externalIndex !== null ? externalIndex : localIndex;
  const colors = ['primary', 'success', 'warning', 'neutral'];

  const handleTabChange = (event, value) => {
    onIndexChange?.(value) ?? setLocalIndex(value);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        mt: 4,
        borderRadius: '16px',
        boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        transition: '0.3s all',
        maxWidth: 1300,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)'
        },
        '&:hover': {
          boxShadow: '0px 32px 64px rgba(0, 0, 0, 0.12)',
        },
      }}
      style={{ '--colors-index': colors[currentIndex] }}
    >
      <Tabs
        size="lg"
        aria-label="Teacher Navigation Tabs"
        value={currentIndex}
        onChange={handleTabChange}
        sx={(theme) => ({
          mx: 'auto',
          borderRadius: '12px',
          overflow: 'visible',
          transition: '0.3s all',
          
          [`& .${tabClasses.root}`]: {
            py: 1.5,
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: '0.2s all',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-1px)'
            },
            '& svg': {
              transition: '0.2s all',
              color: 'text.secondary'
            }
          },
          
          [`& .${tabClasses.selected}`]: {
            color: `${colors[currentIndex]}.600`,
            '& svg': {
              color: `${colors[currentIndex]}.600`
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 2,
              background: theme.palette[colors[currentIndex]].main
            }
          },
        })}
      >
        <TabList
          variant="plain"
          size="md"
          disableUnderline
          sx={{
            borderRadius: '8px',
            p: 0.5,
            bgcolor: 'background.default',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          {tabLabels.length > 0 ? (
            tabLabels.map((label, i) => (
              <Tab
                key={i}
                disableIndicator
                orientation="vertical"
                color={colors[i % colors.length]}
                sx={{
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
<ListItemDecorator sx={{ mr: 1.5 }}>
  {i === 0 
    ? <ListIcon /> 
    : i === 1 
      ? <KeyboardIcon /> 
      : <ClassIcon />}
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
          mt: 4,
          p: 3,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          transition: '0.3s all',
          minHeight: 120,
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.08)'
          }
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