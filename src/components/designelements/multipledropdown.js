import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};



// function getStyles(name, personName, theme) {
//   return {
//     fontWeight: personName.includes(name)
//       ? theme.typography.fontWeightMedium
//       : theme.typography.fontWeightRegular,
//   };
// }

export default function Dropdown({ heading = 'Selected Items', menuItems = [], required, value = [], onChange }) {
  const theme = useTheme();

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300, borderRadius: '100px' }} required={required}>
        <InputLabel id="dropdown-label">{heading}</InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          multiple
          value={value}
          onChange={(event) => {
            const selectedValues = event.target.value.map((item) => item.value || item); // Ensure selected value is mapped correctly
            onChange(selectedValues);
          }}
          input={
            <OutlinedInput
              id="select-multiple-chip"
              label={heading}
              sx={{ borderRadius: '13px' }}
            />
          }
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((item, index) => (
                <Chip key={index} label={menuItems.find((mi) => mi.value === item)?.label || item} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
              style={{
                fontWeight: value.includes(item.value)
                  ? theme.typography.fontWeightMedium
                  : theme.typography.fontWeightRegular,
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
