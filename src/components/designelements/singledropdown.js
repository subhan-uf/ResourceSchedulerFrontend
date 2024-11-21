import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function Singledropdown({ label, menuItems = [], required }) { // Default empty array
  const [value, setValue] = React.useState(''); // State to store selected value

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small" required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
        native
      >
        <option aria-label="None" value="" />
        {menuItems.map((item, index) => (
          <option key={index} value={item.label || item}>
            {item.label || item} {/* Support either { label: '...' } or '...' */}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
