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
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labRooms, setLabRooms] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tcaList, setTcaList] = useState([]);
  const [bctaList, setBctaList] = useState([]);
  const [coursePrefs, setCoursePrefs] = useState([]);

  // Additional states
  const [lockedSlots, setLockedSlots] = useState([]);
  const [disabledDays, setDisabledDays] = useState({});
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all required data on mount
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
        console.log("Fetched Sections:", sectionRes.data); // Check these keys!
        console.log("Fetched Batches:", batchRes.data);     // Check these keys!
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
        setSections(sectionRes.data || []); // Verify property names (maybe use s.id?)
        setBatches(batchRes.data || []);      // Verify property names (maybe use b.id?)
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

      console.log("TODDDDDD",tid);
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
    batchId = batchObj.Batch_ID; // Use the actual Batch_ID
    const matchingSection = sections.find(
      (s) => String(s.Batch_ID) === String(batchObj.Batch_ID)
    );
    if (matchingSection) {
      sectionId = matchingSection.Section_ID;
    }
  }
}

        if (teacherAssignments[tid]) {
            teacherAssignments[tid].assignments.push([
                discipline,
                batchId,   // now using actual Batch_ID
                sectionId,
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
    batchId = batchObj.Batch_ID;  // Use the actual Batch_ID
  }
}
let sectionId = null;
if (bcta.Section) {
  sectionId = bcta.Section.Section_ID ? bcta.Section.Section_ID : bcta.Section;
}

        if (teacherAssignments[tid]) {
            teacherAssignments[tid].assignments.push([
                discipline,
                batchId,   // now using actual Batch_ID
                sectionId,
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
              a[4] === assignment[4]
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
      const start_slot_index = cp.Start_time
        ? parseInt(cp.Start_time.split(":")[0]) - 8
        : 0;
      const end_slot_index = cp.End_time
        ? parseInt(cp.End_time.split(":")[0]) - 8
        : 0;
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
        day: cp.Day || "Mon",
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
      const key = `${batch.Discipline}, ${batch.Year ? batch.Year - 2020 : 1}`;
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
      locked_slots: mapLockedSlots(),
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
    //   console.log("New generatedData state:", result);
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
      // Construct expected start time in HH:MM:SS format
      const expectedStart = normalizeTime(timeSlot.split("-")[0] + ":00");
      const formattedTime = timeSlot.replace("-", " - ");
      const rowDays = daysOfWeek.map((dayName) => {
        // Find a slot with the exact day, normalized start time, and matching timetable ID
        const slot = details.find((d) => {
            if (d.Day !== dayName || !d.Start_Time || !d.End_Time) return false;
            if (String(d.Timetable_ID) !== String(header.Timetable_ID)) return false;
            
            const eventStart = timeToMinutes(normalizeTime(d.Start_Time));
            const eventEnd = timeToMinutes(adjustEndTime(d.Start_Time, d.End_Time));
            const slotStart = timeToMinutes(expectedStart);
            // Compute slot end from timeslot order:
            const slotEnd = timeToMinutes(adjustEndTime(timeSlot.split("-")[0] + ":00", timeSlot.split("-")[1] + ":00"));
          
            // Check if the event overlaps with this slot
            return eventStart < slotEnd && eventEnd > slotStart;
          });
          
        // console.log("Checking slot for", timeSlot, "on", dayName, ":", slot);
        if (!slot) {
          return { text: "", color: "", teacher: "" };
        }
        const course = courses.find(
          (c) => String(c.Course_ID) === String(slot.Course_ID)
        );
        // console.log("COURSE",course)
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

  // --- RENDER ---
  return (
    <div>
      <TeacherTabs
        tabLabels={["Generate Timetable"]}
        tabContent={[
          <div key="generation-tab">
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="solid"
                color="primary"
                onClick={handleGenerate}
                disabled={loading}
                startDecorator={loading && <CircularProgress size={20} />}
              >
                {loading ? "Generating..." : "Generate Timetables"}
              </Button>
            </Box>

            {generatedData && generatedData.timetable_headers ? (
              <Box sx={{ mt: 4 }}>
                {generatedData.timetable_headers.map((header) => {
                  console.log("Timetable header:", header);
                  // IMPORTANT: Check if your sections array objects use "Section_ID" or a different key (like "id")
                  const sectionObj = sections.find(
                    (s) => String(s.Section_ID) === String(header.Section_ID)
                  );
                //   console.log("Matching section object:", sectionObj);
                  // Similarly, check if your batches use "Batch_ID" or "id"
                  const batchObj =
                    sectionObj &&
                    sectionObj.Batch_ID &&
                    typeof sectionObj.Batch_ID === "object"
                      ? sectionObj.Batch_ID
                      : batches.find(
                          (b) => String(b.Batch_ID) === String(header.Batch_ID)
                        );
                //   console.log("Matching batch object:", batchObj);
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
                          timetable={transformToTimetableFormat(
                            generatedData.timetable_details,
                            header
                          )}
                          sectionAndBatch={`${batchObj ? batchObj.Batch_name : "Unknown Batch"} - ${
                            sectionObj ? sectionObj.Section_name : "Unknown Section"
                          } (Room ${theoryRoomObj ? theoryRoomObj.Room_no : "N/A"})`}
                          lockedSlots={lockedSlots}
                          disabledDays={disabledDays[header.Timetable_ID] || []}
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
          </div>,
        ]}
      />
    </div>
  );
}

export default Generation;
