import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

export default function Buttonn({content}) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      
      <Button endDecorator={<KeyboardArrowRight />} color="success">
        {content}
      </Button>
    </Box>
  );
}
