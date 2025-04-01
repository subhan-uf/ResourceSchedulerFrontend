import React, { useEffect, useState } from "react";
import TabsTeachers from "./designelements/tabforall"; // Your custom tab component
import Tables from "./designelements/tables";
import TextField from "@mui/material/TextField";
import { Box, Button, FormControl, Typography } from "@mui/material";
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
    Discipline:"",
    Batch_name: "",
    Year: "",
  });
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
  const filteredBatches = batches.filter(batch =>
    Object.values({
      Discipline: batch.Discipline,
      Batch_name: batch.Batch_name,
      Year: batch.Year
    })
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  // -----------------------------
  // Build Table Rows
  // -----------------------------
  const tableHeadings = ["Discipline","Batch name", "Year", "Sections", "Max students per section", "Actions"];
  const tableRows = filteredBatches.map((batch) => {
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
      batch.Discipline,
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
  const handleStopEditing = () => {
    setIsEditing(false);
    setBatchData({ Discipline: "", Batch_name: "", Year: "" });
    setSections([]);
    setCurrentTab(0);
    setEditingBatchId(null);
  };
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
        Discipline: foundBatch.Discipline,
        Batch_name: foundBatch.Batch_name,
        Year: foundBatch.Year,
      });

      // 3) Retrieve sections for that batch
      //    If your server doesn't support "get all sections" + filter,
      //    do "getSectionById" or "getSectionsByBatchID" logic as needed.
      const sectionsResp = await SectionService.getAllSections();
    const batchSections = sectionsResp.data
      .filter((sec) => sec.Batch_ID === batchId)
      .sort((a, b) => a.Section_ID - b.Section_ID);
      
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
        // 1) Update the batch itself.
        await BatchService.updateBatch(editingBatchId, batchData);
      
        // 2) Get the current (old) sections from the API for this batch.
        const oldSecs = allSections.filter((sec) => sec.Batch_ID === editingBatchId);
        // We'll use the list of IDs of old sections for deletion later.
        const oldSectionIds = oldSecs.map((sec) => sec.Section_ID);
      
        // 3) Process each section from the form.
        //    If the section has an 'id' and it matches an old section, update it.
        //    Otherwise, create a new section.
        const currentSectionIds = []; // to store ids of sections that should remain
        for (const sec of sections) {
          const sectionData = {
            ...sec.values,
            Batch_ID: editingBatchId,
          };
      
          if (sec.id && oldSectionIds.includes(sec.id)) {
            // Section exists in the database; update it.
            await SectionService.updateSection(sec.id, sectionData);
            currentSectionIds.push(sec.id);
          } else {
            // New section: create it.
            const createResp = await SectionService.createSection(sectionData);
            // Assume the created section returns its new ID as 'Section_ID'
            const newId = createResp.data.Section_ID || createResp.data.id;
            if (newId) {
              currentSectionIds.push(newId);
            }
          }
        }
      
        // 4) Delete any old sections that were removed from the form.
        for (const sec of oldSecs) {
          if (!currentSectionIds.includes(sec.Section_ID)) {
            await SectionService.deleteSection(sec.Section_ID);
          }
        }
      
        setSnackbarMessage('Batch and sections successfully updated.');
        setSnackbarColor('success');
        setSnackbarOpen(true);
      }
      
      
       else {
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
    
      // If it’s a duplicate‑name validation error from DRF…
      if (
        error.response?.status === 400 &&
        error.response.data?.Batch_name
      ) {
        setSnackbarMessage(error.response.data.Batch_name[0]);
      } else {
        setSnackbarMessage('An error occurred while saving the batch or sections.');
      }
    
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
  
  const getSectionTitle = (index) => ``;
  

  // -----------------------------
  // Tabs
  // -----------------------------
  const tabLabels = isEditing 
  ? ["View list of batches", "Editing Batch"] 
  : ["View list of batches", "Enter new batch"];
  // 1st tab content = table
  const tableContent = (
    <>
    <Box sx={{ mb: 2, maxWidth: 200 }}>
      <TextField
        label="Search batches..."
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </Box>
    <Tables
      tableHeadings={tableHeadings}
      tableRows={tableRows}
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
    />
    </>
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
          // boxShadow: 4,
          backgroundColor: "transparent",
        }}
      >
        <FormControl fullWidth required>
  <Singledropdown
    label="Discipline"
    menuItems={[
      { label: "Computer Science", value: "Computer Science" },
      { label: "Artificial intelligence", value: "Artificial Intelligence" },
      { label: "Cyber Security", value: "Cyber Security" },
      { label: "Gaming and Animation", value: "Gaming and Animation" },
      { label: "Data Science", value: "Data Science" },
    ]}
    value={batchData.Discipline} // Controlled value
    onChange={(selectedValue) => {
      setBatchData({ Discipline: selectedValue, Year: "", Batch_name: "" });
      setSections([]); // also clear sections if you want
    }}
  />
</FormControl>

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
    onChange={(selectedValue) => {
      const discipline = batchData.Discipline;
      let prefix = "Batch";
      if (discipline === "Computer Science") prefix = "BSCS";
      else if (discipline === "Artificial Intelligence") prefix = "BSAI";
      else if (discipline === "Cyber Security") prefix = "BSCR";
      else if (discipline === "Data Science") prefix = "BSDT";
      else if (discipline === "Gaming and Animation") prefix = "BSGA";
      setBatchData({
        Discipline: discipline,
        Year: selectedValue,
        Batch_name: `${prefix} Batch ${selectedValue}`,
      });
    }}
  />
</FormControl>
        <TextField
          label="Batch name"
          variant="outlined"
          type="text"
          fullWidth
          required
          value={batchData.Batch_name}
          InputProps={{
            readOnly: true, // Make it non-editable
          }}
          onChange={(e) => setBatchData({ ...batchData, Batch_name: e.target.value })}
        />
        
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
  getSectionTitle={(index) => getSectionTitle(index)} 
  addButtonText="Add new Section"
  onPreferencesChange={(updatedSections) => {
    // Automatically assign names
    const updatedSectionsWithNames = updatedSections.map((section, index) => ({
      ...section,
      values: {
        ...section.values,
        Section_name: `Section ${String.fromCharCode(65 + index)}`, // Automatically set Section name as A, B, C...
      },
    }));
    setSections(updatedSectionsWithNames);
  }}
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

<Box sx={{ position: 'relative' }}>
      <TabsTeachers
        tabLabels={tabLabels}
        tabContent={[tableContent, formContent]}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />
      
      {/* Add Stop Editing button */}
      {isEditing && (
        <Button
          variant="contained"
          
          onClick={handleStopEditing}
          sx={{
            position: 'fixed',
            top: 120,
            right: 200,
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: 2,
            px: 3,
            py: 1,
                  backdropFilter: 'blur(4px)'
          }}
        >
          Stop Editing
        </Button>
      )}
    </Box>


      {/* Delete confirmation modal */}

<AlertDialogModal
  open={deleteModalOpen}
  onClose={handleDeleteCancel}
  onConfirm={handleDeleteConfirm}
  message={
    <Box>
      <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
        WARNING!
      </Typography>
      <Typography variant="body1" fontWeight="bold" gutterBottom>
        Are you sure you want to delete this batch? All of the following related records will be <span style={{ textDecoration: 'underline' }}>PERMANENTLY deleted</span>:
      </Typography>
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {[
          "Sections related to this Batch",
          "Courses related to this Batch",
          "Teachers related to this Batch",
          "Preferences related to this Batch",
          "Compensatory Classes related to this Batch",
          "Timetable Generations related to this Batch",
          "Reports of this Batch"
        ].map(item => (
          <Typography component="li" key={item} >
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  }
/>

    </div>
  );
}

export default Batch;
