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

export default function Dropdown({heading='Selected Items', menuItems=[], required, value, onChange}) {
  const theme = useTheme();
  // const [selectedItems, setSelectedItems] = React.useState([]);

  // const handleChange = (event) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setSelectedItems(
  //     // On autofill we get a stringified value.
  //     typeof value === 'string' ? value.split(',') : value,
  //   );
  // };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300, borderRadius:'100px' }} required={required}>
        <InputLabel id="demo-multiple-chip-label">{heading}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={value}
          onChange={onChange}
          input={<OutlinedInput id="select-multiple-chip" label={heading}  sx={{
            borderRadius: '13px', // Set custom border radius here
          }}/>}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {(Array.isArray(menuItems) ? menuItems : []).map((item) => ( // Check if menuItems is an array
            <MenuItem
              key={item}
              value={item}
              style={{
                fontWeight: value.includes(item) // Update to selectedItems
                  ? theme.typography.fontWeightMedium
                  : theme.typography.fontWeightRegular,
              }}
            >
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
