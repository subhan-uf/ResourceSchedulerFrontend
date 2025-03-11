import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";
import { Box, CircularProgress } from "@mui/material";
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

// A helper to normalize time strings to "HH:MM:SS" format
const normalizeTime = (timeStr) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  const hour = parts[0].padStart(2, "0");
  const minute = (parts[1] || "00").padStart(2, "0");
  const second = (parts[2] || "00").padStart(2, "0");
  return `${hour}:${minute}:${second}`;
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
  // Save the timetable status ("draft" or "published") that triggered the modal
  const [timetableStatus, setTimetableStatus] = useState("");
  // Fetch all required data on mount
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
        ] = await Promise.all([
          teacherService.getAllTeachers(),
          roomService.getAllRooms(),
          sectionService.getAllSections(),
          batchService.getAllBatches(),
          courseService.getAllCourses(),
          teacherCourseAssignmentService.getAllAssignments(),
          batchCourseTeacherAssignmentService.getAllAssignments(),
          coursePreferenceService.getAll(), // fetch time preferences
        ]);

        console.log("Fetched Teachers:", teachRes.data);
        console.log("Fetched Rooms:", roomRes.data);
        console.log("Fetched Sections:", sectionRes.data);
        console.log("Fetched Batches:", batchRes.data);
        console.log("Fetched Courses:", courseRes.data);
        console.log("Fetched TCA:", tcaRes.data);
        console.log("Fetched BCTA:", bctaRes.data);

        setTeachers(teachRes.data || []);
        setRooms(
          roomRes.data.filter(
            (r) => r.Room_type.toLowerCase() === "classroom"
          )
        );
        setLabRooms(
          roomRes.data.filter((r) => r.Room_type.toLowerCase() === "lab")
        );
        setSections(sectionRes.data || []);
        setBatches(batchRes.data || []);
        setCourses(courseRes.data || []);
        setTcaList(tcaRes.data || []);
        setBctaList(bctaRes.data || []);
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
      acc[String(room.Room_no)] = {
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
        floor_pref: teacher.room_pref
          ? [teacher.room_pref.Floor, teacher.room_pref.is_hard]
          : [null, false],
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
          year = batchObj.Year ? batchObj.Year - 2020 : 1;
          const sectionsForBatch = sections.filter((s) => String(s.Batch_ID) === String(batchObj.Batch_ID));
          const matchingSection = sectionsForBatch.find((s) => String(s.Section_ID) === String(tca.Section_ID || s.Section_ID));
          if (matchingSection) {
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
          year = batchObj.Year ? batchObj.Year - 2020 : 1;
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
      const timeslotBoundaries = [
        "08:30:00", // slot 0 start
        "09:20:00", // slot 1 start
        "10:10:00", // slot 2 start
        "11:30:00", // slot 3 start (after the 11:00-11:30 break)
        "12:20:00", // slot 4 start
        "02:00:00", // slot 5 start (after the 1:10-2:00 break)
        "02:50:00", // slot 6 start
        "03:40:00"  // slot 7 start
      ];
      
      // Normalize the teacher's times:
      const normalizedStart = normalizeTime(cp.Start_time); // e.g. "08:30:00"
      const normalizedEnd = normalizeTime(cp.End_time);       // e.g. "09:20:00"
      console.log(normalizedStart)
      // Find the indices:
      const start_slot_index = timeslotBoundaries.indexOf(normalizedStart);
      const end_slot_index = timeslotBoundaries.indexOf(normalizedEnd) - 1;
      let courseName = "Default Course";
      if (cp.Course_ID) {
        const foundCourse = courses.find(
          (c) => String(c.Course_ID) === String(cp.Course_ID)
        );
        if (foundCourse && foundCourse.Course_name) {
          courseName = foundCourse.Course_name;
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
      });
    });
    Object.keys(teacherAssignments).forEach((tid) => {
      teacherAssignments[tid].time_prefs = teacherTimePrefs[tid] || [];
    });
    return teacherAssignments;
  };

  const timeToMinutes = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const mapDisciplineInfo = () => {
    const disciplineInfo = {};
    batches.forEach((batch) => {
      // Calculate year as provided (e.g., 1 means 1st year)
      const year = batch.Year ? batch.Year - 2020 : 1;
      const key = `${batch.Discipline}, ${year}`;
      const batchCourses = courses.filter((course) => {
        if (typeof course.Batch_ID === "object") {
          return course.Batch_ID.Batch_ID === batch.Batch_ID;
        }
        return course.Batch_ID === batch.Batch_ID;
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
    if (!generatedData || !generatedData.timetable_headers) return [];
    return lockedSlots.map((lock) => {
      const [timetableId, dayIndex, timeIndex] = lock.split("-");
      const header = generatedData.timetable_headers.find(
        (h) => String(h.Timetable_ID) === String(timetableId)
      );
      const section = sections.find(
        (s) => String(s.Section_ID) === String(header?.Section_ID)
      );
      return {
        disc:
          section && section.Batch_ID && typeof section.Batch_ID === "object"
            ? section.Batch_ID.Discipline
            : "Unknown",
        year:
          section && section.Batch_ID && typeof section.Batch_ID === "object"
            ? section.Batch_ID.Year - 2020
            : 1,
        section:
          section && section.Section_name
            ? section.Section_name.charCodeAt(0) - 65
            : 0,
        scode: "COURSE_CODE",
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(dayIndex)],
        timeslot: parseInt(timeIndex),
      };
    });
  };

  const mapDataForAlgorithm = () => {
    return {
      rooms: formatRooms(rooms),
      lab_rooms: formatRooms(labRooms),
      teachers: mapTeacherAssignments(),
      discipline_info: mapDisciplineInfo(),
      locked_slots: lockedSlots,
      disabled_days: disabledDays,
    };
  };

  // --- HANDLERS ---

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = mapDataForAlgorithm();
      console.log("Sending payload:", payload);
      const result = await generationService.generateTimetable(payload);
      console.log("Generation result:", result);
      setGeneratedData(result);
    } catch (error) {
      console.error("Generation failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
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
      
      const allHeaders = headersResponse.data;
      const allDetails = detailsResponse.data;
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
  console.log("Selected generation for view/edit:", generation);
  const savedData = await fetchSavedTimetableData(generation.Generation_ID);
  console.log("Fetched saved timetable data:", savedData);

  if (savedData && savedData.timetable_headers && savedData.timetable_details) {
    setGeneratedData(savedData);
    setIsEditing(true);

    // Compute locked slots based on the saved timetable details.
    const newLockedSlots = [];
    savedData.timetable_headers.forEach((header) => {
      // Filter details for this header
      const detailsForHeader = savedData.timetable_details.filter(
        (d) => String(d.Timetable_ID) === String(header.Timetable_ID)
      );
      detailsForHeader.forEach((detail) => {
        // Only add if detail is locked
        if (detail.Locked) {
          // Calculate day index and timeslot index.
          const dayIndex = getDayIndex(detail.Day);
          const timeslotIndex = getTimeslotIndex(detail.Start_time || detail.Start_Time || "");
          if (dayIndex !== -1 && timeslotIndex !== -1) {
            const slotKey = `${header.Timetable_ID}-${dayIndex}-${timeslotIndex}`;
            newLockedSlots.push(slotKey);
          }
        }
      });
    });
    // Update state with the computed locked slots.
    setLockedSlots(newLockedSlots);
  } else {
    console.warn("No saved timetable data found for this generation");
    setGeneratedData(null);
    setIsEditing(false);
    setLockedSlots([]); // Clear locked slots if no data found
  }
  
  // Switch back to the first tab.
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
            ? labRooms.find((r) => String(r.Room_no) === String(slot.Room_ID))
            : rooms.find((r) => String(r.Room_no) === String(slot.Room_ID));
        const room = roomObj ? roomObj.Room_no : "N/A";
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
    setLockedSlots((prev) =>
      prev.includes(slotKey)
        ? prev.filter((k) => k !== slotKey)
        : [...prev, slotKey]
    );
  };

  const handleToggleDay = (timetableId, dayIndex) => {
    setDisabledDays((prev) => ({
      ...prev,
      [timetableId]: prev[timetableId]
        ? prev[timetableId].includes(dayIndex)
          ? prev[timetableId].filter((d) => d !== dayIndex)
          : [...prev[timetableId], dayIndex]
        : [dayIndex],
    }));
  };
  // Inside your Generation component (Generation.js)
 
const getTimeslotIndex = (startTime) => {
  // Compare the normalized start time with each timeslot's start time.
  for (let i = 0; i < timeslotsOrder.length; i++) {
    const slotStart = normalizeTime(timeslotsOrder[i].split("-")[0] + ":00");
    if (normalizeTime(startTime) === slotStart) return i;
  }
  return -1; // if not found
};
  const handleSaveTimetable = async (description) => {
    try {
      if (isEditing && selectedGeneration) {
        // Prepare payload for updating (this might be similar to your headerPayload construction)
        // For each header you want to update, call updateGeneration or update the headers individually.
        // For simplicity, here we assume you update the generation record:
        const updatePayload = { Description: description }; // add any other fields if needed
        const updateResponse = await generationService.updateGeneration(selectedGeneration.Generation_ID, updatePayload);
        console.log("Updated Generation:", updateResponse.data);
        
        // Then, you can loop over generatedData.timetable_headers and update them
        // (Assume you have a similar API endpoint for updating a timetable header)
        for (const header of generatedData.timetable_headers) {
          const headerPayload = {
            Batch_ID: header.Batch_ID,
            Section_ID: header.Section_ID,
            Status: timetableStatus, // "draft" or "published"
            Generation: selectedGeneration.Generation_ID, // use the existing generation id
          };
          console.log("Updating Header payload:", headerPayload);
          await generationService.updateTimetableHeader(header.Timetable_ID, headerPayload);
          // If needed, update timetable details similarly...
        }
        alert(`Timetable ${timetableStatus} successfully updated!`);
      } else {
        // Create new generation record as before
        const generationResponse = await generationService.createGeneration({ Description: description });
        console.log("New Generation:", generationResponse.data);
        const newGeneration = generationResponse.data;
        for (const header of generatedData.timetable_headers) {
          const headerPayload = {
            Batch_ID: header.Batch_ID,
            Section_ID: header.Section_ID,
            Status: timetableStatus,
            Generation: newGeneration.Generation_ID,
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
          const timeslotIndex = getTimeslotIndex(detailStart);
          // Build a slot key using the original header timetable id
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
              
              Locked: isLocked,
              Teacher_pref_status: detail.Teacher_pref_status || "",
              Theory_or_Lab: detail.Theory_or_Lab,
              Hard_slot: detail.Hard_slot || false,
            };
            console.log("Detail payload:", detailPayload);
            await generationService.saveTimetableDetail(detailPayload);
          }
        }
        alert(`Timetable ${timetableStatus} successfully saved!`);
      }
    } catch (error) {
      console.error(`Error saving/updating timetable as ${timetableStatus}:`, error);
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
        // Optionally, you may want to clear generatedData or re-fetch fresh generated data
        // setGeneratedData(null);
      }}
    >
      Stop Editing
    </Button>
  </Box>
)}

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
                    (r) => String(r.Room_no) === String(theoryRoomId)
                  );
                  
                  return (
                    <Box
                      key={header.Timetable_ID}
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <div className="w-full max-w-4xl border border-gray-300 rounded-lg p-4">
                      <Timetable
  timetable={transformToTimetableFormat(generatedData.timetable_details, header)}
  sectionAndBatch={`${batchObj ? batchObj.Batch_name : "Unknown Batch"} - ${sectionObj ? sectionObj.Section_name : "Unknown Section"} (Room ${theoryRoomObj ? theoryRoomObj.Room_no : "N/A"})`}
  lockedSlots={lockedSlots}
  disabledDays={disabledDays[header.Timetable_ID] || []}
  timetableId={header.Timetable_ID}  // NEW: Pass timetable ID
  onLockSlot={(dayIndex, timeIndex) =>
    handleLockSlot(header.Timetable_ID, dayIndex, timeIndex)
  }
  onToggleDay={(dayIndex) =>
    handleToggleDay(header.Timetable_ID, dayIndex)
  }
/>

                      </div>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ mt: 4 }}>
                <div>No timetable generated yet</div>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
  <Button
    variant="contained"
    color="secondary"
    onClick={() =>initiateSaveTimetable("draft")}
  >
    Draft Timetable
  </Button>
  <Button
    variant="contained"
    color="primary"
    onClick={() => initiateSaveTimetable("published")}
  >
    Publish Timetable
  </Button>
</Box>

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
      />
    </div>
  );
}

export default Generation;
