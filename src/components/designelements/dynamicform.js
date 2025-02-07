import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  initialSections
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
    if (onPreferencesChange) onPreferencesChange(updated);
  };

  const handleRemoveSection = (id) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    if (onPreferencesChange) onPreferencesChange(updated);
  };

  const handleFieldChange = (sectionId, fieldName, value) => {
    const updated = sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, values: { ...s.values, [fieldName]: value } };
      }
      return s;
    });
    setSections(updated);
    if (onPreferencesChange) onPreferencesChange(updated);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 4, p: 2, bgcolor: "white", color: "black", borderRadius: 2, boxShadow: 4 }}>
      {sections.map((section) => (
        <Box
          key={section.id}
          sx={{ mb: 3, p: 3, border: "1px solid #ccc", borderRadius: 2, bgcolor: "white", boxShadow: 2, position: "relative" }}
        >
          <Typography variant="h6" align="center" gutterBottom sx={{ color: "black" }}>
            {getSectionTitle(section.id)}
          </Typography>

          {fields.map((field, idx) => {
            const {
              componentType,
              label,
              name,
              type,
              options,
              getOptionLabel
            } = field;
            const value = section.values[name] || "";

            switch (componentType) {
              case "TextField":
                return (
                  <TextField
                    key={idx}
                    label={label}
                    variant="outlined"
                    type={type}
                    fullWidth
                    value={value}
                    onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                );

              case "SingleDropdown":
                return (
                  <FormControl key={idx} fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                      value={value}
                      label={label}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {options.map((opt, i) => {
                        let displayLabel = String(opt);
                        if (typeof getOptionLabel === "function") {
                          displayLabel = getOptionLabel(opt);
                        }
                        return (
                          <MenuItem key={i} value={opt}>
                            {displayLabel}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                );

              case "Checkbox":
                return (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Checkbox
                      label={label}
                      checked={!!value}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.checked)}
                      sx={{ marginRight: 1 }}
                    />
                    {/* <Typography>{label}</Typography> */}
                  </Box>
                );

              case "RadioGroup":
                // We'll assume `options` is an array like [{ label: "Lab", value: "lab" }, {label: "Theory", value: "theory"}]
                return (
                  <FormControl key={idx} component="fieldset" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {label}
                    </Typography>
                    <RadioGroup
                      row
                      value={value}
                      onChange={(e) => handleFieldChange(section.id, name, e.target.value)}
                    >
                      {options.map((opt, oIndex) => (
                        <Box key={oIndex} sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                          <Radio
                            value={opt.value}
                            checked={value === opt.value}
                          />
                          <Typography>{opt.label}</Typography>
                        </Box>
                      ))}
                    </RadioGroup>
                  </FormControl>
                );

              default:
                return null;
            }
          })}

          <IconButton
            onClick={() => handleRemoveSection(section.id)}
            sx={{ position: "absolute", top: 10, right: 10, color: "#888" }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      ))}

      <Button variant="contained" fullWidth onClick={handleAddSection} sx={{ mt: 2 }}>
        + {addButtonText}
      </Button>
    </Box>
  );
}

export default DynamicForm;
