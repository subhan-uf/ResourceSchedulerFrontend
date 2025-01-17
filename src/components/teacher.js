import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from "@mui/material/TextField";
import { Box, Button, FormControl } from "@mui/material";
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

  // We'll load **all** courses from the server, but we'll only show the subset
  // that belongs to the selected batches. We'll store them in filteredCourses,
  // then separate them into lab vs. theory if your model has e.g. "Is_Lab" boolean.
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [labCourses, setLabCourses] = useState([]);
  const [theoryCourses, setTheoryCourses] = useState([]);

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
      });

      setSelectedBatches(uniqueBatchIDs); // e.g. [1,2]
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
      for (const batchId of selectedBatches) {
        // Lab
        for (const cid of selectedLabCourses) {
          const bctaPayload = {
            Assignment_ID: Math.floor(Math.random() * 100000),
            Batch_ID: parseInt(batchId, 10),
            Course_ID: cid,
            Teacher_ID: teacherPayload.Teacher_ID,
            Course_type: "lab",
          };
          await batchCourseTeacherAssignmentService.createAssignment(bctaPayload);
        }
        // Theory
        for (const cid of selectedTheoryCourses) {
          const bctaPayload = {
            Assignment_ID: Math.floor(Math.random() * 100000),
            Batch_ID: parseInt(batchId, 10),
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
  const tabLabels = ["View list of teachers", "Enter new teacher"];

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
            type="number"
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
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, Seniority: val }))
            }
            menuItems={[
              { label: "Chairman", value: "Chairman" },
              { label: "Professor", value: "Professor" },
              { label: "Assistant Professor", value: "Assistant Professor" },
              { label: "Lecturer", value: "Lecturer" },
              { label: "Visiting Faculty", value: "Visiting Faculty" },
            ]}
            required
          />

          {/* MULTI-SELECT BATCHES */}
          <FormControl fullWidth>
            <Dropdown
              heading="Select Batches (Multiple)"
              menuItems={batches.map((b) => ({
                label: b.Batch_name,
                value: b.Batch_ID,
              }))}
              value={selectedBatches}
              onChange={(newValues) => setSelectedBatches(newValues)}
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
        message="Are you sure you want to delete this teacher?"
      />
    </div>
  );
}

export default Teacher;
