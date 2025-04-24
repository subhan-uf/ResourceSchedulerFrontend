import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import CustomSnackbar from "./designelements/alert";
import AlertDialogModal from "./designelements/modal";
import disciplineService from "./api/disciplineService";

// Lab day option definitions.
// In the UI, "option1" will be saved as 1 in the db; "option2" as 2.
const labDayOptions = [
  {
    label:
      "Monday & Wednesday Lab days for 2nd and 4th year and Tuesday and Thursday Lab days for 1st and 3rd Year",
    value: "option1",
  },
  {
    label:
      "Tuesday and Thursday Lab days for 2nd and 4th Year and Monday and Wednesday Lab days for 1st and 3rd Year",
    value: "option2",
  },
];

function DisciplineAndLabSettingsPage() {
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");

  // -----------------------------
  // DISCIPLINES STATE (Local)
  // -----------------------------
  // Each discipline object has:
  // - Name (string)
  // - LabDayConfig (string: "option1" or "option2")
  // - Optionally, Discipline_ID (if already saved to backend)
  const [disciplines, setDisciplines] = useState([]);
  const [disciplineInput, setDisciplineInput] = useState("");

  // -----------------------------
  // LAB DAY CONFIGURATION STATE (Separate Section)
  // -----------------------------
  // Default to "option1" (sends 1 by default)
  const [labDaySetting, setLabDaySetting] = useState("option1");

  // -----------------------------
  // EDITING STATE for disciplines
  // -----------------------------
  // const [isEditing, setIsEditing] = useState(false);
  // // In our design the PK is the discipline Name (for editing)
  // const [editingDisciplineId, setEditingDisciplineId] = useState(null);

  // -----------------------------
  // Delete confirmation state
  // -----------------------------
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [disciplineIdToDelete, setDisciplineIdToDelete] = useState(null);

  // -----------------------------
  // FETCH DISCIPLINES ON MOUNT
  // -----------------------------
  useEffect(() => {
    fetchAllDisciplines();
  }, []);

  const fetchAllDisciplines = async () => {
    try {
      const resp = await disciplineService.getAllDisciplines();
      // Map the Lab_day_selection (integer) to our option string.
      const mapped = resp.data.map((d) => ({
        ...d,
        LabDayConfig:
          d.Lab_day_selection === 1
            ? "option1"
            : d.Lab_day_selection === 2
            ? "option2"
            : "",
      }));
      setDisciplines(mapped);
    } catch (error) {
      console.error("Error fetching disciplines:", error);
      showSnackbar("Failed to fetch disciplines.", "danger");
    }
  };
  const DEFAULT_DISCIPLINES = [
    "Computer Science",
    "Gaming and Animation",
    "Cyber Security",
    "Artificial Intelligence",
    "Data Science"
  ];
  // -----------------------------
  // SNACKBAR HELPER
  // -----------------------------
  const showSnackbar = (message, color) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  // -----------------------------
  // HANDLERS FOR DISCIPLINES
  // -----------------------------

  // Add a new discipline and immediately create it in the DB.
  const handleAddDisciplineLocal = async () => {
    const trimmed = disciplineInput.trim();
    if (!trimmed) {
      showSnackbar("Please enter a discipline name.", "danger");
      return;
    }
    // Check for duplicates in local state (case-insensitive)
    if (
      disciplines.some(
        (d) => d.Name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      showSnackbar("Discipline already exists.", "danger");
      return;
    }
    // Build the payload.
    const payload = {
      Name: trimmed,
      Lab_day_selection: labDaySetting === "option2" ? 2 : 1,
    };
    try {
      const resp = await disciplineService.createDiscipline(payload);
      // Map the returned value to our local format.
      const newDiscipline = {
        ...resp.data,
        LabDayConfig:
          resp.data.Lab_day_selection === 1
            ? "option1"
            : resp.data.Lab_day_selection === 2
            ? "option2"
            : "",
      };
      setDisciplines([...disciplines, newDiscipline]);
      setDisciplineInput("");
      showSnackbar("Discipline added to database.", "success");
    } catch (error) {
      console.error("Error adding discipline:", error);
      showSnackbar("Failed to add discipline.", "danger");
    }
  };

  // When clicking on a discipline chip, enable editing.
  // const handleEditDiscipline = (disc) => {
  //   setDisciplineInput(disc.Name);
  //   setLabDaySetting(disc.LabDayConfig || "option1");
  //   setIsEditing(true);
  //   setEditingDisciplineId(disc.Name); // Using Name as the PK
  // };

  // // Update discipline in local state and update immediately in DB.
  // const handleUpdateDisciplineLocal = async () => {
  //   if (!disciplineInput.trim()) {
  //     showSnackbar("Discipline name cannot be empty.", "danger");
  //     return;
  //   }
  //   const payload = {
  //     Name: disciplineInput.trim(),
  //     Lab_day_selection: labDaySetting === "option2" ? 2 : 1,
  //   };
  //   try {
  //     const resp = await disciplineService.updateDiscipline(editingDisciplineId, payload);
  //     const updated = {
  //       ...resp.data,
  //       LabDayConfig:
  //         resp.data.Lab_day_selection === 1
  //           ? "option1"
  //           : resp.data.Lab_day_selection === 2
  //           ? "option2"
  //           : "",
  //     };
  //     const updatedList = disciplines.map((disc) =>
  //       disc.Name === editingDisciplineId ? updated : disc
  //     );
  //     setDisciplines(updatedList);
  //     setIsEditing(false);
  //     setEditingDisciplineId(null);
  //     setDisciplineInput("");
  //     showSnackbar("Discipline updated in database.", "success");
  //   } catch (error) {
  //     console.error("Error updating discipline:", error);
  //     showSnackbar("Failed to update discipline.", "danger");
  //   }
  // };

  // Delete discipline immediately from the DB when X is clicked.
  const handleDeleteDisciplineImmediately = async (id) => {
    try {
      await disciplineService.deleteDiscipline(id);
      setDisciplines(disciplines.filter((d) => d.Name !== id));
      showSnackbar("Discipline deleted from database.", "success");
    } catch (error) {
      console.error("Error deleting discipline:", error);
      showSnackbar("Failed to delete discipline.", "danger");
    }
  };

  // (Optional) In case you want to use a confirmation modal for deletion:
    const handleDeleteClick = (id) => {
        if (DEFAULT_DISCIPLINES.includes(id)) {
          showSnackbar("Default disciplines cannot be deleted.", "danger");
          return;
        }
        setDisciplineIdToDelete(id);
        setDeleteModalOpen(true);
      };

  const handleDeleteConfirm = async () => {
    if (!disciplineIdToDelete) return;
    await handleDeleteDisciplineImmediately(disciplineIdToDelete);
    setDeleteModalOpen(false);
    setDisciplineIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDisciplineIdToDelete(null);
  };

  // -----------------------------
  // HANDLERS FOR LAB DAY CONFIGURATION (Separate Section)
  // -----------------------------
  const handleSaveLabDaySetting = async () => {
    if (!labDaySetting) {
      showSnackbar("Please select a lab day configuration.", "danger");
      return;
    }
    // This is assumed to be a global setting; here we'll simply show a success message.
    showSnackbar("Lab day configuration saved.", "success");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", my: 4, px: 2 }}>
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Discipline Settings
      </Typography>

      {/* Disciplines Section */}
      <Box sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Manage Disciplines
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Discipline Name"
            variant="outlined"
            fullWidth
            value={disciplineInput}
            onChange={(e) => setDisciplineInput(e.target.value)}
          />
          {/* {isEditing ? (
            <Button variant="contained" onClick={handleUpdateDisciplineLocal}>
              Update
            </Button>
          ) : ( */}
            <Button variant="contained" onClick={handleAddDisciplineLocal}>
              Add
            </Button>
          {/* )} */}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {disciplines.map((disc) => (
            <Chip
              key={disc.Name}
              label={disc.Name}
              onDelete={() => handleDeleteClick(disc.Name)}    // <-- open confirmation instead
              // onClick={() => handleEditDiscipline(disc)}
              color="primary"
            />
          ))}
        </Box>
      </Box>

      {/* Lab Day Configuration Section */}

      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        color={snackbarColor}
        onClose={() => setSnackbarOpen(false)}
      />

      {deleteModalOpen && (
     <AlertDialogModal
             open={deleteModalOpen}
             onClose={handleDeleteCancel}
             onConfirm={handleDeleteConfirm}
             message={
               <Box>
                 <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
                   WARNING!
                 </Typography>
                 <Typography variant="body1" fontWeight="bold">
                   Deleting a discipline is <u>permanent</u>. It is <u>NOT</u> recommended to delete this discipline as it can destroy batches created using this discipline, all assignments, all preferences, all compensatory classes, all reports, all timetable generations related to this discipline. <u>IF</u> you are deleting to edit the name of the discipline, it is still <u>STRONGLY</u> not recommended
                 </Typography>
               </Box>
             }
           />
      )}
    </Box>
  );
}

export default DisciplineAndLabSettingsPage;
