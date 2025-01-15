import React from 'react';
import Snackbar from '@mui/joy/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/joy/IconButton';

const CustomSnackbar = ({ open, onClose, message, color = 'neutral', duration = 4000 }) => {
  // Icon based on the color prop
  const getIcon = () => {
    switch (color) {
      case 'success':
        return <CheckCircleIcon />;
      case 'danger':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      color={color}
      variant="soft"
      startDecorator={getIcon()}
      sx={{ maxWidth: 500 }}
    >
      {message}
      <IconButton
        variant="soft"
        color={color}
        size="sm"
        onClick={onClose}
        sx={{ marginLeft: 'auto' }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </Snackbar>
  );
};

export default CustomSnackbar;
