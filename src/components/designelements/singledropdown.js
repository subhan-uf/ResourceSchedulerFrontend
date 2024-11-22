import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem'; // Use MenuItem for non-native Select

export default function Singledropdown({ name, label, menuItems = [], value, onChange = () => {}, required }) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small" required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        name={name}
        label={label}
        onChange={(event) => {
          onChange(event); // Send only the value back to the parent
        }}
      >
        {/* Default empty value */}
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {/* Render menu items */}
        {menuItems.map((item, index) => (
          <MenuItem key={index} value={item.label || item}>
            {item.label || item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
