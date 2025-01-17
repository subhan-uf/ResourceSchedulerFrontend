import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";  // Your custom tab component
import Tables from "./designelements/tables";           // Your custom table
import { Box, Button, FormControl } from "@mui/material";
import axios from "axios";

// Services
import roomPreferenceService from "./api/roomPreferenceService";  
import courseTimePreferenceService from "./api/courseTimePreferenceService"; 
import teacherService from "./api/teacherService";
import teacherCourseAssignmentService from "./api/teacherCourseAssignmentService";
import CourseService from "./api/courseService";

import Singledropdown from "./designelements/singledropdown";
import DynamicForm from "./designelements/dynamicform";
import CustomSnackbar from "./designelements/alert";
import AlertDialogModal from "./designelements/modal";

function Preference() {
  // -----------------------------
  // SNACKBAR
  // -----------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");

  const showSnackbar = (msg, color) => {
    setSnackbarMessage(msg);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  // -----------------------------
  // TABS
  // -----------------------------
  const [currentTab, setCurrentTab] = useState(0);

  // -----------------------------
  // ROOM PREFERENCES
  // -----------------------------
  const [roomPrefs, setRoomPrefs] = useState([]);
  const roomTableHeadings = [
    "Preference ID",
    "Teacher (ID - Name)",
    "Floor",
    "Actions",
  ];
  const [roomPrefToDelete, setRoomPrefToDelete] = useState(null);
  const [roomDeleteModalOpen, setRoomDeleteModalOpen] = useState(false);

  // -----------------------------
  // TIME (COURSE) PREFERENCES
  // -----------------------------
  const [coursePrefs, setCoursePrefs] = useState([]);
  const courseTableHeadings = [
    "Preference ID",
    "Teacher (ID - Name)",
    "Course Name",
    "Date",
    "Start Time",
    "End Time",
    "Lab or Theory",
    "Hard Constraint?",
    "Actions",
  ];
  const [coursePrefToDelete, setCoursePrefToDelete] = useState(null);
  const [courseDeleteModalOpen, setCourseDeleteModalOpen] = useState(false);

  // -----------------------------
  // ADD / EDIT FORM
  // -----------------------------
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]); 
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [preferredFloor, setPreferredFloor] = useState("");
  const [timePreferences, setTimePreferences] = useState([]); 

  // EDIT mode
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState(null); // "room" or "course"
  const [editingId, setEditingId] = useState(null);

  // ON MOUNT
  useEffect(() => {
    fetchRoomPrefs();
    fetchCoursePrefs();
    fetchAllTeachers();
    fetchAllCourses();
  }, []);

  // Fetch room prefs
  const fetchRoomPrefs = async () => {
    try {
      const resp = await roomPreferenceService.getAll();
      setRoomPrefs(resp.data || []);
    } catch (error) {
      console.error("Error fetching room prefs:", error);
      showSnackbar("Failed to fetch room prefs.", "danger");
    }
  };

  // Fetch time/course prefs
  const fetchCoursePrefs = async () => {
    try {
      const resp = await courseTimePreferenceService.getAll();
      setCoursePrefs(resp.data || []);
    } catch (error) {
      console.error("Error fetching time prefs:", error);
      showSnackbar("Failed to fetch time prefs.", "danger");
    }
  };

  // Fetch teachers
  const fetchAllTeachers = async () => {
    try {
      const resp = await teacherService.getAllTeachers();
      setTeachers(resp.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  // Fetch courses (for courseName lookups)
  const fetchAllCourses = async () => {
    try {
      const resp = await CourseService.getAllCourses();
      setCourses(resp.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // When teacher changes => gather teacher's course assignments
  const handleTeacherChange = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    if (!teacherId) {
      setTeacherCourses([]);
      return;
    }
    try {
      const tcaResp = await teacherCourseAssignmentService.getAllAssignments();
      const teacherTCAs = tcaResp.data.filter(
        (tca) => tca.Teacher_ID === parseInt(teacherId, 10)
      );
      const courseMap = {};
      teacherTCAs.forEach((assign) => {
        const cid = assign.Course_ID;
        if (!courseMap[cid]) {
          courseMap[cid] = { courseID: cid, canLab: false, canTheory: false, courseName: "" };
        }
        if (assign.Teacher_type.toLowerCase() === "lab") {
          courseMap[cid].canLab = true;
        } else if (assign.Teacher_type.toLowerCase() === "theory") {
          courseMap[cid].canTheory = true;
        }
      });
      // fill in courseName from the courses list
      Object.keys(courseMap).forEach((cid) => {
        const co = courses.find((c) => c.Course_ID === parseInt(cid, 10));
        if (co) {
          courseMap[cid].courseName = co.Course_name;
        } else {
          courseMap[cid].courseName = `Unknown(${cid})`;
        }
      });
      setTeacherCourses(Object.values(courseMap));
    } catch (error) {
      console.error("Error fetching TCA for teacher:", error);
      showSnackbar("Failed to fetch teacher's courses", "danger");
    }
  };

  const handleTimePreferencesChange = (updatedSections) => {
    setTimePreferences(updatedSections);
  };

  // For editing floor
  const handleFloorChange = (val) => {
    setPreferredFloor(val);
  };

  // -----------------------------
  // ROOM TABLE ACTIONS
  // -----------------------------
  const handleRoomDeleteClick = (rowData) => {
    const pk = rowData[rowData.length - 1];
    setRoomPrefToDelete(pk);
    setRoomDeleteModalOpen(true);
  };
  const handleRoomDeleteConfirm = async () => {
    if (!roomPrefToDelete) return;
    try {
      await roomPreferenceService.delete(roomPrefToDelete);
      showSnackbar("Room preference deleted!", "success");
      fetchRoomPrefs();
    } catch (error) {
      console.error("Error deleting room pref:", error);
      showSnackbar("Failed to delete room pref.", "danger");
    } finally {
      setRoomDeleteModalOpen(false);
      setRoomPrefToDelete(null);
    }
  };
  const handleRoomDeleteCancel = () => {
    setRoomDeleteModalOpen(false);
    setRoomPrefToDelete(null);
  };

  // Room edit => go to tab #2
  const handleRoomEditClick = async (rowData) => {
    const pk = rowData[rowData.length - 1];
    setIsEditing(true);
    setEditType("room");
    setEditingId(pk);
    // Switch to tab #2
    setCurrentTab(2);
    try {
      const resp = await roomPreferenceService.getById(pk);
      const rp = resp.data;
      setSelectedTeacherId(rp.Teacher_ID.toString());
      setPreferredFloor(rp.Floor || "");
      setTimePreferences([]);
    } catch (error) {
      console.error("Error fetching room for edit:", error);
      showSnackbar("Failed to fetch room preference for edit.", "danger");
    }
  };

  // -----------------------------
  // COURSE/TIME TABLE ACTIONS
  // -----------------------------
  const handleCourseDeleteClick = (rowData) => {
    const pk = rowData[rowData.length - 1];
    setCoursePrefToDelete(pk);
    setCourseDeleteModalOpen(true);
  };
  const handleCourseDeleteConfirm = async () => {
    if (!coursePrefToDelete) return;
    try {
      await courseTimePreferenceService.delete(coursePrefToDelete);
      showSnackbar("Time/course preference deleted!", "success");
      fetchCoursePrefs();
    } catch (error) {
      console.error("Error deleting time/course pref:", error);
      showSnackbar("Failed to delete time/course preference.", "danger");
    } finally {
      setCourseDeleteModalOpen(false);
      setCoursePrefToDelete(null);
    }
  };
  const handleCourseDeleteCancel = () => {
    setCourseDeleteModalOpen(false);
    setCoursePrefToDelete(null);
  };

  // Course edit => single record => fill => tab#2
  const handleCourseEditClick = async (rowData) => {
    const pk = rowData[rowData.length - 1];
    setIsEditing(true);
    setEditType("course");
    setEditingId(pk);
    setCurrentTab(2);
    try {
        const resp = await courseTimePreferenceService.getById(pk);
        const cp = resp.data;
        setSelectedTeacherId(cp.Teacher_ID.toString());
        setPreferredFloor("");

        const singlePref = {
            id: 1,
            values: {
                course: cp.Course_ID ? cp.Course_ID.toString() : "",
                date: cp.Date || "",
                startTime: cp.Start_time ? cp.Start_time.slice(0, 5) : "", // Convert to "HH:mm"
                endTime: cp.End_time ? cp.End_time.slice(0, 5) : "", // Convert to "HH:mm"
                multimedia: !!cp.Multimedia_requirement,
                speaker: !!cp.Speaker,
                hard_constraint: !!cp.Hard_constraint,
                labOrTheory: cp.Lab_or_Theory ? cp.Lab_or_Theory.toLowerCase() : "",
            },
        };
        console.log(singlePref.values)
        setTimePreferences([singlePref]);
    } catch (error) {
        console.error("Error fetching course/time for edit:", error);
        showSnackbar("Failed to fetch course/time preference for edit.", "danger");
    }
};


  // -----------------------------
  // SUBMIT => create or update
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      showSnackbar("Please select a teacher first.", "danger");
      return;
    }
    try {
      if (isEditing) {
        if (editType === "room") {
          // update existing
          const rpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Floor: preferredFloor.trim() || null,
          };
          await roomPreferenceService.update(editingId, rpPayload);
          showSnackbar("Room preference updated!", "success");
          fetchRoomPrefs();
        } else if (editType === "course") {
          // update single record
          if (timePreferences.length === 0) {
            showSnackbar("No time preference to update!", "danger");
            return;
          }
          const data = timePreferences[0].values;
          const {
            course,
            date,
            startTime,
            endTime,
            multimedia,
            speaker,
            hard_constraint,
            labOrTheory,
          } = data;
          // Check if teacher can do labOrTheory for that course
          const teacherCourseObj = teacherCourses.find((tc) => tc.courseID === parseInt(course, 10));
          if (!teacherCourseObj) {
            showSnackbar("Teacher does not teach this course at all!", "danger");
            return;
          }
          if (labOrTheory === "lab" && !teacherCourseObj.canLab) {
            showSnackbar("Error: This teacher cannot teach lab for this course!", "danger");
            return;
          }
          if (labOrTheory === "theory" && !teacherCourseObj.canTheory) {
            showSnackbar("Error: This teacher cannot teach theory for this course!", "danger");
            return;
          }

          const ctpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Course_ID: parseInt(course, 10),
            Date: date,
            Start_time: startTime,
            End_time: endTime,
            Status: "Scheduled",
            Lab_or_Theory: labOrTheory,
            Multimedia_requirement: !!multimedia,
            Speaker: !!speaker,
            Hard_constraint: !!hard_constraint,
          };
          await courseTimePreferenceService.update(editingId, ctpPayload);
          showSnackbar("Time/course preference updated!", "success");
          fetchCoursePrefs();
        }
      } else {
        // CREATE new
        // If floor => create room
        if (preferredFloor.trim() !== "") {
          const rpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Floor: preferredFloor,
          };
          await roomPreferenceService.create(rpPayload);
        }
        // Then create time prefs => for each dynamic form item
        for (const sec of timePreferences) {
          const {
            course,
            date,
            startTime,
            endTime,
            multimedia,
            speaker,
            hard_constraint,
            labOrTheory,
          } = sec.values;
          if (!labOrTheory) {
            // user didn't pick lab or theory => skip
            continue;
          }
          // Check if teacher can do lab or theory
          const teacherCourseObj = teacherCourses.find((tc) => tc.courseID === parseInt(course, 10));
          if (!teacherCourseObj) {
            showSnackbar("Teacher does not teach the chosen course!", "danger");
            return;
          }
          if (labOrTheory === "lab" && !teacherCourseObj.canLab) {
            showSnackbar("Error: This teacher cannot teach lab for this course!", "danger");
            return;
          }
          if (labOrTheory === "theory" && !teacherCourseObj.canTheory) {
            showSnackbar("Error: This teacher cannot teach theory for this course!", "danger");
            return;
          }

          const ctpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Course_ID: parseInt(course, 10),
            Date: date,
            Start_time: startTime,
            End_time: endTime,
            Status: "Scheduled",
            Lab_or_Theory: labOrTheory,
            Multimedia_requirement: !!multimedia,
            Speaker: !!speaker,
            Hard_constraint: !!hard_constraint,
          };
          await courseTimePreferenceService.create(ctpPayload);
        }
        showSnackbar("Preferences created successfully!", "success");
        fetchRoomPrefs();
        fetchCoursePrefs();
      }
      resetForm();
    } catch (error) {
      console.error("Error saving preferences:", error);
      let msg = "An error occurred while saving preferences.";
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          const errorMessages = Object.values(error.response.data).flat().join(", ");
          if (errorMessages) {
            msg = errorMessages;
          }
        } else {
          msg = error.response.data;
        }
      }
      showSnackbar(msg, "danger");
    }
  };

  const resetForm = () => {
    setSelectedTeacherId("");
    setPreferredFloor("");
    setTimePreferences([]);
    setIsEditing(false);
    setEditType(null);
    setEditingId(null);
    setCurrentTab(0);
  };

  // Build table rows
  const roomPrefRows = roomPrefs.map((rp) => {
    const pk = rp.Room_Preference_ID || rp.Preference_ID;
    const teacherObj = teachers.find(
      (t) => parseInt(t.Teacher_ID, 10) === parseInt(rp.Teacher_ID, 10)
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${rp.Teacher_ID} - ???`;
    return [pk, teacherLabel, rp.Floor || "", pk];
  });
  const coursePrefRows = coursePrefs.map((cp) => {
    const pk = cp.Preference_ID || cp.CoursePref_ID;
    const teacherObj = teachers.find(
      (t) => parseInt(t.Teacher_ID, 10) === parseInt(cp.Teacher_ID, 10)
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${cp.Teacher_ID} - ???`;
    const cObj = courses.find((c) => c.Course_ID === cp.Course_ID);
    const courseName = cObj ? cObj.Course_name : `Unknown(${cp.Course_ID})`;

    return [
      pk,
      teacherLabel,
      courseName,
      cp.Date,
      cp.Start_time,
      cp.End_time,
      cp.Lab_or_Theory,
      cp.Hard_constraint ? "Yes" : "No",
      pk
    ];
  });

  // Dynamic form with a single radio for "labOrTheory"
  const fieldsTime = [
    {
      componentType: "SingleDropdown",
      label: "Course",
      name: "course",
      options: teacherCourses.map((tc) => tc.courseID),
      getOptionLabel: (cid) => {
        const obj = teacherCourses.find((tc) => tc.courseID === cid);
        return obj ? obj.courseName : `Course ${cid}`;
      },
    },
    {
      componentType: "RadioGroup",
      label: "Class Type (Lab or Theory)",
      name: "labOrTheory",
      options: [
        { label: "Lab", value: "lab" },
        { label: "Theory", value: "theory" },
      ],
    },
    {
      componentType: "TextField",
      label: "Select Date",
      name: "date",
      type: "date",
    },
    {
      componentType: "SingleDropdown",
      label: "Start time",
      name: "startTime",
      options: ["08:30","09:20","10:10","11:30","12:20","02:00","02:50","03:40"],
    },
    {
      componentType: "SingleDropdown",
      label: "End time",
      name: "endTime",
      options: ["09:20","10:10","11:30","12:20","02:00","02:50","03:40","04:30"],
    },
    {
      componentType: "Checkbox",
      label: "Multimedia",
      name: "multimedia",
    },
    {
      componentType: "Checkbox",
      label: "Speaker",
      name: "speaker",
    },
    {
      componentType: "Checkbox",
      label: "Hard Constraint",
      name: "hard_constraint",
    },
  ];

  const getSectionTitle = (id) => `Preference #${id}`;

  // TABS
  const tabLabels = [
    "View list of room preferences",
    "View list of class time preferences",
    "Enter new preference"
  ];

  const roomPrefTable = (
    <Tables
      tableHeadings={roomTableHeadings}
      tableRows={roomPrefRows}
      onDelete={handleRoomDeleteClick}
      onEdit={handleRoomEditClick}
    />
  );
  const coursePrefTable = (
    <Tables
      tableHeadings={courseTableHeadings}
      tableRows={coursePrefRows}
      onDelete={handleCourseDeleteClick}
      onEdit={handleCourseEditClick}
    />
  );
  const addPreferenceForm = (
    <div>
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
          {/* Teacher */}
          <FormControl fullWidth required>
            <Singledropdown
              label="Teacher"
              name="selectedTeacherId"
              value={selectedTeacherId}
              menuItems={teachers.map((t) => ({
                label: `${t.Teacher_ID} - ${t.Name}`,
                value: t.Teacher_ID
              }))}
              onChange={(newVal) => {
                setSelectedTeacherId(newVal);
                handleTeacherChange(newVal);
              }}
            />
          </FormControl>

          {/* Floor */}
          <FormControl fullWidth>
            <Singledropdown
              label="Preferred floor (Optional)"
              name="preferredFloor"
              value={preferredFloor}
              menuItems={[
                { label: "Ground", value: "Ground" },
                { label: "1st", value: "1st" },
                { label: "2nd", value: "2nd" }
              ]}
              onChange={(newVal) => {
                setPreferredFloor(newVal);
              }}
            />
          </FormControl>

          <Box sx={{ gridColumn: "span 2", mt: 2 }}>
            <DynamicForm
              fields={fieldsTime}
              sectionTitle="Preference"
              getSectionTitle={getSectionTitle}
              addButtonText="Add new preference"
              onPreferencesChange={handleTimePreferencesChange}
              initialSections={timePreferences}
            />
          </Box>

          <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {isEditing ? "Update Preference" : "Submit"}
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  );

  const tabContent = [roomPrefTable, coursePrefTable, addPreferenceForm];

  return (
    <div>
      {/* 
        IMPORTANT: pass externalIndex and onIndexChange so that setting currentTab
        from code actually changes the tab 
      */}
      <TeacherTabs
        tabLabels={tabLabels}
        tabContent={tabContent}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />

      {/* SNACKBAR */}
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />

      {/* Delete modals */}
      <AlertDialogModal
        open={roomDeleteModalOpen}
        onClose={() => setRoomDeleteModalOpen(false)}
        onConfirm={handleRoomDeleteConfirm}
        message="Are you sure you want to delete this room preference?"
      />
      <AlertDialogModal
        open={courseDeleteModalOpen}
        onClose={() => setCourseDeleteModalOpen(false)}
        onConfirm={handleCourseDeleteConfirm}
        message="Are you sure you want to delete this time/course preference?"
      />
    </div>
  );
}

export default Preference;
