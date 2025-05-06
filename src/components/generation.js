import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";
import { Alert, Box, CircularProgress, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import Button from "@mui/joy/Button";
import Timetable from "./designelements/timetable";

// Services – ensure these are implemented in your project
import generationService from "./api/generationService";
import teacherService from "./api/teacherService";
import roomService from "./api/roomService";
import courseService from "./api/courseService";
import sectionService from "./api/sectionService";
import batchService from "./api/batchService";
import teacherCourseAssignmentService from "./api/teacherCourseAssignmentService";
import batchCourseTeacherAssignmentService from "./api/batchCourseTeacherAssignmentService";
import coursePreferenceService from "./api/courseTimePreferenceService";
import GeneratedTimetables from "./designelements/generatedTimetables";
import GenerationDescriptionModal from "./designelements/generationDescriptionModal";
import apiClient from "./api/apiClient";
import CustomSnackbar from "./designelements/alert";
import { TextField } from "@mui/material"; 
import AlertDialogModal from "./designelements/modal";
import roomPreferenceService from "./api/roomPreferenceService";

const alternateDayMap = {
  0: [2],     // Monday (0) cannot be disabled with Wednesday (2)
  1: [3],     // Tuesday (1) cannot be disabled with Thursday (3)
  2: [0, 4],  // Wednesday (2) cannot be disabled with Monday (0) or Friday (4)
  3: [1],     // Thursday (3) cannot be disabled with Tuesday (1)
  4: [2]      // Friday (4) cannot be disabled with Wednesday (2)
};
// A helper to normalize time strings to "HH:MM:SS" format
const normalizeTime = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  let hour = parseInt(parts[0]);
  const minute = parts[1] || "00";
  const second = parts[2] || "00";

  // If the hour is less than 6, assume it's the next day (after midnight)
  // if (hour < 6) {
  //   hour += 24;
  // }

  return `${String(hour).padStart(2, "0")}:${minute}:${second}`;
};


const adjustEndTime = (startStr, endStr) => {
  const start = normalizeTime(startStr);
  let end = normalizeTime(endStr);
  const [startHour] = start.split(":").map(Number);
  let [endHour, endMin, endSec] = end.split(":").map(Number);
  // If end hour is less than start hour, assume it's PM and add 12 hours.
  if (endHour < startHour) {
    endHour += 12;
  }
  return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:${String(endSec).padStart(2, "0")}`;
};

function Generation() {
  // State for fetched data
  const [selectedGeneration, setSelectedGeneration] = useState(null);
const [activeTab, setActiveTab] = useState(0);
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarColor, setSnackbarColor] = useState("neutral"); // neutral, success, danger, info

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labRooms, setLabRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tcaList, setTcaList] = useState([]);
  const [bctaList, setBctaList] = useState([]);
  const [coursePrefs, setCoursePrefs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  // Additional states
  const [lockedSlots, setLockedSlots] = useState([]);
  const [disabledDays, setDisabledDays] = useState({});
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [roomPrefs, setRoomPrefs] = useState([]);
  const [dummyOption, setDummyOption] = useState("option1");
  const [generationOption, setGenerationOption] = useState(1);

  // Save the timetable status ("draft" or "published") that triggered the modal
  const [timetableStatus, setTimetableStatus] = useState("");
  // Fetch all required data on mount
  const [academicYearInput, setAcademicYearInput] = useState("2024-2025");
const [currentAcademicYear, setCurrentAcademicYear] = useState(
  parseInt(academicYearInput.split("-")[1], 10)
);
  // const currentAcademicYear = 2025;
  const initiateSaveTimetable = (status) => {
    setTimetableStatus(status);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          teachRes,
          roomRes,
          sectionRes,
          batchRes,
          courseRes,
          tcaRes,
          bctaRes,
          coursePrefsRes,
          roomPrefsRes
        ] = await Promise.all([
          teacherService.getAllTeachers(),
          roomService.getAllRooms(),
          sectionService.getAllSections(),
          batchService.getAllBatches(),
          courseService.getAllCourses(),
          teacherCourseAssignmentService.getAllAssignments(),
          batchCourseTeacherAssignmentService.getAllAssignments(),
          coursePreferenceService.getAll(),
          roomPreferenceService.getAll()  // fetch time preferences
        ]);

        // console.log("Fetched Teachers:", teachRes.data);
        // console.log("Fetched Rooms:", roomRes.data);
        // console.log("Fetched Sections:", sectionRes.data);
        // console.log("Fetched Batches:", batchRes.data);
        // console.log("Fetched Courses:", courseRes.data);
        // console.log("Fetched TCA:", tcaRes.data);
        // console.log("Fetched BCTA:", bctaRes.data);
        setRoomPrefs(roomPrefsRes.data || []);

        setTeachers(teachRes.data || []);
          const liveRooms = roomRes.data.filter(r => r.Room_status !== "disable");
        
          setRooms(
            liveRooms.filter(r => r.Room_type.toLowerCase() === "classroom")
          );
          setLabRooms(
            liveRooms.filter(r => r.Room_type.toLowerCase() === "lab")
          );
        setSections(sectionRes.data || []);
        setBatches(batchRes.data || []);
        setCourses(courseRes.data || []);
        setTcaList(tcaRes.data || []);
         setBctaList(
             (bctaRes.data || []).filter(assignment => assignment.Archived !== true)
           );
        setCoursePrefs(coursePrefsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // --- MAPPING FUNCTIONS ---

  const formatRooms = (roomsArr) =>
    roomsArr.reduce((acc, room) => {
      acc[String(room.Room_ID)] = {
        floor: room.Floor,
        has_speaker: room.Speaker,
        has_multimedia: room.Multimedia,
      };
      return acc;
    }, {});

  const mapTeacherAssignments = () => {
    const teacherAssignments = {};
    teachers.forEach((teacher) => {
      const tid = teacher.Teacher_ID ? String(teacher.Teacher_ID) : (teacher.id ? String(teacher.id) : '');
      teacherAssignments[tid] = {
        id: tid,
        name: teacher.Name,
        assignments: [],
        floor_pref: (() => {
          const teacherRoomPref = roomPrefs.find(rp => String(rp.Teacher_ID) === tid);
          return teacherRoomPref
            ? teacherRoomPref.Floor.toLowerCase() === 'ground'
                ? [0, true]
                : [teacherRoomPref.Floor, teacherRoomPref.is_hard]
            : [null, false];
        })(),
        time_prefs: [],
      };
      
    });
    tcaList.forEach((tca) => {
      const teacherObj = tca.Teacher_ID;
      const courseObj = tca.Course_ID;
      if (!teacherObj || !courseObj) return;
      const tid = teacherObj && teacherObj.Teacher_ID ? String(teacherObj.Teacher_ID) : String(teacherObj);
      const matchedCourse = courses.find(
        (c) => String(c.Course_ID) === String(courseObj)
      );
      let discipline = "Unknown";
      let batchId = null;
      let sectionId = null;
      let year = null;
      let sectionIndex = null;
      if (matchedCourse) {
        let batchObj = null;
        if (typeof matchedCourse.Batch_ID === "object") {
          batchObj = matchedCourse.Batch_ID;
        } else {
          batchObj = batches.find(
            (b) => String(b.Batch_ID) === String(matchedCourse.Batch_ID)
          );
        }
        if (batchObj) {
          discipline = batchObj.Discipline;
          batchId = batchObj.Batch_ID; // for response
          year = batchObj.Year ? currentAcademicYear-batchObj.Year  : 1;
          const sectionsForBatch = sections.filter((s) => String(s.Batch_ID) === String(batchObj.Batch_ID));
          const sectionIdToFind = tca.Section_ID;
          const matchingSection = sectionsForBatch.find((s) => 
            String(s.Section_ID) === String(sectionIdToFind) // No fallback
          );
          
          // Handle missing section explicitly
          if (!matchingSection) {
            console.error(`Section ${sectionIdToFind} not found for TCA`);
            return; // Skip invalid assignment
          }
          sectionIndex = sectionsForBatch.indexOf(matchingSection);          if (matchingSection) {
            sectionId = matchingSection.Section_ID;
            sectionIndex = sectionsForBatch.findIndex((s) => String(s.Section_ID) === String(matchingSection.Section_ID));
          } else if (sectionsForBatch.length > 0) {
            sectionId = sectionsForBatch[0].Section_ID;
            sectionIndex = 0;
          }
        }
      }
      if (teacherAssignments[tid]) {
        teacherAssignments[tid].assignments.push([
          discipline,
          batchId,                  // preserved for response
          year,                     // actual year (1, 2, etc.)
          sectionIndex,             // section index (0, 1, etc.)
          courseObj.Course_name || (matchedCourse && matchedCourse.Course_name) || "Default Course",
          tca.Teacher_type || "theory",
        ]);
      }
    });
      
    bctaList.forEach((bcta) => {
      const teacherObj = bcta.Teacher_ID;
      const courseObj = bcta.Course_ID;
      if (!teacherObj || !courseObj) return;
      const tid = teacherObj && teacherObj.Teacher_ID ? String(teacherObj.Teacher_ID) : String(teacherObj);
      const matchedCourse = courses.find(
        (c) => String(c.Course_ID) === String(courseObj)
      );
      let discipline = "Unknown";
      let batchId = null;
      let year = null;
      if (matchedCourse) {
        let batchObj = null;
        if (typeof matchedCourse.Batch_ID === "object") {
          batchObj = matchedCourse.Batch_ID;
        } else {
          batchObj = batches.find(
            (b) => String(b.Batch_ID) === String(matchedCourse.Batch_ID)
          );
        }
        if (batchObj) {
          discipline = batchObj.Discipline;
          batchId = batchObj.Batch_ID;  // for response
          year = batchObj.Year ? currentAcademicYear-batchObj.Year  : 1;
        }
      }
      let sectionId = null;
      let sectionIndex = null;
      const sectionsForBatch = sections.filter((s) => String(s.Batch_ID) === String(batchId));
      if (bcta.Section) {
        sectionId = bcta.Section.Section_ID ? bcta.Section.Section_ID : bcta.Section;
        sectionIndex = sectionsForBatch.findIndex((s) => String(s.Section_ID) === String(sectionId));
        if (sectionIndex === -1) sectionIndex = 0;
      }
      if (teacherAssignments[tid]) {
        teacherAssignments[tid].assignments.push([
          discipline,
          batchId,                  // for response
          year,                     // actual year
          sectionIndex,             // section index
          courseObj.Course_name || (matchedCourse && matchedCourse.Course_name) || "Default Course",
          bcta.Course_type || "theory",
        ]);
      }
    });
      
    Object.keys(teacherAssignments).forEach((tid) => {
      const unique = [];
      teacherAssignments[tid].assignments.forEach((assignment) => {
        if (
          !unique.some(
            (a) =>
              a[0] === assignment[0] &&
              a[1] === assignment[1] &&
              a[2] === assignment[2] &&
              a[3] === assignment[3] &&
              a[4] === assignment[4] &&
              a[5] === assignment[5]
          )
        ) {
          unique.push(assignment);
        }
      });
      teacherAssignments[tid].assignments = unique;
    });
    const teacherTimePrefs = {};
    coursePrefs.forEach((cp) => {
      const tid = String(cp.Teacher_ID?.Teacher_ID || cp.Teacher_ID);
      if (!teacherTimePrefs[tid]) teacherTimePrefs[tid] = [];
     
      
      // Normalize the teacher's times:
      const normalizedStart = normalizeTime(cp.Start_time); // e.g. "08:30:00"
      const normalizedEnd = normalizeTime(cp.End_time);       // e.g. "09:20:00"
      console.log(normalizedStart)
      // Find the indices:
      let start_slot_index = timeslotBoundaries.indexOf(normalizedStart);
      let end_slot_index = timeslotBoundaries.indexOf(normalizedEnd) - 1;
      if (start_slot_index > timeslotBoundaries.indexOf("01:10:00")) {
        start_slot_index -= 1; // Adjust to skip "1:10"
      }
      if (end_slot_index > timeslotBoundaries.indexOf("01:10:00")) {
        end_slot_index -= 1; // Adjust to skip "1:10"
      }
      let courseName = "Default Course";
      if (cp.Course_ID) {
        const foundCourse = courses.find(
          (c) => String(c.Course_ID) === String(cp.Course_ID)
        );
        if (foundCourse && foundCourse.Course_name) {
          courseName = foundCourse.Course_name;
        }
      }

      let discipline = "Unknown";
      let year = 1;
      let computedSectionIndex = 0;
      if (cp.Course_ID) {
        const foundCourse = courses.find((c) => String(c.Course_ID) === String(cp.Course_ID));
        if (foundCourse) {
          let batchObj;
          if (typeof foundCourse.Batch_ID === "object") {
            batchObj = foundCourse.Batch_ID;
          } else {
            batchObj = batches.find((b) => String(b.Batch_ID) === String(foundCourse.Batch_ID));
          }
          if (batchObj) {
            discipline = batchObj.Discipline;
            year = batchObj.Year ? currentAcademicYear - batchObj.Year : 1;
            // Use the discipline info mapping to get the section index from the sections array.
            const disciplineKey = `${batchObj.Discipline}, ${year}`;
            const discInfo = mapDisciplineInfo()[disciplineKey];
            if (discInfo && discInfo.sections) {
              // Use cp.Section if provided; otherwise default to 0.
              computedSectionIndex =
                cp.Section !== undefined
                  ? discInfo.sections.findIndex(
                      (sectionId) => String(sectionId) === String(cp.Section)
                    )
                  : 0;
              if (computedSectionIndex === -1) computedSectionIndex = 0;
            }
          }
        }
      }
      teacherTimePrefs[tid].push({
        course_name: courseName,
        course_type: cp.Lab_or_Theory || "theory",
        day: cp.Day ? cp.Day.slice(0, 3) : "Mon",
        start_slot_index,
        end_slot_index,
        needs_speaker: cp.Speaker || false,
        needs_multimedia: cp.Multimedia_requirement || false,
        is_hard: cp.Hard_constraint || false,
        batch: [discipline, year],  // New attribute as a tuple
        section: computedSectionIndex
      });
    });
    Object.keys(teacherAssignments).forEach((tid) => {
      teacherAssignments[tid].time_prefs = teacherTimePrefs[tid] || [];
    });
    return teacherAssignments;
  };
  const timeslotBoundaries = [
    "08:30:00", // slot 0 start
    "09:20:00", // slot 1 start
    "10:10:00", // slot 2 start
    "11:30:00", // slot 3 start (after the 11:00-11:30 break)
    "12:20:00", // slot 4 start
    "01:10:00",
    "02:00:00", // slot 5 start (after the 1:10-2:00 break)
    "02:50:00", // slot 6 start
    "03:40:00"  // slot 7 start
  ];

  const timeToMinutes = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const mapDisciplineInfo = () => {
    const disciplineInfo = {};
    batches.forEach((batch) => {
      // console.log("BATCH YEARRRR", batch.Year)
      // Calculate year as provided (e.g., 1 means 1st year)
      const year = batch.Year ? currentAcademicYear- batch.Year  : 1;
      // console.log("YEARRR", year)
      const key = `${batch.Discipline}, ${year}`;
// after: only include courses in this batch that are not archived
const batchCourses = courses.filter((course) => {
  // figure out the batch‐id on the course object
  const courseBatchId =
    typeof course.Batch_ID === "object"
      ? course.Batch_ID.Batch_ID
      : course.Batch_ID;
  // only include if it matches this batch AND isn’t archived
  return courseBatchId === batch.Batch_ID && course.Archived !== true;
});

      const batchSections = sections.filter((section) => {
        if (typeof section.Batch_ID === "object") {
          return section.Batch_ID.Batch_ID === batch.Batch_ID;
        }
        return section.Batch_ID === batch.Batch_ID;
      });
      disciplineInfo[key] = {
        batch_id: batch.Batch_ID,
        num_sections: batchSections.length,
        sections: batchSections.map((s) => s.Section_ID),
        courses: batchCourses.map((c) => ({
          id: c.Course_ID,
          name: c.Course_name,
          credit_hours: c.Credit_hours,
          is_lab: c.Is_Lab,
        })),
      };
    });
    return disciplineInfo;
  };

  const mapLockedSlots = () => {
    if (!generatedData || !generatedData.timetable_details) return [];
  
    // Get the discipline info mapping (if not already cached, you might want to cache this)
    const disciplineInfoMapping = mapDisciplineInfo();
  
    return lockedSlots.map((lockKey) => {
      const [timetableId, dayIndex, timeIndex] = lockKey.split("-");
  
      // 1. Find the timetable header using the locked timetableId
      const header = generatedData.timetable_headers.find(
        (h) => String(h.Timetable_ID) === String(timetableId)
      );
  
      // 2. Get all details for this timetable
      const timetableDetails = generatedData.timetable_details.filter(
        (d) => String(d.Timetable_ID) === String(timetableId)
      );
  
      // 3. Find the detail that covers this timeslot
      
      let labDetail = null;
      let theoryDetail = null;
      const lockedDay = dayNames[parseInt(dayIndex)]; // Convert dayIndex to day name
      for (const detail of timetableDetails) {
        // First check if the detail's day matches the locked day
        if (detail.Day !== lockedDay) continue;
        
        const coveredSlots = getCoveredSlots(
          detail.Start_time || detail.Start_Time,
          detail.End_time || detail.End_Time
        );
        if (coveredSlots.includes(parseInt(timeIndex))) {
          if (detail.Theory_or_Lab === "lab") {
            labDetail = detail;
          } else {
            theoryDetail = detail;
          }
        }
      }
const targetDetail = labDetail || theoryDetail;

      // console.log("TARGETTT DETAILLL", targetDetail)
  
      // 4. Get the batch and section info from header
      const section = sections.find((s) =>
        String(s.Section_ID) === String(header?.Section_ID)
      );
      const batch = batches.find((b) =>
        String(b.Batch_ID) === String(header?.Batch_ID)
      );
  
      // 5. Compute the discipline key as used in mapDisciplineInfo
      const computedYear = batch?.Year ? currentAcademicYear - batch.Year : 1;
      const disciplineKey = `${batch?.Discipline || "Unknown"}, ${computedYear}`;
  
      // 6. Get the discipline info object and then find the index of the section
      let sectionIndex = 0;
      const discInfo = disciplineInfoMapping[disciplineKey];
      if (discInfo && discInfo.sections) {
        const foundIndex = discInfo.sections.findIndex(
          (id) => String(id) === String(section?.Section_ID)
        );
        sectionIndex = foundIndex !== -1 ? foundIndex : 0;
      }
  
      // 7. Get course code from targetDetail
      let scode = "UNKNOWN_COURSE";
if (targetDetail && targetDetail.Course_ID) {
  const course = courses.find(
    (c) => String(c.Course_ID) === String(targetDetail.Course_ID)
  );
  if (course) {
    // If the course is a lab, use the lab suffix.
    if (targetDetail.Theory_or_Lab === "lab") {
      scode = course.Course_name + "_L2Cons";
    } else {
      // For theory courses, compute the covered slots.
      const slots = getCoveredSlots(
        targetDetail.Start_time || targetDetail.Start_Time,
        targetDetail.End_time || targetDetail.End_Time
      );
      // If there are consecutive slots, use the T2Cons suffix; otherwise T1Sep.
      if (slots.length > 1) {
        scode = course.Course_name + "_T2Cons";
      } else {
        scode = course.Course_name + "_T1Sep";
      }
    }
  }
}
  
      return {
        disc: batch?.Discipline || "Unknown",
        year: computedYear,
        section: sectionIndex, // <-- now using the index from the discipline info's sections array
        scode,
        day: ["Mon", "Tue", "Wed", "Thu", "Fri"][parseInt(dayIndex)],
        timeslot: parseInt(timeIndex),
      };
    });
  };
  
  
  const mapDataForAlgorithm = () => {
    // Helper to get discipline/year/section_index from timetable ID
    const getDiscYearSection = (timetableId) => {
      const header = generatedData.timetable_headers.find(
        h => String(h.Timetable_ID) === String(timetableId) // Added closing parenthesis here
      );
      if (!header) return null;
  
      const section = sections.find(s => 
        String(s.Section_ID) === String(header.Section_ID) // Added closing parenthesis here
      );
      const batch = batches.find(b => 
        String(b.Batch_ID) === String(section?.Batch_ID || header.Batch_ID) // Added closing parenthesis here
      );
      
      if (!batch) return null;
  
      // Calculate academic year
      const year = currentAcademicYear - batch.Year;
      const discipline = batch.Discipline;
  
      // Get section index within batch
      const batchSections = sections.filter(s => 
        String(s.Batch_ID) === String(batch.Batch_ID) // Added closing parenthesis here
      );
      const sectionIndex = batchSections.findIndex(s => 
        String(s.Section_ID) === String(header.Section_ID)
      );
  
      return { discipline, year, sectionIndex };
    };
  
    // Transform disabled days format
    const transformedDisabledDays = {};
    Object.entries(disabledDays).forEach(([timetableId, dayIndices]) => {
      const keyInfo = getDiscYearSection(timetableId);
      if (!keyInfo) return;
  
      const dayAbbreviations = dayIndices.map(idx => 
        ["Mon", "Tue", "Wed", "Thu", "Fri"][idx]
      );
      
      const tupleKey = `(${keyInfo.discipline}, ${keyInfo.year}, ${keyInfo.sectionIndex})`;
      transformedDisabledDays[tupleKey] = dayAbbreviations;
      console.log("Disabled daysss",transformedDisabledDays)
    });
  
    return {
      rooms: formatRooms(rooms),
      lab_rooms: formatRooms(labRooms),
      teachers: mapTeacherAssignments(),
      discipline_info: mapDisciplineInfo(),
      locked_slots: mapLockedSlots(),
      disabled_days: transformedDisabledDays, // Now in correct format
    };
  };
  
  const getCoveredSlots = (startTime, endTime) => {
    const start = normalizeTime(startTime);
    const end = normalizeTime(endTime);
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(adjustEndTime(startTime, endTime)); // Modified line
    
    const covered = [];
  
    for (let i = 0; i < timeslotsOrder.length; i++) {
      const slot = timeslotsOrder[i];
      const [slotStartStr, slotEndStr] = slot.split('-');
      const slotStart = normalizeTime(slotStartStr + ":00");
      const slotEnd = normalizeTime(adjustEndTime(slotStartStr + ":00", slotEndStr + ":00")); // Modified line
      
      const slotStartMinutes = timeToMinutes(slotStart);
      const slotEndMinutes = timeToMinutes(slotEnd);
  
      if (startMinutes < slotEndMinutes && endMinutes > slotStartMinutes) {
        covered.push(i);
      }
    }
  
    return covered;
  };

  // --- HANDLERS ---
  const validateTeacherAssignments = () => {
    // Build a set of keys for all teacher assignments.
    // We expect each assignment key to be in the format:
    // "discipline|batchId|year|sectionIndex|courseName|teacherType"
    const teacherAssgn = mapTeacherAssignments();
    const assignmentSet = new Set();
    Object.values(teacherAssgn).forEach(teacher => {
      teacher.assignments.forEach(assignment => {
        // assignment is an array as defined above.
        const key = assignment.join('|');
        assignmentSet.add(key);
      });
    });
  
    // Get the discipline info mapping.
    const discInfo = mapDisciplineInfo();
    // Iterate over each discipline key (like "Computer Science, 4")
    for (const [discKey, info] of Object.entries(discInfo)) {
      // Split the key to get discipline and year.
      const [discipline, yearStr] = discKey.split(',').map(s => s.trim());
      const year = parseInt(yearStr, 10);
      const batchId = info.batch_id;
      // For every section (using its index in the sections array)
      for (let sectionIndex = 0; sectionIndex < info.sections.length; sectionIndex++) {
        // For every course in this batch:
        for (const course of info.courses) {
          // For theory, always required.
          const theoryKey = [discipline, batchId, year, sectionIndex, course.name, "theory"].join('|');
              if (!assignmentSet.has(theoryKey)) {
                  // -- skip error if this course in this batch is marked archived --
                  const courseRecord = courses.find(c =>
                    c.Course_ID === course.id &&
                    (typeof c.Batch_ID === 'object'
                       ? c.Batch_ID.Batch_ID
                       : c.Batch_ID) === batchId
                  );
                  if (courseRecord?.Archived) {
                    continue;  // go on to the next course without throwing
                  }
            
                  // otherwise fall through and return the error
                  const sectionId   = info.sections[sectionIndex];
                  const sectionObj  = sections.find(s => String(s.Section_ID) === String(sectionId));
                  const batchObj    = batches .find(b => String(b.Batch_ID)   === String(batchId));
                  const sectionName = sectionObj?.Section_name ?? `Section ${sectionIndex + 1}`;
                  const batchName   = batchObj?.Batch_name   ?? batchId;
                  return `${sectionName} (${batchName}) is missing a THEORY teacher for course ${course.name}`;
                }
          // For courses that have a lab component, also require a lab teacher.
          if (course.is_lab) {
                    const courseRecord = courses.find(c =>
                        c.Course_ID === course.id &&
                        (typeof c.Batch_ID === 'object'
                           ? c.Batch_ID.Batch_ID
                           : c.Batch_ID) === batchId
                      );
                      if (courseRecord?.Archived) {
                        continue;
                      }
            
            const labKey = [discipline, batchId, year, sectionIndex, course.name, "lab"].join('|');
            const sectionId = info.sections[sectionIndex];
            const sectionObj = sections.find(s => String(s.Section_ID) === String(sectionId));
            const batchObj = batches.find(b => String(b.Batch_ID) === String(batchId));
            const sectionName = sectionObj?.Section_name ?? `Section ${sectionIndex + 1}`;
            const batchName = batchObj?.Batch_name ?? batchId;if (!assignmentSet.has(labKey)) {
              return `${sectionName} of ${discipline} (${batchName}) is missing a LAB teacher for course ${course.name}`;
            }
          }
        }
      }
    }
    return null; // All good.
  };
  
  const handleGenerate = async () => {
    try {
      setLoading(true);
      if (tcaList.length === 0 && bctaList.length === 0) {
        setSnackbarMessage("No teacher has been assigned to any batch and course.");
        setSnackbarColor("danger");
        setSnackbarOpen(true);
        setLoading(false);
        return; // Stop further processing
      }
      
      // Check if no rooms exist (both classroom and lab rooms)
      if (rooms.length === 0 && labRooms.length === 0) {
        setSnackbarMessage("No rooms exists.");
        setSnackbarColor("danger");
        setSnackbarOpen(true);
        setLoading(false);
        return; // Stop further processing
      }
      const validationError = validateTeacherAssignments();
      if (validationError) {
        setSnackbarMessage(validationError);
        setSnackbarColor("danger");
        setSnackbarOpen(true);
        setLoading(false);
        return; // Stop generation if validation fails.
      }
      const payload = {
        ...mapDataForAlgorithm(),
        generationOption   // ← add this
      };
      
      console.log("Final Payload:", {
        ...payload,
        locked_slots: mapLockedSlots() // Add explicit logging
      });
      console.log("Sending payload:", payload);
      const result = await generationService.generateTimetable(payload);
      console.log("Generation result:", result);
      
      // Only if we're editing, preserve the saved timetable header IDs.
      if (isEditing && generatedData?.timetable_headers) {
        const oldHeaders = generatedData.timetable_headers;
        const headerIdMap = {}; // Map new (temporary) IDs -> preserved old IDs
      
        // Update headers: For each new header, if a matching old header is found (by Batch_ID and Section_ID),
        // replace the new Timetable_ID with the old one, and record the mapping.
        result.timetable_headers = result.timetable_headers.map(newHeader => {
          const originalNewId = newHeader.Timetable_ID; // the new id returned by the algorithm
          const match = oldHeaders.find(h =>
            String(h.Batch_ID) === String(newHeader.Batch_ID) &&
            String(h.Section_ID) === String(newHeader.Section_ID)
          );
          const preservedId = match ? match.Timetable_ID : newHeader.Timetable_ID;
          headerIdMap[originalNewId] = preservedId;
          return { ...newHeader, Timetable_ID: preservedId };
        });
      
        // Update timetable details: Replace the new Timetable_ID in each detail with the preserved one.
        result.timetable_details = result.timetable_details.map(detail => {
          const preservedId = headerIdMap[detail.Timetable_ID];
          return preservedId ? { ...detail, Timetable_ID: preservedId } : detail;
        });
      }
      
      setGeneratedData(result);
      
      
      // setLockedSlots([]);
      const computedLockedSlots = [];
result.timetable_headers.forEach(header => {
  const detailsForHeader = result.timetable_details.filter(
    d => String(d.Timetable_ID) === String(header.Timetable_ID)
  );
  detailsForHeader.forEach(detail => {
    // console.log(detail)
    if (detail.Locked) {
      const dayIndex = getDayIndex(detail.Day);
      const coveredSlots = getCoveredSlots(detail.Start_Time, detail.End_Time);
      console.log(detail.Start_Time, detail.End_Time);
      // console.log("Covered slots:", coveredSlots);
      coveredSlots.forEach(slotIndex => {
        if (dayIndex !== -1 && slotIndex !== -1) {
          computedLockedSlots.push(`${header.Timetable_ID}-${dayIndex}-${slotIndex}`);
        }
      })
    }
  });
});
// console.log("Computed", computedLockedSlots)
setLockedSlots(computedLockedSlots);
    }catch (error) {
      console.error("Generation failed:", error);
      // If the solver returns a 400, show your “no feasible” message
      if (error.response?.status === 400 || error.code === 'ERR_BAD_REQUEST') {
        setSnackbarMessage(
          "No feasible timetable could be generated. Please reduce the teacher assignments or hard constraints."
        );
        setSnackbarColor("danger");
        setSnackbarOpen(true);
      } else {
        // Other errors
        setSnackbarMessage("An unexpected error occurred during generation.");
        setSnackbarColor("danger");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchSavedTimetableData = async (generationId) => {
    try {
      // Fetch all saved timetable headers and details
      const headersResponse = await apiClient.get('/timetable-header/');
      const detailsResponse = await apiClient.get('/timetable-detail/');
      console.log("DETAIL RESPONSE", detailsResponse)
      const allHeaders = headersResponse.data;
      const allDetails = detailsResponse.data;
      // console.log(detailsResponse)
      // console.log(allHeaders)
      // Filter headers by the selected generation's ID.
      const filteredHeaders = allHeaders.filter(header => {
        // Using the field name as stored in the database:
        return String(header.Generation) === String(generationId);
      });
      
      // Filter details whose Timetable_ID appears in the filtered headers.
      const filteredDetails = allDetails.filter(detail =>
        filteredHeaders.some(header => String(header.Timetable_ID) === String(detail.Timetable_ID))
      );
      // console.log("FILTERED DETAILS",filteredDetails)

      // Return the filtered data.
      return { timetable_headers: filteredHeaders, timetable_details: filteredDetails };
    } catch (error) {
      console.error("Error fetching saved timetable data:", error);
      return null;
    }
  };

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const getDayIndex = (day) => dayNames.indexOf(day);
  
  const timeslotsOrder = [
    "08:30-09:20",
    "09:20-10:10",
    "10:10-11:00",
    "11:30-12:20",
    "12:20-1:10",
    "2:00-2:50",
    "2:50-3:40",
    "3:40-4:30",
  ];

  const handleViewEditGeneration = async (generation) => {
    // console.log("Selected generation for view/edit:", generation);
    const savedData = await fetchSavedTimetableData(generation.Generation_ID);
    // console.log("Fetched saved timetable data:", savedData);
  
    if (savedData && savedData.timetable_headers && savedData.timetable_details) {
      setGeneratedData(savedData);
      setIsEditing(true);
      const disabledDaysMap = {};
      savedData.timetable_headers.forEach((header) => {
        if (header.disabled_days) {
          // Convert the comma-separated string of day indices back to an array of numbers (indices).
          disabledDaysMap[header.Timetable_ID] = header.disabled_days.split(',').map(Number);
        }
      });
      
      // console.log("MAPPPPPPPP",disabledDaysMap)
      setDisabledDays(disabledDaysMap);
      // Compute locked slots based on the saved timetable details.
      const newLockedSlots = [];
      savedData.timetable_headers.forEach((header) => {
        const detailsForHeader = savedData.timetable_details.filter(
          (d) => String(d.Timetable_ID) === String(header.Timetable_ID)
        );
        detailsForHeader.forEach((detail) => {
          if (detail.Locked) {
            const detailStart = detail.Start_time || detail.Start_Time || "";
            const detailEnd = detail.End_time || detail.End_Time || "";
            const day = detail.Day;
            const dayIndex = getDayIndex(day);
            const coveredSlots = getCoveredSlots(detailStart, detailEnd);
  
            coveredSlots.forEach((timeslotIndex) => {
              if (dayIndex !== -1 && timeslotIndex !== -1) {
                const slotKey = `${header.Timetable_ID}-${dayIndex}-${timeslotIndex}`;
                newLockedSlots.push(slotKey);
              }
            });
          }
        });
      });
      setLockedSlots(newLockedSlots);
    } else {
      console.warn("No saved timetable data found for this generation");
      setGeneratedData(null);
      setIsEditing(false);
      setLockedSlots([]);
    }
  
    setActiveTab(0);
  };
  
  
  
  // This transform function produces data in the format the timetable component expects.
  const transformToTimetableFormat = (details, header) => {
    const timeslotsOrder = [
      "08:30-09:20",
      "09:20-10:10",
      "10:10-11:00",
      "11:30-12:20",
      "12:20-1:10",
      "2:00-2:50",
      "2:50-3:40",
      "3:40-4:30",
    ];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
    return timeslotsOrder.map((timeSlot) => {
      const expectedStart = normalizeTime(timeSlot.split("-")[0] + ":00");
      const formattedTime = timeSlot.replace("-", " - ");
      const rowDays = daysOfWeek.map((dayName) => {
        const slot = details.find((d) => {
          // Use a fallback for the time fields:
          const startTime = d.Start_time || d.Start_Time;
          const endTime = d.End_time || d.End_Time;
          if (d.Day !== dayName || !startTime || !endTime) return false;
          if (String(d.Timetable_ID) !== String(header.Timetable_ID)) return false;
          const eventStart = timeToMinutes(normalizeTime(startTime));
          const eventEnd = timeToMinutes(adjustEndTime(startTime, endTime));
          const slotStart = timeToMinutes(expectedStart);
          const slotEnd = timeToMinutes(adjustEndTime(timeSlot.split("-")[0] + ":00", timeSlot.split("-")[1] + ":00"));
          return eventStart < slotEnd && eventEnd > slotStart;
        });
        if (!slot) {
          return { text: "", color: "", teacher: "" };
        }
        const course = courses.find(
          (c) => String(c.Course_ID) === String(slot.Course_ID)
        );
        const courseName = course ? course.Course_name : "Unknown Course";
        const roomObj =
          slot.Theory_or_Lab === "lab"
            ? labRooms.find((r) => String(r.Room_ID) === String(slot.Room_ID))
            : rooms.find((r) => String(r.Room_ID) === String(slot.Room_ID));
        const room = roomObj ? roomObj.Room_no : "N/A";
        // console.log("ROOOm",roomObj)
        let displayText = courseName;
        if (slot.Theory_or_Lab === "lab") {
          displayText += ` (LAB - ${room})`;
        }
        const teacher =
          teachers.find(
            (t) =>
              String(t.Teacher_ID) ===
              String(slot.Teacher_ID?.Teacher_ID || slot.Teacher_ID)
          )?.Name || "";
        return {
          text: displayText,
          color: (slot.Teacher_pref_status || "").toLowerCase(),
          teacher: teacher,
        };
      });
      return {
        time: formattedTime,
        days: rowDays,
      };
    });
  };
  
  
  

  const handleLockSlot = (timetableId, dayIndex, timeIndex) => {
    const slotKey = `${timetableId}-${dayIndex}-${timeIndex}`;
    
    setLockedSlots(prev => {
      // Ensure we have fresh data for validation
      const isAlreadyLocked = prev.includes(slotKey);
      const newLocked = isAlreadyLocked 
        ? prev.filter(k => k !== slotKey)
        : [...prev, slotKey];
      
      // For debugging
      // console.log("Current locked slots:", mapLockedSlots(newLocked));
      
      return newLocked;
    });
  };

  const handleToggleDay = (timetableId, dayIndex) => {
    setDisabledDays((prev) => {
      const currentDisabled = prev[timetableId] || [];
      const isAdding = !currentDisabled.includes(dayIndex);
    
      // Check constraints only when adding new disabled days
      if (isAdding) {
        // Constraint 1: Maximum 2 disabled days
        if (currentDisabled.length >= 2) {
          setSnackbarMessage("Maximum 2 days can be disabled per timetable!");
          setSnackbarColor("danger");
          setSnackbarOpen(true);
                    return prev;
        }
    
        // Constraint 2: No alternate days
        const conflictingDays = currentDisabled.filter(d => 
          alternateDayMap[dayIndex].includes(d) || 
          alternateDayMap[d].includes(dayIndex)
        );
        
        if (conflictingDays.length > 0) {
          setSnackbarMessage("Cannot disable alternate days!");
          setSnackbarColor("danger");
          setSnackbarOpen(true);
                    return prev;
        }


      const isLocked = lockedSlots.some(slotKey => {
        const [lockedTimetableId, lockedDayIndex] = slotKey.split('-');
        return (
          String(lockedTimetableId) === String(timetableId) &&
          parseInt(lockedDayIndex) === dayIndex
        );
      });
          
          
      

        if (isLocked) {
          setSnackbarMessage("Cannot disable this day due to Locked Slots!");
          setSnackbarColor("danger");
          setSnackbarOpen(true);
                    return prev;
        }
        // Check if any slot on the selected day has a hard constraint
        const hasHardConstraint = generatedData.timetable_details.some(detail => {
          // Check if the current timetable ID, day, and hard constraint condition matches
          if (String(detail.Timetable_ID) === String(timetableId) && 
              detail.Day === dayNames[dayIndex] && 
              detail.Hard_slot)  {
            return true;
          }
          return false;
        });

       
  
        if (hasHardConstraint) {
          setSnackbarMessage("Cannot disable this day due to hard constraints!");
          setSnackbarColor("danger");
          setSnackbarOpen(true);
                    return prev;
        }
       
      }
    
      // Update state if valid
      return {
        ...prev,
        [timetableId]: isAdding 
          ? [...currentDisabled, dayIndex]
          : currentDisabled.filter(d => d !== dayIndex)
      };
    });
  };
  
  // Inside your Generation component (Generation.js)
 
  const getTimeslotIndex = (startTime) => {
    // Loop through timeslot boundaries
    for (let i = 0; i < timeslotBoundaries.length; i++) {
      // Skip the "1:10" slot by checking its value
      if (timeslotBoundaries[i] === "01:10:00") continue;  // Skip "1:10" slot
  
      // Compare normalized start time
      const slotStart = normalizeTime(timeslotBoundaries[i].split("-")[0] + ":00");
      // console.log(startTime)
      // console.log(slotStart)
      if (normalizeTime(startTime) === slotStart) return i;
    }
    return -1; // Return -1 if no match found
  };
  
const handleSaveTimetable = async (description) => {
  setSaveLoading(true); 
  try {
    if (timetableStatus === "published") {
      const headersResponse = await apiClient.get('/timetable-header/');
      const alreadyPublished = headersResponse.data.some(header =>
        header.Status === "published" &&
        String(header.Generation) !== String(selectedGeneration?.Generation_ID)
      );
      if (alreadyPublished) {
      
        setSnackbarMessage("You can only publish 1 timetable.");
        setSnackbarColor("danger");
        setSnackbarOpen(true);
        return;
      }
    }
    
    if (isEditing && selectedGeneration) {
      // Update the generation record
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const updatePayload = { 
        Description: description,
        Status: timetableStatus, // Update the status if changed
        Time_Generated: new Date().toISOString(),
        last_edited_by: currentUser.username, // Add timestamp
      };
      const updateResponse = await generationService.updateGeneration(selectedGeneration.Generation_ID, updatePayload);
      console.log("Updated Generation:", updateResponse.data);

      // Update timetable headers
      // 1️⃣ Delete all existing headers (and their details) for this generation
// Delete only the headers that have the current generation ID.
const existingHeadersRes = await generationService.getTimetableHeaders();
const headersToDelete = existingHeadersRes.data.filter(
  h => String(h.Generation) === String(selectedGeneration.Generation_ID)
);
await Promise.all(
  headersToDelete.map(h => generationService.deleteTimetableHeader(h.Timetable_ID))
);

// 2️⃣ Create new headers (preserving the same Generation ID) and their details
for (const header of generatedData.timetable_headers) {
  const headerPayload = {
    Batch_ID: header.Batch_ID,
    Section_ID: header.Section_ID,
    Status: timetableStatus,
    Generation: selectedGeneration.Generation_ID,
    disabled_days: (disabledDays[header.Timetable_ID] || []).join(','),
  };
  const savedHeader = await generationService.saveTimetableHeader(headerPayload);
  const newHeaderId = savedHeader.data.Timetable_ID;

  // Save all new details for this header
  const detailsForHeader = generatedData.timetable_details.filter(d => String(d.Timetable_ID) === String(header.Timetable_ID));
  for (const detail of detailsForHeader) {
    const dayIndex = getDayIndex(detail.Day);
let timeslotIndex = getTimeslotIndex(detail.Start_time || detail.Start_Time);
if(timeslotIndex==6 || timeslotIndex==7||timeslotIndex==8){
  timeslotIndex-=1
}
const slotKey = `${header.Timetable_ID}-${dayIndex}-${timeslotIndex}`;    
console.log("slotkey", slotKey)
const detailPayload = {
      Timetable_ID: newHeaderId,
      Course_ID: detail.Course_ID,
      Teacher_ID: Number(detail.Teacher_ID),
      Room_ID: Number(detail.Room_ID),
      Day: detail.Day,
      Start_time: normalizeTime(detail.Start_time || detail.Start_Time || ""),
      End_time: normalizeTime(detail.End_time || detail.End_Time || ""),
      Locked: lockedSlots.includes(slotKey),

      Teacher_pref_status: detail.Teacher_pref_status || "",
      Theory_or_Lab: detail.Theory_or_Lab,
      Hard_slot: detail.Hard_slot || false,
    };
    console.log("Detail EDIT payload:", detailPayload);

    await generationService.saveTimetableDetail(detailPayload);
  }
}

      setIsEditing(false)
      setSnackbarMessage(`Timetable ${timetableStatus} successfully updated!`);
      setSnackbarColor("success");
      setSnackbarOpen(true);
          } else {
      // Create new generation record as before
      const generationResponse = await generationService.createGeneration({ 
        Description: description,
        Status: timetableStatus,
        Time_Generated: new Date().toISOString(), // Add timestamp
      });
      console.log("New Generation:", generationResponse.data);
      const newGeneration = generationResponse.data;

      for (const header of generatedData.timetable_headers) {
        const headerPayload = {
          Batch_ID: header.Batch_ID,
          Section_ID: header.Section_ID,
          Status: timetableStatus,
          Generation: newGeneration.Generation_ID,
          disabled_days: (disabledDays[header.Timetable_ID] || []).join(','),
        };
        console.log("Header payload:", headerPayload);
        const savedHeaderResponse = await generationService.saveTimetableHeader(headerPayload);
        const newTimetableId = savedHeaderResponse.data.Timetable_ID;
        console.log("New Timetable ID:", newTimetableId);

        const detailsForHeader = generatedData.timetable_details.filter(
          (d) => String(d.Timetable_ID) === String(header.Timetable_ID)
        );

        for (const detail of detailsForHeader) {
          const detailStart = detail.Start_time || detail.Start_Time || "";
          const dayIndex = getDayIndex(detail.Day);
          let timeslotIndex = getTimeslotIndex(detailStart);
          if(timeslotIndex==6 || timeslotIndex==7 || timeslotIndex==8){
            timeslotIndex-=1
          }
          const slotKey = `${header.Timetable_ID}-${dayIndex}-${timeslotIndex}`;
          const isLocked = lockedSlots.includes(slotKey);

          const detailPayload = {
            Timetable_ID: newTimetableId,
            Course_ID: detail.Course_ID,
            Teacher_ID: Number(detail.Teacher_ID),
            Room_ID: Number(detail.Room_ID),
            Day: detail.Day,
            Start_time: normalizeTime(detail.Start_time || detail.Start_Time || ""),
            End_time: normalizeTime(detail.End_time || detail.End_Time || ""),
            Locked: lockedSlots.includes(slotKey),
            Teacher_pref_status: detail.Teacher_pref_status || "",
            Theory_or_Lab: detail.Theory_or_Lab,
            Hard_slot: detail.Hard_slot || false,
            // Created_At: new Date().toISOString(), // Add timestamp
          };
          console.log("Detail payload:", detailPayload);
          await generationService.saveTimetableDetail(detailPayload);
        }
      }
      setSnackbarMessage(`Timetable ${timetableStatus} successfully saved!`);
      setSnackbarColor("success");
      setSnackbarOpen(true);
          }
          setTimeout(() => {
            window.location.reload();
          }, 500); 
  } catch (error) {
    console.error(`Error saving/updating timetable as ${timetableStatus}:`, error);
  }finally {
    setSaveLoading(false); // Hide loading spinner
 // Refresh the page after save
  }
};
  

  
  

  // --- RENDER ---
  return (
    <div>
<TeacherTabs
  externalIndex={activeTab}
  onIndexChange={(newTab) => setActiveTab(newTab)}
  tabLabels={[
    isEditing ? "Editing Timetables" : "Generate Timetable", 
    "Generated Timetables"
  ]}
        tabContent={[
          
          <div key="generation-tab">
            {isEditing && (
  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
    <Button
      variant="outlined"
      color="neutral"
      onClick={() => {
        setIsEditing(false);
        setSelectedGeneration(null);
        window.location.reload();
        // Optionally, you may want to clear generatedData or re-fetch fresh generated data
        // setGeneratedData(null);
      }}
    >
      Stop Editing
    </Button>
  </Box>
)}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
  <TextField
    label="Academic Year (YYYY-YYYY)"
    value={academicYearInput}
    helperText="Format: 2024-2025"
    onChange={e => {
      const val = e.target.value;
      setAcademicYearInput(val);
      const parts = val.split("-");
      if (parts.length === 2 && !isNaN(parts[1])) {
        setCurrentAcademicYear(parseInt(parts[1], 10));
      }
    }}
  />
</Box>
<Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
<FormControl component="fieldset">
  <RadioGroup
    row
    name="generationOption"
    value={String(generationOption)}
    onChange={e => setGenerationOption(Number(e.target.value))}
  >
    <FormControlLabel
      value="1"
      control={<Radio />}
      label="Mon & Wed Lab days for 2nd and 4th Year"
    />
    <FormControlLabel
      value="2"
      control={<Radio />}
      label="Mon & Wed Lab days for 1st and 3rd Year"
    />
  </RadioGroup>
</FormControl>

</Box>



            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="solid"
                color="primary"
                onClick={handleGenerate}
                disabled={loading}
                startDecorator={loading && <CircularProgress size={20} />}
              >
                {loading ? "Generating..." : generatedData ? "Re-generate Timetable" : "Generate Timetable"}
              </Button>
            </Box>

            {generatedData && generatedData.timetable_headers ? (
              <Box sx={{ mt: 4 }}>
                {generatedData.timetable_headers.map((header) => {
                  // console.log("Timetable header:", header);
                  const sectionObj = sections.find(
                    (s) => String(s.Section_ID) === String(header.Section_ID)
                  );
                  const batchObj =
                    sectionObj &&
                    sectionObj.Batch_ID &&
                    typeof sectionObj.Batch_ID === "object"
                      ? sectionObj.Batch_ID
                      : batches.find(
                          (b) => String(b.Batch_ID) === String(header.Batch_ID)
                        );
                  const theoryDetail = generatedData.timetable_details.find(
                    (d) =>
                      String(d.Timetable_ID) === String(header.Timetable_ID) &&
                      d.Theory_or_Lab === "theory"
                  );
                  const theoryRoomId = theoryDetail ? theoryDetail.Room_ID : null;
                  const theoryRoomObj = rooms.find(
                    (r) => String(r.Room_ID) === String(theoryRoomId)
                  );
                  
                  return (
                    <Box
                      key={header.Timetable_ID}
                      sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}
                    >
                      <div className="w-full max-w-4xl border border-gray-300 rounded-lg p-4">
                        <Timetable
                          timetable={transformToTimetableFormat(generatedData.timetable_details, header)}
                          sectionAndBatch={`${batchObj ? batchObj.Batch_name : "Unknown Batch"} - ${sectionObj ? sectionObj.Section_name : "Unknown Section"} (Room ${theoryRoomObj ? theoryRoomObj.Room_no : "N/A"})`}
                          lockedSlots={lockedSlots}
                          disabledDays={disabledDays[header.Timetable_ID] || []}
                          timetableId={header.Timetable_ID}
                          onLockSlot={(dayIndex, timeIndex) =>
                            handleLockSlot(header.Timetable_ID, dayIndex, timeIndex)
                          }
                          onToggleDay={(dayIndex) =>
                            handleToggleDay(header.Timetable_ID, dayIndex)
                          }
                          disableDayTooltip={(dayIndex) => { /* tooltip logic */ }}
                        />
                      </div>
                      <Box sx={{ mt: 1, textAlign: "right", width: "100%", maxWidth: "4xl", px: 2 }}>
                        <Typography variant="caption">
                          {/* Last edited by: {header.last_edited_by } */}
                        </Typography>
                      </Box>
                    </Box>
                  );
                  
                })}
              </Box>
            ) : (
<Box sx={{ mt: 4, textAlign: 'center' }}>
  <div>No timetable generated yet</div>
</Box>

            )}
{generatedData && (
  <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
    <Button
      variant="solid"
      color="warning"
      onClick={() => initiateSaveTimetable("draft")}
      disabled={saveLoading}
      size="lg"
      startDecorator={<i className="fas fa-save"/>}
      sx={{ 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: 'md',
        '&:hover': { boxShadow: 'lg' }
      }}
    >
      Save Draft
    </Button>
    <Button
      variant="solid"
      color="success"
      onClick={() => initiateSaveTimetable("published")}
      disabled={saveLoading}
      size="lg"
      startDecorator={<i className="fas fa-upload"/>}
      sx={{ 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: 'md',
        '&:hover': { boxShadow: 'lg' }
      }}
    >
      Publish Now
    </Button>
  </Box>
)}

          </div>,


<div key="generated-timetables-tab">
<div key="generated-timetables-tab">
  <GeneratedTimetables 
    onEditGeneration={async(generation) => {
      setSelectedGeneration(generation);
      // console.log("Selected generation for view/edit:", generation);
      await handleViewEditGeneration(generation);
    }}
  />
</div>

          </div>,

        ]}
      />
      {/* Render the modal for generation description */}
      <GenerationDescriptionModal 
  open={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={(description) => handleSaveTimetable(description)}
  initialDescription={selectedGeneration ? selectedGeneration.Description : ""}  // Pass the existing description
/>
<CustomSnackbar 
  open={snackbarOpen} 
  onClose={() => setSnackbarOpen(false)} 
  message={snackbarMessage} 
  color={snackbarColor} 
/>
{saveLoading && (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(4px)',
  }}>
    <Box sx={{
      textAlign: 'center',
      p: 4,
      borderRadius: '16px',
      boxShadow: 3,
      backgroundColor: 'background.paper',
      animation: 'slideIn 0.3s ease-out',
      '@keyframes slideIn': {
        '0%': { transform: 'translateY(-20px)', opacity: 0 },
        '100%': { transform: 'translateY(0)', opacity: 1 }
      }
    }}>
      <CircularProgress 
        size={64}
        thickness={4}
        sx={{
          color: 'primary.main',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.05)', opacity: 0.8 },
            '100%': { transform: 'scale(1)', opacity: 1 }
          }
        }}
      />
      <Typography 
        variant="h6" 
        sx={{ 
          mt: 3,
          fontWeight: 600,
          color: 'text.primary',
          letterSpacing: '0.5px',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          }
        }}
      >
        Saving Timetable
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 1,
          color: 'text.secondary',
          fontWeight: 500,
          animation: 'fadeIn 0.5s ease-out 0.2s backwards'
        }}
      >
        Please don't close the window
      </Typography>
      <Box sx={{
        mt: 2,
        height: 2,
        backgroundColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        width: 160,
        mx: 'auto'
      }}>
        <Box sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'primary.main',
          animation: 'progressBar 2s ease-in-out infinite',
          '@keyframes progressBar': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          }
        }} />
      </Box>
    </Box>
  </Box>
)}
    </div>
  );
}

export default Generation;
