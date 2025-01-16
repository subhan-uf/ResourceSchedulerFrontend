import React, { useEffect, useState } from "react";
import TabsTeachers from "./designelements/tabforall"; // Your custom tab component
import Tables from "./designelements/tables";
import TextField from "@mui/material/TextField";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import DynamicForm from "./designelements/dynamicform";
import BatchService from "./api/batchService";
import SectionService from "./api/sectionService";
import AlertDialogModal from "./designelements/modal";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CustomAlert from "./designelements/alert";
import CustomSnackbar from "./designelements/alert";
function Batch() {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarColor, setSnackbarColor] = useState('neutral'); // success, danger, info

      
  // -----------------------------
  // States
  // -----------------------------
  const [batchData, setBatchData] = useState({
    Batch_name: "",
    Year: "",
  });
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);

  // For controlling the tab index in TabsTeachers
  const [currentTab, setCurrentTab] = useState(0);

  // For the delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [batchIdToDelete, setBatchIdToDelete] = useState(null);

  // -----------------------------
  // Fetch Batches & Sections
  // -----------------------------
  useEffect(() => {
    fetchAllBatches();
    fetchAllSections();
  }, []);

  const fetchAllBatches = async () => {
    try {
      const response = await BatchService.getAllBatches();
      setBatches(response.data); // e.g. [{id:1, Batch_ID:101, ...}, ...]
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchAllSections = async () => {
    try {
      const response = await SectionService.getAllSections();
      setAllSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  // -----------------------------
  // Build Table Rows
  // -----------------------------
  const tableHeadings = ["Batch name", "Year", "Sections", "Max students per section", "Actions"];
  const tableRows = batches.map((batch) => {
    // This is the actual primary key. If your backend returns "id",
    // use `batch.id`. If it returns "Batch_ID" as the real PK,
    // you might do "batch.Batch_ID". If both exist, prefer `batch.id`.
    const pk = batch.id ?? batch.Batch_ID;

    // find all sections for this batch
    const relatedSections = allSections.filter((sec) => sec.Batch_ID === pk);
    const numSections = relatedSections.length;

    // find the max of Max_students
    let maxStudents = 0;
    relatedSections.forEach((sec) => {
      if (sec.Max_students > maxStudents) {
        maxStudents = sec.Max_students;
      }
    });

    return [
      batch.Batch_name,
      batch.Year,
      numSections,
      maxStudents,
      pk, // last element is the batch ID
    ];
  });

  // -----------------------------
  // Edit
  // -----------------------------
  const handleEdit = async (rowData) => {
    // rowData is [Batch_name, Year, numSections, maxStudents, pk]
    const batchId = rowData[rowData.length - 1];
    if (!batchId) {
      console.error("No valid batchId found for editing.");
      setSnackbarMessage('No valid batchID found for editing.');
      setSnackbarColor('danger');
      setSnackbarOpen(true);
      return;
    }

    try {
      // 1) Fetch batch by ID
      const resp = await BatchService.getBatchById(batchId);
      const foundBatch = resp.data; // e.g. { id:1, Batch_name:'...', Year:'...', ...}

      // 2) Pre-fill batchData
      setBatchData({
        Batch_name: foundBatch.Batch_name,
        Year: foundBatch.Year,
      });

      // 3) Retrieve sections for that batch
      //    If your server doesn't support "get all sections" + filter,
      //    do "getSectionById" or "getSectionsByBatchID" logic as needed.
      const sectionsResp = await SectionService.getAllSections();
      const batchSections = sectionsResp.data.filter(
        (sec) => sec.Batch_ID === batchId
      );
      
      // 4) Convert them for DynamicForm
      const dynamicFormSections = batchSections.map((sec) => ({
        id: sec.Section_ID, // Use actual Section_ID
        
        values: {
          Section_name: sec.Section_name || "", // Pre-fill Section_name
          Max_students: sec.Max_students || "", // Pre-fill Max_students
          Max_gaps: sec.Max_gaps || "", // Pre-fill Max_gaps
        },
      }));
      
      console.log("Dynamic Form Sections:", dynamicFormSections); // Log the sections being passed
      setSections(dynamicFormSections);
      

      setSections(dynamicFormSections);

      // 5) Switch to tab "Enter new batch" and set editing mode
      setIsEditing(true);
      setEditingBatchId(batchId);
      setCurrentTab(1); // Switch to second tab
    } catch (error) {
      console.error("Error fetching batch/sections for edit:", error);
      setSnackbarMessage('Error fetching batch/sections for edit.');
      setSnackbarColor('danger');
      setSnackbarOpen(true);
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDeleteClick = (rowData) => {
    const batchId = rowData[rowData.length - 1];
    setBatchIdToDelete(batchId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!batchIdToDelete) return;

    try {
      // Actually delete
      await BatchService.deleteBatch(batchIdToDelete);
      // Refresh
      fetchAllBatches();
      fetchAllSections();
      setSnackbarMessage('Batch deleted successfully!');
      setSnackbarColor('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting batch:", error);
      setSnackbarMessage('Failed to delete the batch.');
      setSnackbarColor('danger');
      setSnackbarOpen(true);
    } finally {
      setDeleteModalOpen(false);
      setBatchIdToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setBatchIdToDelete(null);
  };

  // -----------------------------
  // Create or Update
  // -----------------------------
  const handleSubmit = async () => {
    try {
      if (isEditing && editingBatchId) {
        // Update
        await BatchService.updateBatch(editingBatchId, batchData);

        // Delete old sections
        const oldSecs = allSections.filter((sec) => sec.Batch_ID === editingBatchId);
        for (const sec of oldSecs) {
          await SectionService.deleteSection(sec.Section_ID);
        }

        // Create new sections
        for (const sec of sections) {
          const sectionData = {
            ...sec.values,
            Batch_ID: editingBatchId,
          };
          await SectionService.createSection(sectionData);
        }

        setSnackbarMessage('Batch and section successfully updated.');
      setSnackbarColor('success');
      setSnackbarOpen(true);
      } else {
        // Create
        const batchResp = await BatchService.createBatch(batchData);
        const newBatchId = batchResp.data.id ?? batchResp.data.Batch_ID;

        for (const sec of sections) {
          const sectionData = {
            ...sec.values,
            Batch_ID: newBatchId,
          };
          await SectionService.createSection(sectionData);
        }

        setSnackbarMessage('Batch and section successfully created.');
      setSnackbarColor('success');
      setSnackbarOpen(true);
      }
      // Refresh
      fetchAllBatches();
      fetchAllSections();

      // Reset
      setBatchData({ Batch_name: "", Year: "" });
      setSections([]);
      setIsEditing(false);
      setEditingBatchId(null);
      setCurrentTab(0); // go back to list tab
    } catch (error) {
      console.error("Error creating/updating batch or sections:", error);

      setSnackbarMessage('An error occurred while saving the batch or sections.');
      setSnackbarColor('danger');
      setSnackbarOpen(true);
    }
  };

  // -----------------------------
  // DynamicForm fields
  // -----------------------------
  const fields = [
    { componentType: "TextField", label: "Section Name", name: "Section_name", type: "text" },
    { componentType: "TextField", label: "Max Students", name: "Max_students", type: "number" },
    { componentType: "TextField", label: "Max Class Gaps per Day", name: "Max_gaps", type: "number" },
  ];

  const getSectionTitle = (id) => `Section ${String.fromCharCode(64 + id)}`;

  // -----------------------------
  // Tabs
  // -----------------------------
  const tabLabels = ["View list of batches", "Enter new batch"];

  // 1st tab content = table
  const tableContent = (
    <Tables
      tableHeadings={tableHeadings}
      tableRows={tableRows}
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
    />
  );

  // 2nd tab content = form
  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
          maxWidth: 1000,
          margin: "0 auto",
          padding: 4,
          borderRadius: 2,
          boxShadow: 4,
          backgroundColor: "#f5f5f5",
        }}
      >
        <TextField
          label="Batch name"
          variant="outlined"
          type="text"
          fullWidth
          required
          value={batchData.Batch_name}
          onChange={(e) => setBatchData({ ...batchData, Batch_name: e.target.value })}
        />
        <FormControl fullWidth required>
  <Singledropdown
    label="Year"
    menuItems={[
      { label: "2021", value: "2021" },
      { label: "2022", value: "2022" },
      { label: "2023", value: "2023" },
      { label: "2024", value: "2024" },
      { label: "2025", value: "2025" },
    ]}
    value={batchData.Year} // Controlled value
    onChange={(selectedValue) =>
      setBatchData({ ...batchData, Year: selectedValue }) // Update state with selected value
    }
  />
</FormControl>
{/* <FormControl fullWidth required>
          <Singledropdown
            label="Year"
            menuItems={[
              { label: "2021", value: "2021" },
              { label: "2022", value: "2022" },
              { label: "2023", value: "2023" },
              { label: "2024", value: "2024" },
              { label: "2025", value: "2025" },
            ]}
            value={batchData.Year}
            onChange={(e) => setBatchData({ ...batchData, Year: e.target.value })}
          />
        </FormControl> */}
        <FormControl fullWidth required>
        <DynamicForm
  fields={fields}
  sectionTitle="Section"
  getSectionTitle={getSectionTitle}
  addButtonText="Add new Section"
  onPreferencesChange={(updatedSections) => setSections(updatedSections)}
  initialSections={sections} // Pass the sections state here
/>
        </FormControl>
        <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            {isEditing ? "Update Batch" : "Submit"}
          </Button>
        </Box>
      </Box>
    </form>
  );

  return (
    <div>
        <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />

      <TabsTeachers
        tabLabels={tabLabels}
        tabContent={[tableContent, formContent]}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />

      {/* Delete confirmation modal */}
      <AlertDialogModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this batch?"
      />
    </div>
  );
}

export default Batch;
