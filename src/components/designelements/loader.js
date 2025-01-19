import * as React from 'react';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import { useCountUp } from 'use-count-up';

export default function CircularProgressCountUp() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [buttonLabel, setButtonLabel] = React.useState('Start');

  const { value: value1, reset: resetValue1 } = useCountUp({
    isCounting: isLoading,
    duration: 1,
    start: 0,
    end: 25,
    onComplete: () => {
      setIsLoading(false);
      setButtonLabel('Reset');
    },
  });

  const { value: value2, reset } = useCountUp({
    isCounting: true,
    duration: 1,
    start: 0,
    end: 75,
  });

  const handleButtonClick = () => {
    if (isLoading) {
      setIsLoading(false);
      setButtonLabel('Start');
      resetValue1();
    } else if (buttonLabel === 'Reset') {
      setButtonLabel('Start');
      resetValue1();
    } else {
      setIsLoading(true);
      setButtonLabel('Reset');
    }
  };

  return (
    <Stack
      direction="column" // Change to column for vertical alignment
      spacing={2} // Adjust spacing as needed
      sx={{
        alignItems: 'center', // Horizontal center
        justifyContent: 'center', // Vertical center
        height: '100vh', // Full viewport height
        width: '100%', // Full width
      }}
    >
      <CircularProgress size="lg" determinate value={value2}>
        <Typography>{value2}%</Typography>
      </CircularProgress>
      <Button onClick={handleButtonClick} variant="solid">
        {buttonLabel}
      </Button>
    </Stack>
  );
}
