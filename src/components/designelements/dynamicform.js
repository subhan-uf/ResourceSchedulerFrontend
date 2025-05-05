import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Fade,
  Zoom 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import Checkbox from "@mui/joy/Checkbox";
import Radio from "@mui/joy/Radio";
import RadioGroup from "@mui/joy/RadioGroup";
import Dropdown from "./multipledropdown";

function DynamicForm({
  onPreferencesChange,
  fields,
  sectionTitle,
  getSectionTitle,
  addButtonText,
  initialSections,
  hideAddButton=false,
}) {
  const [sections, setSections] = useState(initialSections || [{ id: 1, values: {} }]);

  useEffect(() => {
    if (initialSections) {
      setSections(initialSections);
    }
  }, [initialSections]);

  const handleAddSection = () => {
    const newSec = { id: sections.length + 1, values: {} };
    const updated = [...sections, newSec];
    setSections(updated);
    onPreferencesChange?.(updated);
  };

  const handleRemoveSection = (id) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    onPreferencesChange?.(updated);
  };

  const handleFieldChange = (sectionId, fieldName, value) => {
    const updated = sections.map((s) => 
      s.id === sectionId ? { ...s, values: { ...s.values, [fieldName]: value } } : s
    );
    setSections(updated);
    onPreferencesChange?.(updated);
  };

  return (
    <Box sx={{
      maxWidth: 680,
      mx: "auto",
      my: 6,
      p: 4,
      bgcolor: "background.paper",
      borderRadius: 4,
      boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.08)',
      border: '1px solid',
      borderColor: 'divider',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)'
      }
    }}>
      <Typography variant="h5" component="div" sx={{ 
        mb: 4, 
        fontWeight: 600,
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        {sectionTitle}
      </Typography>

      {sections.map((section) => (
        <Fade in key={section.id}>
          <Box sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            bgcolor: 'background.default',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.08)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <IconButton
                onClick={() => handleRemoveSection(section.id)}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" sx={{ 
              mb: 3, 
              fontWeight: 500,
              color: 'text.secondary',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 0.8
            }}>
              {getSectionTitle(section.id)}
            </Typography>

            {fields.map((field, idx) => {
              const { componentType, label, name, type, options, getOptionLabel } = field;
              const value = section.values[name] || "";

              switch (componentType) {
                case "TextField":
                  return (
                    <TextField
                      key={idx}
                      label={label}
                      variant="filled"
                      type={type}
                      fullWidth
                      value={value}
                      required={field.required || false}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          },
                          '&.Mui-focused': {
                            bgcolor: 'background.paper',
                            boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}`
                          }
                        }
                      }}
                    />
                  );

                case "SingleDropdown":
                  return (
                    <FormControl key={idx} fullWidth sx={{ mb: 2 }}>
                      <InputLabel 
                      shrink 
                      sx={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                        transform: 'translate(12px, -6px) scale(0.75)'
                      }}>
                        {label}
                      </InputLabel>
                      <Select
                        value={value}
                        label={label}
                        required={field.required || false}
                        onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                        variant="filled"
                        sx={{
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          '& .MuiSelect-filled': {
                            padding: '16px 12px 8px 12px'
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select {label}</em>
                        </MenuItem>
                        {options.map((opt, i) => (
                          <MenuItem key={i} value={opt} sx={{ py: 1.5 }}>
                            <Typography variant="body2">
                              {typeof getOptionLabel === "function" ? getOptionLabel(opt) : String(opt)}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );

                case "Checkbox":
                  return (
                    <Box key={idx} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      bgcolor: 'background.paper',
                      p: 1.5,
                      borderRadius: 2
                    }}>
                      <Checkbox
                        checked={!!value}
                        onChange={(e) => handleFieldChange(section.id, name, e.target.checked)}
                        sx={{ mr: 1.5 }}
                        color="primary"
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {label}
                      </Typography>
                    </Box>
                  );

                case "RadioGroup":
                  return (
                    <FormControl key={idx} component="fieldset" sx={{ mb: 2 }} required={field.required || false}>
                      <Typography variant="caption" sx={{ 
                        mb: 1.5,
                        display: 'block',
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        {label}
                      </Typography>
                      <RadioGroup
                        value={value}
                        onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                        sx={{ gap: 1.5 }}
                      >
                        {options.map((opt, oIndex) => (
                          <Box key={oIndex} sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            bgcolor: 'background.paper',
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: value === opt.value ? 'primary.main' : 'divider',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.light'
                            }
                          }}>
                            <Radio
                              value={opt.value}
                              checked={value === opt.value}
                              color="primary"
                            />
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                              {opt.label}
                            </Typography>
                          </Box>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  );

                default:
                  return null;
              }
            })}
          </Box>
        </Fade>
      ))}
 {!hideAddButton && (
      <Zoom in>
     
        <Button 
          variant="contained" 
          onClick={handleAddSection}
          startIcon={<AddCircleOutlineRoundedIcon />}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 2,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s',
            boxShadow: '0px 8px 16px rgba(33, 150, 243, 0.2)'
          }}
        >
          {addButtonText}
        </Button>
     
      </Zoom>
       )}
    </Box>
  );
}

export default DynamicForm;