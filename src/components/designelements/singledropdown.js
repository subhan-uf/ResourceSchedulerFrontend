import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Singledropdown({ name, label, menuItems = [], value, onChange, required }) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small" required={required}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        value={value || ''} // Ensure value is controlled
        onChange={(event) => {
          const selectedValue = event.target.value;
          onChange(selectedValue); // Pass only the selected value
        }}
        label={label}
      >
        {/* Default empty option */}
        <MenuItem value="">
          <em>None</em>
        </MenuItem>

        {/* Dynamically render menu items */}
        {menuItems.map((item, index) => (
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
