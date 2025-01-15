import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Checkbox from '@mui/joy/Checkbox';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Dropdown from './multipledropdown';

function DynamicForm({ onPreferencesChange, fields, sectionTitle, getSectionTitle, addButtonText, initialSections }) {
  const [sections, setSections] = useState(() => initialSections || [{ id: 1, values: {} }]);
  useEffect(() => {
    if (initialSections) {
      setSections(initialSections);
    }
  }, [initialSections]);
  // Handler to add a new section
  const handleAddSection = () => {
    const updatedSections = [
      ...sections,
      { id: sections.length + 1, values: {} },
    ];
    setSections(updatedSections);
    if (onPreferencesChange) onPreferencesChange(updatedSections); // Notify parent if function exists
  };

  // Handler to remove a section
  const handleRemoveSection = (id) => {
    const updatedSections = sections.filter((section) => section.id !== id);
    setSections(updatedSections);
    if (onPreferencesChange) onPreferencesChange(updatedSections); // Notify parent if function exists
  };

  // Handler to update section details
  const handleFieldChange = (sectionId, fieldName, value) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, values: { ...section.values, [fieldName]: value } }
        : section
    );
    setSections(updatedSections);

    // Notify parent if function exists
    if (onPreferencesChange) onPreferencesChange(updatedSections);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 4, p: 2, bgcolor: 'white', color: 'black', borderRadius: 2, boxShadow: 4 }}>
      {sections.map((section) => (
        <Box
          key={section.id}
          sx={{
            mb: 3,
            p: 3,
            border: '1px solid #ccc',
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: 2,
            position: 'relative',
          }}
        >
          <Typography variant="h6" align="center" gutterBottom sx={{ color: 'black' }}>
            {getSectionTitle(section.id)}
          </Typography>

          {fields.map((field) => {
            const { componentType, label, name, type, options } = field;
            const value = section.values[name] || '';

            // Conditionally render different components based on `componentType`
            switch (componentType) {
              case 'TextField':
                return (
                  <TextField
                    key={name}
                    label={label}
                    variant="outlined"
                    type={type}
                    fullWidth
                    value={value}
                    onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                    sx={{
                      mb: 2,
                      bgcolor: '#f9f9f9',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#ccc',
                        },
                        '&:hover fieldset': {
                          borderColor: '#aaa',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1aa3a3',
                        },
                      },
                    }}
                    required
                  />
                );

              case 'SingleDropdown':
                return (
                  <FormControl key={name} fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                      value={value}
                      label={label}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                      required
                    >
                      {options.map((option, index) => (
                        <MenuItem key={index} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );

              case 'MultipleDropdown':
                return (
                  <Dropdown
                    key={name}
                    label={label}
                    options={options}
                    value={value}
                    onChange={(e, newValue) => handleFieldChange(section.id, name, newValue)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                );

              case 'Checkbox':
                return (
                  <Box key={name} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Checkbox
                      label={label}
                      checked={!!value}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.checked)}
                      sx={{
                        '--Checkbox-size': '28px', // Size of the checkbox
                        color: '#1aa3a3', // Custom color
                        '&.Mui-checked': {
                          color: '#159191',
                        },
                      }}
                    />
                  </Box>
                );

              case 'RadioGroup':
                return (
                  <RadioGroup
                    key={name}
                    value={value}
                    onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                    sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}
                    required
                  >
                    {options.map((option) => (
                      <Radio
                        key={option}
                        value={option}
                        label={option}
                        sx={{
                          color: '#1aa3a3',
                          '&.Mui-checked': {
                            color: '#159191',
                          },
                        }}
                        required
                      />
                    ))}
                  </RadioGroup>
                );

              default:
                return null;
            }
          })}

          <IconButton
            onClick={() => handleRemoveSection(section.id)}
            sx={{ position: 'absolute', top: 10, right: 10, color: '#888' }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="contained"
        fullWidth
        onClick={handleAddSection}
        sx={{ mt: 2, bgcolor: '#1aa3a3', '&:hover': { bgcolor: '#159191' } }}
      >
        + {addButtonText}
      </Button>
    </Box>
  );
}

export default DynamicForm;
