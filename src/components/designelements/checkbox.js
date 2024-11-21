import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function Checkboxx({label}) {
  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox defaultChecked />} label={label} />
      
    </FormGroup>
  );
}
