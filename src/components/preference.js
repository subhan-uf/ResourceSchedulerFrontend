import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall"; // Your custom tab component
import Tables from "./designelements/tables"; // Your custom table
import { Box, Button, FormControl } from "@mui/material";
import axios from "axios";

// Services
import roomPreferenceService from "./api/roomPreferenceService";
import courseTimePreferenceService from "./api/courseTimePreferenceService";
import teacherService from "./api/teacherService";
import teacherCourseAssignmentService from "./api/teacherCourseAssignmentService";
import CourseService from "./api/courseService";
import SectionService from "./api/sectionService";
import Singledropdown from "./designelements/singledropdown";
import DynamicForm from "./designelements/dynamicform";
import CustomSnackbar from "./designelements/alert";
import AlertDialogModal from "./designelements/modal";
import batchCourseTeacherAssignmentService from "./api/batchCourseTeacherAssignmentService";
import batchService from "./api/batchService";

function Preference() {
  // -----------------------------
  // SNACKBAR
  // -----------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral");
  const [batches, setBatches] = useState([]);
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
  // We now display Day (instead of Date)
  const courseTableHeadings = [
    "Preference ID",
    "Teacher (ID - Name)",
    "Course Name",
    "Day",
    "Section",
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
  // teacherSectionsByCourse: object mapping courseID (as string) => array of section options { label, value }
  const [teacherSectionsByCourse, setTeacherSectionsByCourse] = useState({});
  // allTeacherSectionOptions: union of all section options
  const [allTeacherSectionOptions, setAllTeacherSectionOptions] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

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
    // Ensure availableSections is fetched
    fetchAvailableSections();
    fetchAllBatches();
  }, []);
  const fetchAllBatches = async () => {
      try {
        const resp = await batchService.getAllBatches();
        setBatches(resp.data || []);
      } catch (error) {
        console.error("Error fetching batches:", error);
     }
     };
  // Fetch room preferences
  const fetchRoomPrefs = async () => {
    try {
      const resp = await roomPreferenceService.getAll();
      setRoomPrefs(resp.data || []);
    } catch (error) {
      console.error("Error fetching room prefs:", error);
      showSnackbar("Failed to fetch room prefs.", "danger");
    }
  };

  // Fetch course/time preferences
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

  // Fetch courses (for course name lookups)
  const fetchAllCourses = async () => {
    try {
      const resp = await CourseService.getAllCourses();
      setCourses(resp.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch available sections (for fallback and lookups)
  const fetchAvailableSections = async () => {
    try {
      const resp = await SectionService.getAllSections();
      setAvailableSections(resp.data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  // When teacher changes => gather teacher's course assignments and sections
  const handleTeacherChange = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    if (!teacherId) {
      setTeacherCourses([]);
      setTeacherSectionsByCourse({});
      setAllTeacherSectionOptions([]);
      return;
    }
    try {
      // Ensure availableSections is loaded
      if (availableSections.length === 0) {
        await fetchAvailableSections();
      }
      // First: Fetch teacher's course assignments using string comparison
      const tcaResp = await teacherCourseAssignmentService.getAllAssignments();
      const teacherTCAs = tcaResp.data.filter(
        (tca) => tca.Teacher_ID.toString() === teacherId.toString()
      );
      const coursesForTeacher = [];
      teacherTCAs.forEach((tca) => {
        const cid = tca.Course_ID;
        if (!coursesForTeacher.some((c) => c.courseID === cid.toString())) {
          const courseObj = courses.find(
            (c) => c.Course_ID.toString() === cid.toString()
          );
          coursesForTeacher.push({
            courseID: cid.toString(),
            courseName: courseObj ? courseObj.Course_name : `Unknown(${cid})`,
            canLab: tca.Teacher_type.toLowerCase() === "lab",
            canTheory: tca.Teacher_type.toLowerCase() === "theory",
          });
        }
      });
      setTeacherCourses(coursesForTeacher);

      // Next: Fetch BatchCourseTeacherAssignment records for this teacher using string comparison
      const bctaResp = await batchCourseTeacherAssignmentService.getAllAssignments();
      const allBCTAs = bctaResp.data;
      const teacherBCTAs = allBCTAs.filter(
        (assignment) => assignment.Teacher_ID.toString() === teacherId.toString()
      );
      const grouped = {};
      teacherBCTAs.forEach((assignment) => {
        // Skip this record if Section is null or undefined
        if (!assignment.Section) return;
      
        const courseIdStr = assignment.Course_ID.toString();
        if (!grouped[courseIdStr]) grouped[courseIdStr] = [];
        let sectionOption = null;
        if (
          assignment.Section &&
          typeof assignment.Section === "object" &&
          assignment.Batch_ID &&
          typeof assignment.Batch_ID === "object"
        ) {
          // Use Batch_name if available; otherwise, fallback to the string of Batch_ID
          const batchName = assignment.Batch_ID.Batch_name
            ? assignment.Batch_ID.Batch_name
            : assignment.Batch_ID.toString();
          sectionOption = {
            label: `${batchName} - ${assignment.Section.Section_name}`,
            value: assignment.Section.Section_ID.toString(),
          };
        }
        else {
          const sec = availableSections.find(
            (s) => s.Section_ID.toString() === assignment.Section.toString()
          );
          if (sec) {
            // Lookup the batch object by matching sec.Batch_ID to Batch_ID in batches
            const batchObj = batches.find(
              (b) => b.Batch_ID.toString() === sec.Batch_ID.toString()
            );
            // Use the batch name if found; otherwise fall back to the batch id string
            const batchName = batchObj ? batchObj.Batch_name : sec.Batch_ID;
            sectionOption = {
              label: `${batchName} - ${sec.Section_name}`,
              value: sec.Section_ID.toString(),
            };
          }
        }
        
        if (sectionOption) {
          if (!grouped[courseIdStr].some((opt) => opt.value === sectionOption.value)) {
            grouped[courseIdStr].push(sectionOption);
          }
        }
      });
      
      setTeacherSectionsByCourse(grouped);

      // Create a union of all section options (if needed)
      const unionOptions = Object.values(grouped).flat();
      const deduped = unionOptions.reduce((acc, opt) => {
        if (!acc.some((o) => o.value === opt.value)) {
          acc.push(opt);
        }
        return acc;
      }, []);
      setAllTeacherSectionOptions(deduped);
    } catch (error) {
      console.error("Error fetching teacher's courses or sections:", error);
      showSnackbar("Failed to fetch teacher's courses/sections", "danger");
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

  // Course edit => fill single record => tab #2
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
      await handleTeacherChange(cp.Teacher_ID.toString());
      const singlePref = {
        id: 1,
        values: {
          course: cp.Course_ID ? cp.Course_ID.toString() : "",
          // For editing, we assume Section is stored as a plain value
          section: cp.Section ? cp.Section.toString() : "",
          // Replace date with day – ensure it's a string (backend now uses Day)
          day: cp.Day ? cp.Day.toString() : "",
          startTime: cp.Start_time ? cp.Start_time.slice(0, 5) : "",
          endTime: cp.End_time ? cp.End_time.slice(0, 5) : "",
          multimedia: !!cp.Multimedia_requirement,
          speaker: !!cp.Speaker,
          hard_constraint: !!cp.Hard_constraint,
          labOrTheory: cp.Lab_or_Theory ? cp.Lab_or_Theory.toLowerCase() : "",
        },
      };

      console.log(singlePref.values);
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
          const rpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Floor: preferredFloor.trim() || null,
          };
          await roomPreferenceService.update(editingId, rpPayload);
          showSnackbar("Room preference updated!", "success");
          fetchRoomPrefs();
        } else if (editType === "course") {
          if (timePreferences.length === 0) {
            showSnackbar("No time preference to update!", "danger");
            return;
          }
          const data = timePreferences[0].values;
          const { course, section, day, startTime, endTime, multimedia, speaker, hard_constraint, labOrTheory } = data;
          // IMPORTANT: Compare course as string (teacherCourses stores courseID as string)
          const teacherCourseObj = teacherCourses.find((tc) => tc.courseID === course);
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
            Section: section, // section is already a string
            Day: day,         // day is a string
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
        if (preferredFloor.trim() !== "") {
          const rpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Floor: preferredFloor,
          };
          await roomPreferenceService.create(rpPayload);
        }
        for (const sec of timePreferences) {
          const { course, section, day, startTime, endTime, multimedia, speaker, hard_constraint, labOrTheory } = sec.values;
          if (!labOrTheory) continue;
          const teacherCourseObj = teacherCourses.find((tc) => tc.courseID === course);
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
            Section: section,
            Day: day,
            Start_time: startTime,
            End_time: endTime,
            Status: "Scheduled",
            Lab_or_Theory: labOrTheory,
            Multimedia_requirement: !!multimedia,
            Speaker: !!speaker,
            Hard_constraint: !!hard_constraint,
          };
          console.log(ctpPayload)
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
          const errorMessages = Object.values(error.response.data)
            .flat()
            .join(", ");
          if (errorMessages) msg = errorMessages;
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

  // Build table rows for Room Preferences
  const roomPrefRows = roomPrefs.map((rp) => {
    const pk = rp.Room_Preference_ID || rp.Preference_ID;
    const teacherObj = teachers.find(
      (t) => t.Teacher_ID.toString() === rp.Teacher_ID.toString()
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${rp.Teacher_ID} - ???`;
    return [pk, teacherLabel, rp.Floor || "", pk];
  });

  // Build table rows for Course Preferences
  const coursePrefRows = coursePrefs.map((cp) => {
    const pk = cp.Preference_ID || cp.CoursePref_ID;
    const teacherObj = teachers.find(
      (t) => t.Teacher_ID.toString() === cp.Teacher_ID.toString()
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${cp.Teacher_ID} - ???`;
    const cObj = courses.find((c) => c.Course_ID.toString() === cp.Course_ID.toString());
    const courseName = cObj ? cObj.Course_name : `Unknown(${cp.Course_ID})`;
    return [
      pk,
      teacherLabel,
      courseName,
      cp.Day, // Day value
      cp.Start_time,
      cp.End_time,
      cp.Lab_or_Theory,
      cp.Hard_constraint ? "Yes" : "No",
      pk,
    ];
  });

  // Dynamic form fields – changes:
  // 1. Removed "Select Date" field and replaced with "Day" field (options: Monday–Saturday)
  // 2. Added a Section field right after Course that filters options based on the selected course in the first row.
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
      componentType: "SingleDropdown",
      label: "Section",
      name: "section",
      // Compute options dynamically based on the selected course in the first row
      options: (() => {
        const selectedCourse =
          timePreferences.length > 0 && timePreferences[0].values.course
            ? timePreferences[0].values.course
            : "";
        return selectedCourse && teacherSectionsByCourse[selectedCourse]
          ? teacherSectionsByCourse[selectedCourse].map((opt) => opt.value)
          : [];
      })(),
      getOptionLabel: (value) => {
        const selectedCourse =
          timePreferences.length > 0 && timePreferences[0].values.course
            ? timePreferences[0].values.course
            : "";
        const options =
          selectedCourse && teacherSectionsByCourse[selectedCourse]
            ? teacherSectionsByCourse[selectedCourse]
            : [];
        const option = options.find((opt) => opt.value === value);
        return option ? option.label : value;
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
      componentType: "SingleDropdown",
      label: "Day",
      name: "day",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      getOptionLabel: (val) => val,
    },
    {
      componentType: "SingleDropdown",
      label: "Start time",
      name: "startTime",
      options: ["08:30", "09:20", "10:10", "11:30", "12:20", "02:00", "02:50", "03:40"],
    },
    {
      componentType: "SingleDropdown",
      label: "End time",
      name: "endTime",
      options: ["09:20", "10:10", "11:30", "12:20", "02:00", "02:50", "03:40", "04:30"],
    },
    {
      componentType: "Checkbox",
      label: "Hard Time Constraint",
      name: "hard_constraint",
    },
    {
      componentType: "Checkbox",
      label: "Multimedia (Soft)",
      name: "multimedia",
    },
    {
      componentType: "Checkbox",
      label: "Speaker (Soft)",
      name: "speaker",
    },
   
  ];

  const getSectionTitle = (id) => `Preference #${id}`;

  const tabLabels = [
    "View list of room preferences",
    "View list of class time preferences",
    "Enter new preference",
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
                value: t.Teacher_ID,
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
                { label: "2nd", value: "2nd" },
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
      <TeacherTabs
        tabLabels={tabLabels}
        tabContent={tabContent}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />
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
