import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function Singledropdown({ name, label, menuItems = [], value, onChange, required, disabled = false }) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small" required={required} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        disabled={disabled}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        {menuItems.map((item, i) => (
          <MenuItem key={i} value={item.value}>{item.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
