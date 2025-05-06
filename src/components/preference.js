import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall"; // Your custom tab component
import Tables from "./designelements/tables"; // Your custom table
import { Box, Button, FormControl, TextField } from "@mui/material";
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
  const [searchRoomQuery, setSearchRoomQuery] = useState("");
const [searchCourseQuery, setSearchCourseQuery] = useState("");

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
    "Batch - Section",
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
  const [classTypeOptions, setClassTypeOptions] = useState([]);

  // EDIT mode
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState(null); // "room" or "course"
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    async function fetchClassTypeOptions() {
      if (timePreferences.length > 0) {
        const selectedCourse = timePreferences[0].values.course;
        const selectedSection = timePreferences[0].values.section;
        if (selectedCourse && selectedSection && selectedTeacherId) {
          try {
            const resp = await batchCourseTeacherAssignmentService.getAllAssignments();
            // Only keep non-archived assignments
            const live = (resp.data || []).filter(a => !a.Archived);
            // Filter assignments for this teacher
            const teacherRecords = live.filter(
              (r) => r.Teacher_ID.toString() === selectedTeacherId.toString()
            );
            
            // Filter for the selected course and section (handle object or raw Section)
            const relevant = teacherRecords.filter((r) => {
              if (r.Section && typeof r.Section === "object") {
                return (
                  r.Course_ID.toString() === selectedCourse &&
                  r.Section.Section_ID.toString() === selectedSection
                );
              } else {
                return (
                  r.Course_ID.toString() === selectedCourse &&
                  r.Section.toString() === selectedSection
                );
              }
            });
            // Determine unique types (using Course_type property)
            const types = Array.from(
              new Set(
                relevant.map((r) => (r.Course_type || "").trim().toLowerCase())
              )
            ).filter((x) => x);
            // Map the types to dropdown options; capitalize the label
            const opts = types; // types is an array of strings (e.g. ["lab", "theory"])
            setClassTypeOptions(opts);
            
          } catch (e) {
            console.error("Error fetching class type options", e);
            setClassTypeOptions([]);
          }
        } else {
          setClassTypeOptions([]);
        }
      } else {
        setClassTypeOptions([]);
      }
    }
    fetchClassTypeOptions();
  }, [timePreferences, selectedTeacherId]);
  
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
  const handleStopEditing = () => {
    resetForm(); // Reuse your existing reset function
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
        const cid = tca.Course_ID.toString();
        const courseObj = courses.find(
          (c) => c.Course_ID.toString() === cid
        );
        
        const existingCourse = coursesForTeacher.find((c) => c.courseID === cid);
        if (existingCourse) {
          // Update the properties if this tca indicates a new capability.
          if (tca.Teacher_type.toLowerCase() === "lab") {
            existingCourse.canLab = true;
          } else if (tca.Teacher_type.toLowerCase() === "theory") {
            existingCourse.canTheory = true;
          }
        } else {
          // Add a new entry.
          coursesForTeacher.push({
            courseID: cid,
            courseName: courseObj ? courseObj.Course_name : `Unknown(${cid})`,
            canLab: tca.Teacher_type.toLowerCase() === "lab",
            canTheory: tca.Teacher_type.toLowerCase() === "theory",
          });
        }
      });
      
      setTeacherCourses(coursesForTeacher);

      // Next: Fetch BatchCourseTeacherAssignment records for this teacher using string comparison
      const bctaResp = await batchCourseTeacherAssignmentService.getAllAssignments();
      // Only keep non-archived assignments
      const live = (bctaResp.data || []).filter(a => !a.Archived);
      const teacherBCTAs = live.filter(
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
    if (updatedSections.length > 1) {
      updatedSections = [updatedSections[0]];
    }
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

      // console.log(singlePref.values);
      setTimePreferences([singlePref]);
    } catch (error) {
      console.error("Error fetching course/time for edit:", error);
      showSnackbar("Failed to fetch course/time preference for edit.", "danger");
    }
  };

  // -----------------------------
  // SUBMIT => create or update
  // -----------------------------
  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      showSnackbar("Please select a teacher first.", "danger");
      return;
    }
    if (preferredFloor.trim() === "" && timePreferences.length === 0) {
      showSnackbar("Please select either a Floor Constraint or add a Time Preference.", "danger");
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
          for (let i = 0; i < timePreferences.length; i++) {
          const data = timePreferences[i].values;
          const { course, section, day, startTime, endTime, multimedia, speaker, hard_constraint, labOrTheory } = data;
          // ─── EDIT MODE HARD‐CONSTRAINT OVERLAP CHECK ───
if (hard_constraint) {
  const overlap = coursePrefs.find(cp => {
    const id = cp.Preference_ID || cp.CoursePref_ID;
    return (
      cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
      cp.Day === day &&
      cp.Hard_constraint === true &&
      id.toString() !== editingId.toString() &&
      (
        cp.Start_time.slice(0,5) === startTime
        // 2) exact end match
        || cp.End_time.slice(0,5) === endTime||
        (cp.Start_time.slice(0,5) === "08:30" && cp.End_time.slice(0,5) === "10:10"
          && startTime === "09:20" && endTime === "11:00")
        || (cp.Start_time.slice(0,5) === "09:20" && cp.End_time.slice(0,5) === "11:00"
          && startTime === "08:30" && endTime === "10:10")
        || (cp.Start_time.slice(0,5) === "02:00" && cp.End_time.slice(0,5) === "03:40"
          && startTime === "02:50" && endTime === "04:30")
        || (cp.Start_time.slice(0,5) === "02:50" && cp.End_time.slice(0,5) === "04:30"
          && startTime === "02:00" && endTime === "03:40")
      )
    );
  });
  if (overlap) {
    showSnackbar(
      "This teacher cannot have more than one hard preferences on the same day and time.",
      "danger"
    );
    return;
  }
}

          if (labOrTheory.toLowerCase() === "theory") {
            const courseObj = courses.find(c => c.Course_ID.toString() === course);
            if (!courseObj) {
              showSnackbar("Course not found.", "danger");
              return;
            }
            const credit = parseInt(courseObj.Credit_hours, 10);
            let allowedSlots = 0;
            if (credit === 2) {
              allowedSlots = 2;
            } else if (credit === 3 || credit === 4) {
              allowedSlots = 3;
            } else {
              showSnackbar("Invalid credit hours for course.", "danger");
              return;
            }
        
            const baseTimes = ["08:30", "09:20", "10:10","11:00" ,"11:30", "12:20", "01:10","02:00", "02:50", "03:40", "04:30"];
            const startIndex = baseTimes.indexOf(startTime);
            const endIndex = baseTimes.indexOf(endTime);
            console.log(startTime)
            if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
              showSnackbar("Invalid time selection.", "danger");
              return;
            }
            const newPrefSlots = (endIndex - startIndex === 1) ? 1 : (endIndex - startIndex === 2 ? 2 : 0);
            if (newPrefSlots === 0) {
              showSnackbar("Preference must be either one slot or two consecutive slots.", "danger");
              return;
            }

              // NEW: Enforce slot-type rules based on credit hours
  if (credit === 2) {
    if (newPrefSlots !== 2) {
      showSnackbar("For 2 credit courses, only consecutive (2-slot) theory preferences are allowed.", "danger");
      return;
    }
  } else if (credit === 3 || credit === 4) {
    // For 3/4-credit courses, if a theory preference on a different day already exists,
    // the new entry must be of the opposite type (i.e. if existing is single, new must be consecutive, and vice versa).
    const existingOther = coursePrefs.filter(cp =>
      cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
      cp.Course_ID.toString() === course &&
      cp.Section.toString() === section &&
      cp.Lab_or_Theory.toLowerCase() === "theory" &&
      cp.Day !== day &&
      ((cp.Preference_ID || cp.CoursePref_ID) !== editingId)
    );
    
    if (existingOther.length === 1) {
      const ex = existingOther[0];
      const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
      const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
      const existingType = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
      if (existingType === newPrefSlots) {
        showSnackbar("For 3/4 credit courses, if one theory entry is single-slot, the second must be consecutive (or vice versa).", "danger");
        return;
      }
    } else if (existingOther.length > 1) {
      showSnackbar("Maximum theory preferences for this course and section have been reached.", "danger");
      return;
    }
  }

        
  const existingSameDay = coursePrefs.filter(cp =>
    cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
    cp.Course_ID.toString() === course &&
    cp.Section.toString() === section &&
    cp.Lab_or_Theory.toLowerCase() === "theory" &&
    cp.Day === day &&
    ((cp.Preference_ID || cp.CoursePref_ID) !== editingId)
  );
  
            if (existingSameDay.length > 0) {
              for (const ex of existingSameDay) {
                const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
                const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
                const exSlots = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
                if (exSlots !== newPrefSlots) {
                  showSnackbar("Cannot set theory consecutive and single preferences on the same day for the same course and section.", "danger");
                  return;
                } else {
                  showSnackbar("A theory preference for this course and section on that day already exists.", "danger");
                  return;
                }
              }
            }
        
            const existingAll = coursePrefs.filter(cp =>
              cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
              cp.Course_ID.toString() === course &&
              cp.Section.toString() === section &&
              cp.Lab_or_Theory.toLowerCase() === "theory" &&
              ((cp.Preference_ID || cp.CoursePref_ID) !== editingId)
            );
            
            let totalSlots = 0;
            for (const ex of existingAll) {
              const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
              const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
              const exSlots = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
              totalSlots += exSlots;
            }
            if (totalSlots + newPrefSlots > allowedSlots) {
              console.log(totalSlots, newPrefSlots, allowedSlots)
              showSnackbar("Setting this theory preference would exceed allowed slots for this course.", "danger");
              return;
            }
          } else if (labOrTheory.toLowerCase() === "lab") {
            const existingLab = coursePrefs.find(cp =>
              cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
              cp.Course_ID.toString() === course &&
              cp.Section.toString() === section &&
              cp.Lab_or_Theory.toLowerCase() === "lab" &&
              ((cp.Preference_ID || cp.CoursePref_ID) !== editingId)
            );
            if (existingLab) {
              showSnackbar("A lab preference for this course and section already exists.", "danger");
              return;
            }
          }
          
          
          
          
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
              // ── HARDCODED OVERLAP PREVENTION ──
  // (must come before your `duplicate` check)
  if (hard_constraint) {
    const bad = coursePrefs.find(cp => cp.Hard_constraint === true && (
      // existing hard 8:30–10:10 blocks 9:20–11:00
      (cp.Start_time.slice(0,5) === "08:30" && cp.End_time.slice(0,5) === "10:10"
        && startTime === "09:20" && endTime === "11:00")
      // existing hard 9:20–11:00 blocks 8:30–10:10
      || (cp.Start_time.slice(0,5) === "09:20" && cp.End_time.slice(0,5) === "11:00"
        && startTime === "08:30" && endTime === "10:10")
      // existing hard 2:00–3:40 blocks 2:50–4:30
      || (cp.Start_time.slice(0,5) === "02:00" && cp.End_time.slice(0,5) === "03:40"
        && startTime === "02:50" && endTime === "04:30")
      // existing hard 2:50–4:30 blocks 2:00–3:40
      || (cp.Start_time.slice(0,5) === "02:50" && cp.End_time.slice(0,5) === "04:30"
        && startTime === "02:00" && endTime === "03:40")
    ));
    if (bad) {
      showSnackbar(
        "Another hard preference overlaps with your selected time.",
        "danger"
      );
      return;
    }
  }
  // ─────────────────────────────────────

            const duplicate = coursePrefs.find((cp) => {
              // Get the record's unique id (could be Preference_ID or CoursePref_ID)
              const cpId = cp.Preference_ID || cp.CoursePref_ID;
              // Exclude the record being edited
              if (cpId === editingId) return false;
              return    cp.Section.toString() === section.toString() &&   // Check section as well
                cp.Day === day &&                    cp.Day === day &&
                     (cp.Start_time.slice(0, -3) === startTime || cp.End_time.slice(0, -3) === endTime) &&
                     cp.Hard_constraint === true 
                    //  cp.Lab_or_Theory === labOrTheory;
            });
            console.log(duplicate)
            if (duplicate) {
              console.log("Duplicate found during edit:", duplicate);
              showSnackbar("Another hard preference is already set at this time.", "danger");
              return; // Stop processing the submission
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
          if (i === 0) {
            await courseTimePreferenceService.update(editingId, ctpPayload);
          } else {
            await courseTimePreferenceService.create(ctpPayload);
          }
        }
          showSnackbar("Time/course preference updated!", "success");
          fetchCoursePrefs();
        }
      } else {


        if (preferredFloor.trim() !== "") {
          // Check if a floor preference already exists for this teacher
          const existingFloorPref = roomPrefs.find(
            (rp) =>
              rp.Teacher_ID.toString() === selectedTeacherId.toString() &&
              rp.Floor &&
              rp.Floor.trim() !== ""
          );
          if (existingFloorPref) {
            showSnackbar("Floor Constraint already exists for this teacher.", "danger");
            return;
          }
          
          // NEW: If the teacher is setting a "Ground" floor preference, check the total sections
          if (preferredFloor.trim() === "Ground") {
            // 1) get all teacher‑course assignments
// 1) get all teacher-course assignments
const bctaResp = await batchCourseTeacherAssignmentService.getAllAssignments();
// Only keep non-archived assignments
const allBCTAs = (bctaResp.data || []).filter(a => !a.Archived);

          
            // 2) collect teacher IDs who will end up with a Ground‑floor pref
            const teachersWithGround = new Set(
              roomPrefs
                .filter(rp => rp.Floor.trim() === "Ground")
                .map(rp => rp.Teacher_ID.toString())
            );
            teachersWithGround.add(selectedTeacherId.toString());
          
            // 3) walk all assignments once, collect unique section IDs
            const sectionsSet = new Set();
            allBCTAs.forEach(assignment => {
              const tid = assignment.Teacher_ID.toString();
              if (teachersWithGround.has(tid)) {
                const sec = assignment.Section;
                const sectionId = (typeof sec === "object" ? sec.Section_ID : sec).toString();
                sectionsSet.add(sectionId);
              }
            });
          
            // 4) enforce max‑4‑sections rule
            if (sectionsSet.size > 4) {
              showSnackbar(
                "No more floor constraints can be added due to constraint overload.",
                "danger"
              );
              return;
            }
          }
          
          // Proceed to create the room preference
          const rpPayload = {
            Teacher_ID: parseInt(selectedTeacherId, 10),
            Floor: preferredFloor,
          };
          await roomPreferenceService.create(rpPayload);
        }
        
        
        
for (const sec of timePreferences) {
  // Set default to false in case it's not defined
  const { course, section, day, startTime, endTime, multimedia, speaker, hard_constraint = false, labOrTheory } = sec.values;
  // ─── CREATE MODE HARD‐CONSTRAINT OVERLAP CHECK ───
if (hard_constraint) {
  const overlap = coursePrefs.find(cp =>
    cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
    cp.Day === day &&
    cp.Hard_constraint === true &&
    (
      cp.Start_time.slice(0,5) === startTime
      // 2) exact end match
      || cp.End_time.slice(0,5) === endTime||
      (cp.Start_time.slice(0,5) === "08:30" && cp.End_time.slice(0,5) === "10:10"
        && startTime === "09:20" && endTime === "11:00")
      || (cp.Start_time.slice(0,5) === "09:20" && cp.End_time.slice(0,5) === "11:00"
        && startTime === "08:30" && endTime === "10:10")
      || (cp.Start_time.slice(0,5) === "02:00" && cp.End_time.slice(0,5) === "03:40"
        && startTime === "02:50" && endTime === "04:30")
      || (cp.Start_time.slice(0,5) === "02:50" && cp.End_time.slice(0,5) === "04:30"
        && startTime === "02:00" && endTime === "03:40")
    )
  );
  if (overlap) {
    showSnackbar(
      "This teacher can only have one hard preferences on the same day and time.",
      "danger"
    );
    return;
  }
}

  if (!labOrTheory) continue;
  if (labOrTheory.toLowerCase() === "theory") {
    // Retrieve course to check credit hours
    const courseObj = courses.find(c => c.Course_ID.toString() === course);
    if (!courseObj) {
      showSnackbar("Course not found.", "danger");
      return;
    }
    const credit = parseInt(courseObj.Credit_hours, 10);
    let allowedSlots = 0;
    if (credit === 2) {
      allowedSlots = 2; // For 2 credit hours: 2 theory slots allowed
    } else if (credit === 3 || credit === 4) {
      allowedSlots = 3; // For 3/4 credit hours: 3 theory slots allowed
    } else {
      showSnackbar("Invalid credit hours for course.", "danger");
      return;
    }

    // Define the standard base times array (must match your existing time options)
    const baseTimes = ["08:30", "09:20", "10:10","11:00" ,"11:30", "12:20","01:10" ,"02:00", "02:50", "03:40", "04:30"];
    const startIndex = baseTimes.indexOf(startTime);
    const endIndex = baseTimes.indexOf(endTime);
    console.log(endIndex)

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      showSnackbar("Invalid time selection.", "danger");
      return;
    }
    // Determine how many slots this new preference covers:
    // If the end time is exactly the next slot after startTime, it is a single slot (1)
    // If it is two positions later, it is consecutive (2)
    const newPrefSlots = (endIndex - startIndex === 1) ? 1 : (endIndex - startIndex === 2 ? 2 : 0);
    if (newPrefSlots === 0) {
      showSnackbar("Preference must be either one slot or two consecutive slots.", "danger");
      return;
    }
    // NEW (Editing): Enforce slot-type rules for theory preferences based on credit hours
    if (credit === 2) {
      if (newPrefSlots !== 2) {
        showSnackbar("For 2 credit courses, only consecutive (2-slot) theory preferences are allowed.", "danger");
        return;
      }
    } else if (credit === 3 || credit === 4) {
      const existingOther = coursePrefs.filter(cp =>
        cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
        cp.Course_ID.toString() === course &&
        cp.Section.toString() === section &&
        cp.Lab_or_Theory.toLowerCase() === "theory" &&
        cp.Day !== day
      );
      if (existingOther.length === 1) {
        const ex = existingOther[0];
        const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
        const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
        const existingType = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
        if (existingType === newPrefSlots) {
          showSnackbar("For 3/4 credit courses, if one theory entry is single-slot, the second must be consecutive (or vice versa).", "danger");
          return;
        }
      } else if (existingOther.length > 1) {
        showSnackbar("Maximum theory preferences for this course and section have been reached.", "danger");
        return;
      }
    }

    // Check same-day conflict: cannot mix consecutive and single on the same day for the same course & section
    const existingSameDay = coursePrefs.filter(cp =>
      cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
      cp.Course_ID.toString() === course &&
      cp.Section.toString() === section &&
      cp.Lab_or_Theory.toLowerCase() === "theory" &&
      cp.Day === day
    );
    if (existingSameDay.length > 0) {
      for (const ex of existingSameDay) {
        const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
        const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
        const exSlots = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
        if (exSlots !== newPrefSlots) {
          showSnackbar("Cannot set theory consecutive and single preferences on the same day for the same course and section.", "danger");
          return;
        } else {
          showSnackbar("A theory preference for this course and section on that day already exists.", "danger");
          return;
        }
      }
    }

    // Sum up all theory slots already set for this teacher, course, and section (across any day)
    const existingAll = coursePrefs.filter(cp =>
      cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
      cp.Course_ID.toString() === course &&
      cp.Section.toString() === section &&
      cp.Lab_or_Theory.toLowerCase() === "theory"
    );
    let totalSlots = 0;
    for (const ex of existingAll) {
      const exStart = baseTimes.indexOf(ex.Start_time.slice(0, 5));
      const exEnd = baseTimes.indexOf(ex.End_time.slice(0, 5));
      const exSlots = (exEnd - exStart === 1) ? 1 : (exEnd - exStart === 2 ? 2 : 0);
      totalSlots += exSlots;
    }
    if (totalSlots + newPrefSlots > allowedSlots) {
      showSnackbar("Setting this theory preference would exceed allowed slots for this course.", "danger");
      return;
    }
  } else if (labOrTheory.toLowerCase() === "lab") {
    // For lab: only one entry allowed per teacher/course/section.
    const existingLab = coursePrefs.find(cp =>
      cp.Teacher_ID.toString() === selectedTeacherId.toString() &&
      cp.Course_ID.toString() === course &&
      cp.Section.toString() === section &&
      cp.Lab_or_Theory.toLowerCase() === "lab"
    );
    if (existingLab) {
      showSnackbar("A lab preference for this course and section already exists.", "danger");
      return;
    }
  }
  // ------------------ End new theory/lab validation ------------------
  // Check for duplicate only if this new entry is a hard constraint

      // ── HARDCODED OVERLAP PREVENTION ──
  // (must come before your `duplicate` check)
  if (hard_constraint) {
    const bad = coursePrefs.find(cp => cp.Hard_constraint === true && (
      // existing hard 8:30–10:10 blocks 9:20–11:00
      (cp.Start_time.slice(0,5) === "08:30" && cp.End_time.slice(0,5) === "10:10"
        && startTime === "09:20" && endTime === "11:00")
      // existing hard 9:20–11:00 blocks 8:30–10:10
      || (cp.Start_time.slice(0,5) === "09:20" && cp.End_time.slice(0,5) === "11:00"
        && startTime === "08:30" && endTime === "10:10")
      // existing hard 2:00–3:40 blocks 2:50–4:30
      || (cp.Start_time.slice(0,5) === "02:00" && cp.End_time.slice(0,5) === "03:40"
        && startTime === "02:50" && endTime === "04:30")
      // existing hard 2:50–4:30 blocks 2:00–3:40
      || (cp.Start_time.slice(0,5) === "02:50" && cp.End_time.slice(0,5) === "04:30"
        && startTime === "02:00" && endTime === "03:40")
    ));
    if (bad) {
      showSnackbar(
        "Another hard preference overlaps with your selected time.",
        "danger"
      );
      return;
    }
  }
  // ─────────────────────────────────────

    const duplicate = coursePrefs.find((cp) =>
      cp.Section.toString() === section.toString() &&    cp.Day === day &&
      (cp.Start_time.slice(0, -3) === startTime || cp.End_time.slice(0, -3) === endTime) &&
      cp.Hard_constraint === true 
      // cp.Lab_or_Theory === labOrTheory
    );

    
    if (duplicate) {
      console.log("Duplicate found:", duplicate);
      showSnackbar("Another hard preference is already set at this time.", "danger");
      return; // Stop processing the submission
    }
  

  
  // Continue with your existing teacher course validation:
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
  const filteredRoomPrefs = roomPrefs.filter(rp =>
    Object.values([
      rp.Room_Preference_ID ?? rp.Preference_ID,
      `${rp.Teacher_ID} - ${teachers.find(t => t.Teacher_ID.toString() === rp.Teacher_ID.toString())?.Name || ""}`,
      rp.Floor || ""
    ]).join(" ").toLowerCase().includes(searchRoomQuery.toLowerCase())
  );
  // Build table rows for Room Preferences
  const roomPrefRows = filteredRoomPrefs.map((rp) => {
    const pk = rp.Room_Preference_ID || rp.Preference_ID;
    const teacherObj = teachers.find(
      (t) => t.Teacher_ID.toString() === rp.Teacher_ID.toString()
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${rp.Teacher_ID} - ???`;
    return [pk, teacherLabel, rp.Floor || "", pk];
  });
  const filteredCoursePrefs = coursePrefs.filter(cp =>
    Object.values([
      cp.Preference_ID,
      `${cp.Teacher_ID} - ${teachers.find(t => t.Teacher_ID.toString() === cp.Teacher_ID.toString())?.Name || ""}`,
      courses.find(c => c.Course_ID.toString() === cp.Course_ID.toString())?.Course_name || "",
      cp.Day
    ]).join(" ").toLowerCase().includes(searchCourseQuery.toLowerCase())
  );
  // Build table rows for Course Preferences
  const coursePrefRows = filteredCoursePrefs.map((cp) => {
    const pk = cp.Preference_ID || cp.CoursePref_ID;
    const teacherObj = teachers.find(
      (t) => t.Teacher_ID.toString() === cp.Teacher_ID.toString()
    );
    const teacherLabel = teacherObj
      ? `${teacherObj.Teacher_ID} - ${teacherObj.Name}`
      : `${cp.Teacher_ID} - ???`;
    const cObj = courses.find((c) => c.Course_ID.toString() === cp.Course_ID.toString());
    const courseName = cObj ? cObj.Course_name : `Unknown(${cp.Course_ID})`;
    const sectionObj = availableSections.find(
      (s) => s.Section_ID.toString() === cp.Section.toString()
    );
    // NEW: Find the corresponding batch using batches state
    const batchObj = sectionObj ? batches.find(
      (b) => b.Batch_ID.toString() === sectionObj.Batch_ID.toString()
    ) : null;
    // NEW: Create display string "Batch_name - Section_name"
    const sectionDisplay = sectionObj
      ? `${batchObj ? batchObj.Batch_name : ''} - ${sectionObj.Section_name}`
      : cp.Section;
    return [
      pk,
      teacherLabel,
      courseName,
      cp.Day, // Day value
      sectionDisplay,
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
  // console.log(teacherCourses)
  const fieldsTime = [
    {
      componentType: "SingleDropdown",
      label: "Course",
      name: "course",
      required: true,
      options: teacherCourses.map((tc) => tc.courseID),
      getOptionLabel: (cid) => {
        const obj = teacherCourses.find((tc) => tc.courseID === cid);
        if (!obj) return `Course ${cid}`;
        // Get the sections associated with this course (if any)
        const sections = teacherSectionsByCourse[cid] || [];
        // Extract unique batch codes (first 4 characters) from the section options.
        const batchCodes = Array.from(new Set(
          sections.map(opt => {
            const batchName = opt.label.split(' - ')[0] || '';
            return batchName.slice(0, 4);
          })
        ));
        const displayCodes = batchCodes.length > 0
          ? batchCodes.join(',')
          : 'Archived';
        return `${obj.courseName} (${displayCodes})`;
      },
    },
    
    {
      componentType: "SingleDropdown",
      label: "Section",
      name: "section",
      required: true,
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
      componentType: "SingleDropdown",
      label: "Class Type",
      name: "labOrTheory",
      required: true,
      // Now use the array of strings (e.g. ["lab", "theory"])
      options: classTypeOptions,
      // When displaying an option, capitalize it.
      getOptionLabel: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "",
      // The value is a string.
      getOptionValue: (value) => value,
    },
    
    
    
    {
      componentType: "SingleDropdown",
      label: "Day",
      name: "day",
      required: true,
      options: (() => {
        const selectedCourse = timePreferences[0]?.values.course || "";
        const selectedSection = timePreferences[0]?.values.section || "";
        const selectedType = timePreferences[0]?.values.labOrTheory || "";
        if (!selectedCourse || !selectedSection || !selectedType) return [];
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      })(),
      getOptionLabel: (val) => val,
    },
    
    
    {
      componentType: "SingleDropdown",
      label: "Start time",
      name: "startTime",
      required: true,
      options: (() => {
        const selectedCourse = timePreferences[0]?.values.course || "";
        const selectedSection = timePreferences[0]?.values.section || "";
        const selectedType = timePreferences[0]?.values.labOrTheory || "";
        if (!selectedCourse || !selectedSection || !selectedType) return [];
        const base = ["08:30", "09:20", "10:10", "11:30", "12:20", "02:00", "02:50", "03:40"];
        const isLab = selectedType === "lab";
        return isLab ? base.filter(t => t !== "10:10" && t !== "12:20" && t !== "03:40") : base;
      })(),
    },
    
    
    
    {
      componentType: "SingleDropdown",
      label: "End time",
      name: "endTime",
      required: true,
      options: (() => {
        const selectedCourse = timePreferences[0]?.values.course || "";
        const selectedSection = timePreferences[0]?.values.section || "";
        const selectedType = timePreferences[0]?.values.labOrTheory || "";
        if (!selectedCourse || !selectedSection || !selectedType) return [];
        const startTimes = ["08:30", "09:20", "10:10", "11:30", "12:20", "02:00", "02:50", "03:40"];
        const endTimes   = ["09:20", "10:10", "11:00", "12:20", "01:10", "02:50", "03:40", "04:30"];
        const start = timePreferences[0]?.values.startTime || "";
        if (!start) return [];
        const idx = startTimes.indexOf(start);
        if (idx === -1) return [];
        const isLab = selectedType === "lab";
        const options = [];
        if (isLab) {
          // For Lab: skip the immediate next slot and use the following one
          if (idx + 1 < endTimes.length) options.push(endTimes[idx + 1]);
        } else {
          // For Theory: provide the next slot(s)
          if (start === "10:10" || start === "12:20") {
            if (idx + 1 < endTimes.length) options.push(endTimes[idx ]);
          } else {
            if (idx < endTimes.length) options.push(endTimes[idx]);
            if (idx + 1 < endTimes.length) options.push(endTimes[idx + 1]);
          }
        }
        return options;
      })(),
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

  
  const tabLabels = isEditing 
  ? ["View list of Room Preferences","View list of Class Time Preferences" ,"Editing Preference"] 
  : ["View list of Floor Preferences","View list of Class Time Preferences"  ,"Enter new Preference"];

  const roomPrefTable = (
    <>
    <Box sx={{ mb: 2, maxWidth: 200 }}>
      <TextField
        label="Search room prefs..."
        fullWidth
        value={searchRoomQuery}
        onChange={e => setSearchRoomQuery(e.target.value)}
      />
    </Box>
    <Tables
      tableHeadings={roomTableHeadings}
      tableRows={roomPrefRows}
      onDelete={handleRoomDeleteClick}
      onEdit={handleRoomEditClick}
    />
  </>
  );
  const coursePrefTable = (
    <>
      <Box sx={{ mb: 2, maxWidth: 200}}>
        <TextField
          label="Search course prefs..."
          fullWidth
          value={searchCourseQuery}
          onChange={e => setSearchCourseQuery(e.target.value)}
        />
      </Box>
      <Tables
        tableHeadings={courseTableHeadings}
        tableRows={coursePrefRows}
        onDelete={handleCourseDeleteClick}
        onEdit={handleCourseEditClick}
      />
    </>
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
            // boxShadow: 4,
            backgroundColor: "transparent",
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
                console.log(newVal)
                setSelectedTeacherId(newVal);
                handleTeacherChange(newVal);
              }}
            />
          </FormControl>

          {/* Floor */}
          <FormControl fullWidth>
            <Singledropdown
              label="Hard Floor Constraint (Optional)"
              name="preferredFloor"
              value={preferredFloor}
              menuItems={[
                { label: "Ground", value: "Ground" },
               
              ]}
              onChange={(newVal) => {
                setPreferredFloor(newVal);
              }}
            />
          </FormControl>

          {editType !== "room" && (
  <Box sx={{ gridColumn: "span 2", mt: 2 }}>
    <DynamicForm
      fields={fieldsTime}
      sectionTitle="Preference"
      getSectionTitle={getSectionTitle}
      addButtonText="Add new preference"
      hideAddButton={timePreferences.length > 0}
      onPreferencesChange={handleTimePreferencesChange}
      initialSections={timePreferences}
    />
  </Box>
)}


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
  
      <Box sx={{ position: 'relative' }}>
      <TeacherTabs
        tabLabels={tabLabels}
        tabContent={tabContent}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />
      
      {/* Add Stop Editing button */}
      {isEditing && (
        <Button
          variant="contained"
          
          onClick={handleStopEditing}
          sx={{
            position: 'absolute',
            top: 40,
            right: 360,
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: 2,
            px: 3,
            py: 1
          }}
        >
          Stop Editing
        </Button>
      )}
    </Box>
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
