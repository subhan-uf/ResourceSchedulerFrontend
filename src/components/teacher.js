import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from "@mui/material/TextField";
import { Box, Button, FormControl, Typography } from "@mui/material";
import BasicBreadcrumbs from "./designelements/breadcrumbs";
import Singledropdown from "./designelements/singledropdown";
import Dropdown from "./designelements/multipledropdown"; // multi-select
import AlertDialogModal from "./designelements/modal";
import CustomSnackbar from "./designelements/alert";

// Services
import teacherService from "./api/teacherService";
import teacherCourseAssignmentService from "./api/teacherCourseAssignmentService";
import batchCourseTeacherAssignmentService from "./api/batchCourseTeacherAssignmentService";
import courseService from "./api/courseService";
import batchService from "./api/batchService";
import sectionService from "./api/sectionService";

function Teacher() {
  // ------------------------------------
  // SNACKBAR / ALERT STATES
  // ------------------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral"); // e.g. 'success' or 'danger'

  const showSnackbar = (message, color) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  // ------------------------------------
  // TEACHERS TABLE
  // ------------------------------------
  const [teachers, setTeachers] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  // For Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherIdToDelete, setTeacherIdToDelete] = useState(null);

  // BREADCRUMBS
  const breadcrumbsList = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "view list of teachers", url: "" },
  ];
  const breadcrumbsNew = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Add new teacher", url: "" },
  ];

  // ------------------------------------
  // TEACHER FORM DATA
  // (Teacher_ID is PK)
  // ------------------------------------
  const [formData, setFormData] = useState({
    Teacher_ID: "",
    Name: "",
    NIC: "",
    Email: "",
    Phone: "",
    Max_classes: "",
    Health_limitation: "",
    Seniority: "",
    Teacher_type: "", // e.g. "Permanent" or something
  });

  // **Multiple** batches for this teacher
  const [selectedBatches, setSelectedBatches] = useState([]); // array of batch IDs
  // Add state for selected sections and filtered sections
const [selectedSections, setSelectedSections] = useState([]); // array of section IDs
const [filteredSections, setFilteredSections] = useState([]);
const [sections, setSections] = useState([]); // all sections from the API

  // We'll load **all** courses from the server, but we'll only show the subset
  // that belongs to the selected batches. We'll store them in filteredCourses,
  // then separate them into lab vs. theory if your model has e.g. "Is_Lab" boolean.
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [labCourses, setLabCourses] = useState([]);
  const [theoryCourses, setTheoryCourses] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]); // Array of selected disciplines
  const [filteredBatches, setFilteredBatches] = useState([]);

  // user can pick multiple lab courses, multiple theory courses
  const [selectedLabCourses, setSelectedLabCourses] = useState([]);
  const [selectedTheoryCourses, setSelectedTheoryCourses] = useState([]);

  const [batches, setBatches] = useState([]); // all batches from DB

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);

  // ------------------------------------
  // LOAD TEACHERS, BATCHES, COURSES
  // ------------------------------------
  // useEffect(() => {
  //   setSelectedSections((prevSelected) =>
  //     prevSelected.filter((sectionId) =>
  //       filteredSections.some((s) => s.value === sectionId)
  //     )
  //   );
  // }, [filteredSections]);
  // useEffect(() => {
  //   // When the batches change (due to discipline change), then clear sections.
  //   setSelectedSections([]);
  // }, [selectedBatches]);
  
  
  // useEffect(() => {
  //   setSelectedBatches([]);
  //   setSelectedSections([]);
  // }, [selectedDisciplines]);
  // Filter selected batches when filteredBatches changes
useEffect(() => {
  setSelectedBatches(prev => 
    prev.filter(batchId => 
      filteredBatches.some(b => b.value === batchId)
  ));
}, [filteredBatches]);

// Filter selected sections when filteredSections changes
useEffect(() => {
  setSelectedSections(prev => 
    prev.filter(sectionId => 
      filteredSections.some(s => s.value === sectionId)
  ));
}, [filteredSections]);

// Filter selected courses when lab/theory courses change
useEffect(() => {
  const validLab = selectedLabCourses.filter(cid => 
    labCourses.some(c => c.Course_ID === cid)
  );
  setSelectedLabCourses(validLab);

  const validTheory = selectedTheoryCourses.filter(cid => 
    theoryCourses.some(c => c.Course_ID === cid)
  );
  setSelectedTheoryCourses(validTheory);
}, [labCourses, theoryCourses]);
  
  
  useEffect(() => {
    async function fetchSections() {
      try {
        const resp = await sectionService.getAllSections();
        setSections(resp.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    }
    fetchSections();
  }, []);
  
  useEffect(() => {
    if (!isEditing) {
      setSelectedBatches([]);
      setSelectedSections([]);
      setSelectedLabCourses([]);
      setSelectedTheoryCourses([]);
      setSelectedDisciplines([]); // Also reset disciplines if needed
    }
  }, [isEditing]);
  
  

  useEffect(() => {
    fetchTeachers();
    fetchAllBatches();
    fetchAllCourses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const resp = await teacherService.getAllTeachers();
      setTeachers(resp.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showSnackbar("Failed to fetch teachers.", "danger");
    }
  };

  const fetchAllBatches = async () => {
    try {
      const resp = await batchService.getAllBatches();
      setBatches(resp.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const resp = await courseService.getAllCourses();
      setAllCourses(resp.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showSnackbar("Failed to fetch courses.", "danger");
    }
  };

  // ------------------------------------
  // Whenever selectedBatches changes,
  // filter courses that belong to those batches,
  // then separate them into lab vs. theory
  // ------------------------------------
useEffect(() => {
  const filtered = selectedDisciplines.length
    ? batches.filter((b) => selectedDisciplines.includes(b.Discipline))
    : [];
  const formatted = filtered.map((b) => ({
    label: `${b.Batch_name}`,
    value: b.Batch_ID,
  }));
  setFilteredBatches(formatted);
}, [selectedDisciplines, batches]);

useEffect(() => {
  const matchingSections = sections.filter((section) =>
    selectedBatches.includes(section.Batch_ID)
  );
  const formattedSections = matchingSections.map((section) => {
    const batch = batches.find((b) => b.Batch_ID === section.Batch_ID);
    return batch ? { 
      label: `${batch.Batch_name}-${section.Section_name}`,
      value: section.Section_ID,
    } : null;
  }).filter(Boolean);
  setFilteredSections(formattedSections);
}, [selectedBatches, sections, batches]);
  
  
  


  useEffect(() => {
    const filtered = allCourses.filter((course) =>
      selectedBatches.includes(course.Batch_ID) // course belongs to one of the selected Batch_IDs
    );
    setFilteredCourses(filtered);
    setLabCourses(filtered.filter((c) => c.Is_Lab === true));
    setTheoryCourses(filtered.filter((c) => c.Is_Lab === false|| c.Is_Lab==true));
  }, [selectedBatches, allCourses]);

  // ------------------------------------
  // TABLE HEADINGS & ROWS
  // ------------------------------------
  const tableHeadings = [
    "Teacher ID",
    "Name",
    "NIC",
    "Email",
    "Phone",
    "Seniority",
    "Actions",
  ];

  const tableRows = teachers.map((tch) => {
    const pk = tch.Teacher_ID;
    return [
      tch.Teacher_ID,
      tch.Name,
      tch.NIC,
      tch.Email,
      tch.Phone,
      tch.Seniority,
      pk, // last item for Edit/Delete
    ];
  });

  // ------------------------------------
  // EDIT
  //  1) fetch teacher
  //  2) fetch TCA => separate lab vs. theory
  //  3) fetch BCTA => gather all batch IDs
  // ------------------------------------
  const handleEdit = async (rowData) => {
    const teacherId = rowData[rowData.length - 1];
    if (!teacherId) {
      showSnackbar("No valid teacher ID for editing.", "danger");
      return;
    }
    try {
      // 1) fetch teacher
      const respTeacher = await teacherService.getTeacherById(teacherId);
      const foundTeacher = respTeacher.data;

      // 2) fetch all TCA
      const tcaResp = await teacherCourseAssignmentService.getAllAssignments();
      const teacherTCAs = tcaResp.data.filter(
        (a) => a.Teacher_ID === parseInt(teacherId, 10)
      );
      const labIds = [];
      const theoryIds = [];
      teacherTCAs.forEach((a) => {
        if (a.Teacher_type.toLowerCase() === "lab") {
          labIds.push(a.Course_ID);
        } else {
          theoryIds.push(a.Course_ID);
        }
      });

      // 3) fetch all BCTA => gather batch IDs
      const bctaResp = await batchCourseTeacherAssignmentService.getAllAssignments();
      const teacherBCTAs = bctaResp.data.filter(
        (a) => a.Teacher_ID === parseInt(teacherId, 10)
      );
      // from those, gather the distinct batch IDs
      const uniqueBatchIDs = [
        ...new Set(teacherBCTAs.map((a) => a.Batch_ID)),
      ];
      const uniqueSectionIDs = [
        ...new Set(teacherBCTAs.map((a) => a.Section)),
      ];
      const disciplinesFromBatches = [...new Set(
        uniqueBatchIDs.map((batchId) => {
          const batch = batches.find((b) => b.Batch_ID === batchId);
          return batch?.Discipline;
        })
      )].filter((discipline) => discipline); 
      // fill the form data
      setFormData({
        Teacher_ID: foundTeacher.Teacher_ID?.toString() || "",
        Name: foundTeacher.Name || "",
        NIC: foundTeacher.NIC || "",
        Email: foundTeacher.Email || "",
        Phone: foundTeacher.Phone || "",
        Max_classes: foundTeacher.Max_classes?.toString() || "",
        Health_limitation: foundTeacher.Health_limitation || "",
        Seniority: foundTeacher.Seniority || "",
        Teacher_type: foundTeacher.Teacher_type || "",
        Disciplines: disciplinesFromBatches||"",
      });
      setSelectedDisciplines(disciplinesFromBatches);
      setSelectedBatches(uniqueBatchIDs); // e.g. [1,2]
      setSelectedSections(uniqueSectionIDs);
      setSelectedLabCourses(labIds);       // e.g. [5,6]
      setSelectedTheoryCourses(theoryIds); // e.g. [3]
      

      setIsEditing(true);
      setEditingTeacherId(teacherId);
      setCurrentTab(1);
    } catch (error) {
      console.error("Error fetching teacher for edit:", error);
      showSnackbar("Failed to fetch teacher data.", "danger");
    }
  };

  // ------------------------------------
  // DELETE
  // ------------------------------------
  const handleDeleteClick = (rowData) => {
    const teacherId = rowData[rowData.length - 1];
    setTeacherIdToDelete(teacherId);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!teacherIdToDelete) return;
    try {
      await teacherService.deleteTeacher(teacherIdToDelete);
      showSnackbar("Teacher deleted successfully!", "success");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      showSnackbar("Failed to delete teacher.", "danger");
    } finally {
      setDeleteModalOpen(false);
      setTeacherIdToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTeacherIdToDelete(null);
  };

  // ------------------------------------
  // FORM: handle changes
  // ------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // user selects multiple Batches
  const handleBatchChange = (newValues) => {
    setSelectedBatches(newValues);
  };
  // user selects multiple lab courses
  const handleLabCoursesChange = (newValues) => {
    setSelectedLabCourses(newValues);
  };
  // user selects multiple theory courses
  const handleTheoryCoursesChange = (newValues) => {
    setSelectedTheoryCourses(newValues);
  };

  // ------------------------------------
  // SUBMIT
  //   1) create/update teacher
  //   2) remove old TCA + BCTA => re-create
  // ------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const teacherPayload = {
      Teacher_ID: parseInt(formData.Teacher_ID, 10),
      Name: formData.Name,
      NIC: formData.NIC,
      Email: formData.Email,
      Phone: formData.Phone,
      Max_classes: parseInt(formData.Max_classes, 10),
      Health_limitation: formData.Health_limitation,
      Seniority: formData.Seniority,
      Teacher_type: formData.Teacher_type || "Permanent",
    };

    try {
      // 1) CREATE or UPDATE TEACHER
      if (isEditing) {
        await teacherService.updateTeacher(teacherPayload.Teacher_ID, teacherPayload);
        showSnackbar("Teacher updated successfully!", "success");
      } else {
        await teacherService.createTeacher(teacherPayload);
        showSnackbar("Teacher created successfully!", "success");
      }

      // 2) REMOVE old TCA and BCTA for this teacher
      const allTCAs = await teacherCourseAssignmentService.getAllAssignments();
      const teacherTCAs = allTCAs.data.filter(
        (a) => a.Teacher_ID === teacherPayload.Teacher_ID
      );
      for (const oldA of teacherTCAs) {
        // Use the real PK field from the DB. If your TCA model uses "Assignment_ID" as PK, do this:
        await teacherCourseAssignmentService.deleteAssignment(oldA.Assignment_ID);
      }

      const allBCTAs = await batchCourseTeacherAssignmentService.getAllAssignments();
      const teacherBCTAs = allBCTAs.data.filter(
        (a) => a.Teacher_ID === teacherPayload.Teacher_ID
      );
      for (const oldB of teacherBCTAs) {
        // same logic
        await batchCourseTeacherAssignmentService.deleteAssignment(oldB.Assignment_ID);
      }

      // 3) RE-CREATE TCA
      // labCourses => teacher_type="lab"
      for (const cid of selectedLabCourses) {
        const tcaPayload = {
          Assignment_ID: Math.floor(Math.random() * 100000),
          Teacher_ID: teacherPayload.Teacher_ID,
          Course_ID: cid,
          Teacher_type: "lab",
        };
        await teacherCourseAssignmentService.createAssignment(tcaPayload);
      }
      // theoryCourses => teacher_type="theory"
      for (const cid of selectedTheoryCourses) {
        const tcaPayload = {
          Assignment_ID: Math.floor(Math.random() * 100000),
          Teacher_ID: teacherPayload.Teacher_ID,
          Course_ID: cid,
          Teacher_type: "theory",
        };
        await teacherCourseAssignmentService.createAssignment(tcaPayload);
      }

      // 4) RE-CREATE BCTA
      // for each selected batch => for each selected lab course => create BCTA w/ Course_type="lab"
      // for each selected batch => for each selected theory course => create BCTA w/ Course_type="theory"
      // 4) RE-CREATE BCTA
// Instead of iterating over selectedBatches, iterate over selectedSections
for (const sectionId of selectedSections) {
  // Find the section object so we can get its Batch_ID.
  const sectionObj = sections.find((s) => s.Section_ID === sectionId);
  if (!sectionObj) continue; // safety check

  // Create assignments for lab courses for this section
  for (const cid of selectedLabCourses) {
    const bctaPayload = {
      Assignment_ID: Math.floor(Math.random() * 100000),
      Batch_ID: parseInt(sectionObj.Batch_ID, 10),
      Section: sectionId, // include the section ID
      Course_ID: cid,
      Teacher_ID: teacherPayload.Teacher_ID,
      Course_type: "lab",
    };
    await batchCourseTeacherAssignmentService.createAssignment(bctaPayload);
  }
  
  // Create assignments for theory courses for this section
  for (const cid of selectedTheoryCourses) {
    const bctaPayload = {
      Assignment_ID: Math.floor(Math.random() * 100000),
      Batch_ID: parseInt(sectionObj.Batch_ID, 10),
      Section: sectionId, // include the section ID
      Course_ID: cid,
      Teacher_ID: teacherPayload.Teacher_ID,
      Course_type: "theory",
    };
    await batchCourseTeacherAssignmentService.createAssignment(bctaPayload);
  }
}


      fetchTeachers();
      resetForm();
    } catch (error) {
      console.error("Error creating/updating teacher:", error);
      let msg = "An error occurred while saving teacher data.";
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          const errorMessages = Object.values(error.response.data).flat().join(", ");
          if (errorMessages) {
            msg = errorMessages;
          }
        } else if (typeof error.response.data === "string") {
          msg = error.response.data;
        }
      }
      showSnackbar(msg, "danger");
    }
  };

  const resetForm = () => {
    setFormData({
      Teacher_ID: "",
      Name: "",
      NIC: "",
      Email: "",
      Phone: "",
      Max_classes: "",
      Health_limitation: "",
      Seniority: "",
      Teacher_type: "",
    });
    setSelectedBatches([]);
    setSelectedLabCourses([]);
    setSelectedTheoryCourses([]);
    setIsEditing(false);
    setEditingTeacherId(null);
    setCurrentTab(0);
  };

  // ------------------------------------
  // TABS
  // ------------------------------------
  const tabLabels = [
    "View list of teachers",
    isEditing ? "Updating teacher" : "Enter new teacher"
  ];
  

  // Tab 1 => teacher list
  const tableContent = (
    <>
      <BasicBreadcrumbs breadcrumbs={breadcrumbsList} />
      <Tables
        tableHeadings={tableHeadings}
        tableRows={tableRows}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    </>
  );

  // Tab 2 => teacher form
  const formContent = (
    <>
      <BasicBreadcrumbs breadcrumbs={breadcrumbsNew} />
      <form onSubmit={handleSubmit}>
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
            label="Teacher ID (PK)"
            variant="outlined"
            type="text"
            name="Teacher_ID"
            fullWidth
            required
            value={formData.Teacher_ID}
            onChange={handleInputChange}
          />
          <TextField
            label="Name"
            variant="outlined"
            type="text"
            name="Name"
            fullWidth
            required
            value={formData.Name}
            onChange={handleInputChange}
          />
         <TextField
  label="NIC"
  variant="outlined"
  type="text"
  name="NIC"
  fullWidth
  required
  value={formData.NIC}
  onChange={handleInputChange}
  inputProps={{ maxLength: 13, pattern: "[0-9]{13}" }}
  helperText="NIC must be exactly 13 digits"
/>

          <TextField
            label="Email"
            variant="outlined"
            type="email"
            name="Email"
            fullWidth
            required
            value={formData.Email}
            onChange={handleInputChange}
          />
          <TextField
  label="Phone"
  variant="outlined"
  type="text"
  name="Phone"
  fullWidth
  required
  value={formData.Phone}
  onChange={handleInputChange}
  inputProps={{ maxLength: 11, pattern: "[0-9]{11}" }}
  helperText="Phone number must be exactly 11 digits"
/>

          <TextField
            label="Max Classes"
            variant="outlined"
            type="number"
            name="Max_classes"
            fullWidth
            required
            value={formData.Max_classes}
            onChange={handleInputChange}
          />
          <TextField
            label="Health Limitation"
            variant="outlined"
            type="text"
            name="Health_limitation"
            fullWidth
            value={formData.Health_limitation}
            onChange={handleInputChange}
          />

          {/* Seniority */}
          <Singledropdown
  label="Teacher Seniority"
  value={formData.Seniority}
  onChange={(selectedValue) => {
    setFormData((prev) => ({ ...prev, Seniority: selectedValue }));
  }}
  menuItems={[
    { label: "Chairman", value: "Chairman" },
    { label: "Professor", value: "Professor" },
    { label: "Assistant Professor", value: "Assistant Professor" },
    { label: "Lecturer", value: "Lecturer" },
    { label: "Visiting Faculty", value: "Visiting Faculty" },
  ]}
  required
/>

          <FormControl fullWidth>
  <Dropdown
    heading="Select Disciplines (Multiple)"
    menuItems={[
      { label: "Computer Science", value: "Computer Science" },
      { label: "Artificial Intelligence", value: "Artificial Intelligence" },
      { label: "Cyber Security", value: "Cyber Security" },
      { label: "Gaming and Animation", value: "Gaming and Animation" },
      { label: "Data Science", value: "Data Science" },
    ]}
    value={selectedDisciplines}
    onChange={(newValues) => setSelectedDisciplines(newValues)}
    multiple
  />
</FormControl>


          {/* MULTI-SELECT BATCHES */}
          <FormControl fullWidth>
            <Dropdown
              heading="Select Batches (Multiple)"
              menuItems={filteredBatches}
              value={selectedBatches}
              onChange={(newValues) => setSelectedBatches(newValues)}
              multiple
            />
          </FormControl>
          <FormControl fullWidth>
  <Dropdown
    heading="Select Sections (Multiple)"
    menuItems={filteredSections} // Only sections from the selected batches
    value={selectedSections}
    onChange={(newValues) => setSelectedSections(newValues)}
    multiple
  />
</FormControl>

          {/* MULTI-SELECT LAB COURSES */}
          <FormControl fullWidth>
            <Dropdown
              heading="Select Lab Courses"
              menuItems={labCourses.map((c) => ({
                label: c.Course_name,
                value: c.Course_ID,
              }))}
              value={selectedLabCourses}
              onChange={handleLabCoursesChange}
              multiple
            />
          </FormControl>

          {/* MULTI-SELECT THEORY COURSES */}
          <FormControl fullWidth>
            <Dropdown
              heading="Select Theory Courses"
              menuItems={theoryCourses.map((c) => ({
                label: c.Course_name,
                value: c.Course_ID,
              }))}
              value={selectedTheoryCourses}
              onChange={handleTheoryCoursesChange}
              multiple
            />
          </FormControl>

          <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {isEditing ? "Update Teacher" : "Submit"}
            </Button>
          </Box>
          {isEditing && (
  <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
    <Button variant="outlined" color="secondary" onClick={resetForm} fullWidth>
      Stop Updating
    </Button>
  </Box>
)}

        </Box>
      </form>
    </>
  );

  return (
    <div>
      {/* SNACKBAR */}
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />

      <TeacherTabs
        tabLabels={tabLabels}
        tabContent={[tableContent, formContent]}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />

      {/* DELETE MODAL */}
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
        Are you sure you want to delete this Teacher record? All of the following related records will be <span style={{ textDecoration: 'underline' }}>PERMANENTLY deleted</span>:
      </Typography>
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {[
          

          "-Preferences related to this Teacher",
          "-Compensatory Classes related to this Teacher",
          "-Timetable Generations related to this Teacher",
          "-Reports of this Teacher"
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

export default Teacher;
