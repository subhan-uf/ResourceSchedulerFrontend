import * as React from 'react';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Person from '@mui/icons-material/Person';
import People from '@mui/icons-material/People';
import Apartment from '@mui/icons-material/Apartment';

export default function RadioButton({ label, options, icons }) {
  /* 
  - `label`: The aria-label for the RadioGroup, describing the purpose of the group.
  - `options`: An array of strings to display as radio button labels.
  - `icons`: An array of icon components to display alongside each radio button.
  */

  return (
    <RadioGroup aria-label={label} name="custom-radio-group" defaultValue={options[0]}>
      <List
        sx={{
          minWidth: 240,
          '--List-gap': '0.5rem',
          '--ListItem-paddingY': '1rem',
          '--ListItem-radius': '8px',
          '--ListItemDecorator-size': '32px',
        }}
      >
        {/* Map through options array to create each radio button dynamically */}
        {options.map((option, index) => (
          <ListItem variant="outlined" key={option} sx={{ boxShadow: 'sm' }}>
            {/* Display corresponding icon from icons array for each option */}
            <ListItemDecorator>
              {icons[index]}
            </ListItemDecorator>
            <Radio
              overlay
              value={option}
              label={option}
              sx={{ flexGrow: 1, flexDirection: 'row-reverse' }}
              slotProps={{
                action: ({ checked }) => ({
                  sx: (theme) => ({
                    ...(checked && {
                      inset: -1,
                      border: '2px solid',
                      borderColor: theme.vars.palette.primary[500],
                    }),
                  }),
                }),
              }}
            />
          </ListItem>
        ))}
      </List>
    </RadioGroup>
  );
}
