import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useLocation } from 'react-router-dom';

function ResponsiveAppBar({ onLogout }) {
  const location = useLocation();
  const [token, setToken] = React.useState(localStorage.getItem('accessToken'));
  console.log('Token in State:', token);
console.log('LocalStorage Token:', localStorage.getItem('accessToken'));

  // Sync token state with localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('accessToken');
      setToken(newToken);
    };

    // Listen for localStorage changes (token changes)
    window.addEventListener('storage', handleStorageChange);
    
    // Ensure token is in sync on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Update token state
    setToken(null);

    // Trigger re-render across tabs
    window.dispatchEvent(new Event('storage'));

    onLogout();
    window.location.href = '/';
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#387478' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            University Scheduler
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Show avatar only if the token exists */}
          <Box sx={{ flexGrow: 0 }}>
            {location.pathname !== '/' && token && (
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ p: 0 }}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
