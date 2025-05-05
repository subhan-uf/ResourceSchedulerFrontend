import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import Logout from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Fade } from '@mui/material';

function ResponsiveAppBar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = React.useState(localStorage.getItem('accessToken'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isDEO = user?.role === "DEO";
  React.useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('accessToken'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getPageName = () => {
    if (location.pathname === '/') {
      return "Login";
    }
    // Extract the first segment of the path (ignoring the leading slash)
    const path = location.pathname.split('/')[1];
    
    // Define a mapping for each page
    const pageNames = {
      teacher: "Teacher Management",
      room: "Room Management",
      course: "Course Management",
      batch: "Batch Management",
      preference: "Preferences & Constraints",
      compensatory: "Compensatory Classes",
      user: "User Management",
      report: "Reports",
      generation: "Timetable Generation",
      availability: "Availability",
      dashboard: "Dashboard"
    };
  
    // Return the mapped value or a default value if not found
    return pageNames[path] || "Dashboard";
  };
  

  const handleAvatarClick = e => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    window.dispatchEvent(new Event('storage'));
    onLogout();
    navigate('/');
    handleClose();
  };
  const goToDashboard = () => { navigate('/dashboard'); handleClose(); };

  return (
    <Fade in timeout={600}>
      <AppBar
        position="static"
        sx={{
          bgcolor: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)'
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {location.pathname !== '/dashboard' && location.pathname !== '/' && (
                <Tooltip title="Go to Dashboard">
                  <IconButton
                    onClick={goToDashboard}
                    sx={{
                      mr: 2,
                      color: 'primary.main',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: 'rgba(33,150,243,0.08)' }
                    }}
                  >
                    <HomeIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Typography
                variant="h6"
                component="a"
                href="/dashboard"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  color: 'primary.dark',
                  textDecoration: 'none',
                  '&:hover': { opacity: 0.85 }
                }}
              >
                University Scheduler
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 500,
                color: 'text.secondary'
              }}
            >
              {getPageName()}
            </Typography>

            {token && (
              <Box>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleAvatarClick}
                    size="small"
                    sx={{
                      ml: 2,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(33,150,243,0.2)' }}>
                      {localStorage.getItem('username')?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)'
                  }
                }
              }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
{isDEO && (
  <MenuItem
    onClick={() => {
      navigate('/disciplines');
      handleClose();
    }}
  >
    Manage Disciplines
  </MenuItem>
)}
  <Divider />
              <MenuItem onClick={goToDashboard}>
                <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </Fade>
  );
}

export default ResponsiveAppBar;
