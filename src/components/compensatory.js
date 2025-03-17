
import React, { useEffect, useRef, useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import RadioButton from "./designelements/radiobutton";
import ComputerIcon from '@mui/icons-material/Computer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CompensatoryTimetable from "./designelements/compensatorytable";
import axios from "axios";
import CompensatoryService from "./api/compensatoryService";
import teacherService from "./api/teacherService";
import courseService from "./api/courseService";
import roomService from "./api/roomService";
import sectionService from "./api/sectionService";
import teacherCourseAssignmentService from "./api/teacherCourseAssignmentService";
import batchCourseTeacherAssignmentService from "./api/batchCourseTeacherAssignmentService";
import batchService from "./api/batchService";
import generationService from "./api/generationService";
import apiClient from "./api/apiClient";
import AlertDialogModal from "./designelements/modal";
import CustomSnackbar from "./designelements/alert";

function Compensatory() {
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [showTimetable, setShowTimetable] = useState(false); // State to control timetable visibility
    const [sessionType, setSessionType] = useState("lab"); // State for Lab or Theory
    const [teacher, setTeacher] = useState("");
    const [section, setSection] = useState("");
    const [description, setDescription] = useState("");
    const [compRecords, setCompRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
const [courses, setCourses] = useState([]);
const [rooms, setRooms] = useState([]);
const [sections, setSections] = useState([]);
const [batches, setBatches] = useState([]);
const [teacherAssignments, setTeacherAssignments] = useState([]);
const [teacherBatches, setTeacherBatches] = useState([]);
const [teacherSections, setTeacherSections] = useState([]);
const [teacherCourses, setTeacherCourses] = useState([]);
const [selectedTeacher, setSelectedTeacher] = useState("");  // Use this instead of 'teacher' to avoid confusion.
const [selectedBatch, setSelectedBatch] = useState("");
const [selectedSection, setSelectedSection] = useState("");
const [selectedDate, setSelectedDate] = useState(""); // e.g. "2025-03-17"
const [availableRooms, setAvailableRooms] = useState([]); // Array of rooms that have available slots on the chosen date
const [selectedRoom, setSelectedRoom] = useState(""); // The room selected by the user from the available rooms
const [roomSlots, setRoomSlots] = useState([]); // The available slots for the selected room on the chosen date
const [sectionTimetableDetails, setSectionTimetableDetails] = useState([]); // Timetable details for the selected section
const [editingId, setEditingId] = useState(null);
const [deleteOpen, setDeleteOpen] = useState(false);
const [selectedCompId, setSelectedCompId] = useState(null);
const [isEditing, setIsEditing] = useState(false);  // State to track whether we're editing
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarColor, setSnackbarColor] = useState("neutral"); 
const viewAvailableSlotsButtonRef = useRef(null);
const [selectedWeek, setSelectedWeek] = useState("");
const [selectedDay, setSelectedDay] = useState("Monday");

useEffect(() => {
    if (!isEditing) {
      setSelectedBatch("");
      setSelectedSection("");
      setSelectedCourse("");
      setTeacherAssignments([]);
      setTeacherBatches([]);
      setTeacherSections([]);
      setTeacherCourses([]);
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (selectedWeek && sectionTimetableDetails.length > 0) {
      handleViewAvailableRooms();
    }
  }, [sessionType, selectedWeek, sectionTimetableDetails]);// Ensure to call the function when sessionType or other dependencies change
  useEffect(() => {
    // Clear selections when room changes
    setSelectedSlots([]);
    setRoomSlots([]);
  }, [selectedRoom]);
useEffect(() => {
    async function fetchBatches() {
      try {
        const resp = await batchService.getAllBatches();
        setBatches(resp.data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    }
    fetchBatches();
  }, []);
  
    useEffect(() => {
        async function fetchCompRecords() {
          try {
            const response = await CompensatoryService.getAllCompensatory();
            // Assuming the API returns an array of compensatory records in response.data
            setCompRecords(response.data);
          } catch (error) {
            console.error("Error fetching compensatory records:", error);
            showSnackbar("Error fetching compensatory records from the database.", "danger")
          }
        }
      
        fetchCompRecords();
      }, []);
      useEffect(() => {
        async function fetchTeachers() {
          try {
            const resp = await teacherService.getAllTeachers();
            setTeachers(resp.data);
          } catch (error) {
            console.error("Error fetching teachers:", error);
          }
        }
        fetchTeachers();
      }, []);
      
      useEffect(() => {
        async function fetchCourses() {
          try {
            const resp = await courseService.getAllCourses();
            setCourses(resp.data);
          } catch (error) {
            console.error("Error fetching courses:", error);
          }
        }
        fetchCourses();
      }, []);
      
      useEffect(() => {
        async function fetchRooms() {
          try {
            const resp = await roomService.getAllRooms();
            setRooms(resp.data);
          } catch (error) {
            console.error("Error fetching rooms:", error);
          }
        }
        fetchRooms();
      }, []);
      
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
      
      const teacherLookup = teachers.reduce((acc, teacher) => {
        acc[teacher.Teacher_ID] = teacher;
        return acc;
      }, {});
      
      const courseLookup = courses.reduce((acc, course) => {
        acc[course.Course_ID] = course;
        return acc;
      }, {});
      
      const roomLookup = rooms.reduce((acc, room) => {
        acc[room.Room_ID] = room;
        return acc;
      }, {});
      
      const sectionLookup = sections.reduce((acc, section) => {
        acc[section.Section_ID] = section;
        return acc;
      }, {});
      const handleDeleteClick = (compId) => {
        setSelectedCompId(compId);
        setDeleteOpen(true);
      };
      const showSnackbar = (message, color = "neutral") => {
        setSnackbarMessage(message);
        setSnackbarColor(color);
        setSnackbarOpen(true);
    };
    const resetForm = () => {
        setSelectedSlots([]);
        setRoomSlots([]);
        setSelectedCourse("");
        setSelectedRoom("");
        setEditingId(null);
        setSelectedTeacher(""); 
        setSelectedBatch("");
        setSelectedSection("");
        setDescription("");
        setSelectedDate(""); 
        setSessionType("lab"); // Reset session type to default (Lab)
        setSelectedDay("");
      };
      const handleFieldChange = () => {
        setShowTimetable(false); // Hide timetable when any field is changed
      };
      const handleDeleteConfirm = async () => {
        try {
          await CompensatoryService.deleteCompensatory(selectedCompId);
          const response = await CompensatoryService.getAllCompensatory();
          setCompRecords(response.data);
          setDeleteOpen(false);

          showSnackbar("Record deleted successfully!", "success")
        } catch (error) {
          console.error('Error deleting record:', error);
          
          showSnackbar("Error deleting record", "danger")

        }
      };
      const handleEditClick = async (compId) => {
        try {
          const record = await CompensatoryService.getCompensatoryById(compId);
          const data = record.data;
          
            
          setSelectedTeacher(Number(data.Teacher_ID));
    setSelectedBatch(Number(data.Batch_ID));
    setSelectedSection(Number(data.Section_ID));
    setSelectedCourse(Number(data.Course_ID));
    setDescription(data.Desc);
    setSelectedWeek(Number(data.Week_number));
    setSessionType(data.Lab_or_Theory.toLowerCase());
    setSelectedRoom(Number(data.Room_ID).toString());
    setSelectedDay(data.day);
    const assignments = await fetchTeacherAssignments(Number(data.Teacher_ID));
    
    // Process sections after assignments are loaded
    const sectionsForBatch = assignments
      .filter(a => a.Batch_ID === Number(data.Batch_ID))
      .map(a => Number(a.Section));
    setTeacherSections([...new Set(sectionsForBatch)]);

    // Fetch courses and timetable details
    await fetchTeacherCourses(Number(data.Teacher_ID), Number(data.Section_ID));
    await fetchSectionTimetableDetails(Number(data.Section_ID));

    // Wait for all state updates to propagate
    await new Promise(resolve => setTimeout(resolve, 50));
          // Handle slot selection
        //   console.log("Editing Data Types:", {
        //     Teacher_ID: typeof data.Teacher_ID,
        //     Batch_ID: typeof data.Batch_ID,
        //     Section_ID: typeof data.Section_ID,
        //     Course_ID: typeof data.Course_ID,
        //     Room_ID: typeof data.Room_ID
        //   });
        handleViewAvailableRooms();

          // const dayName = new Date(data.Date).toLocaleDateString("en-US", { weekday: 'long' });
          const dayIndex = getDayIndex(data.day);
         
          const timeSlotIndex = getTimeSlotIndex(data.Start_time, data.End_time);
          
          if (dayIndex !== -1 && timeSlotIndex !== -1) {
            const slotKey = `${dayIndex}-${timeSlotIndex}`;
            setSelectedSlots([slotKey]);
            
            // Update roomSlots with the correct time
            const timeSlots = [
              { start: "08:30", end: "09:20" },
              { start: "09:20", end: "10:10" },
              { start: "10:10", end: "11:00" },
              { start: "11:30", end: "12:20" },
              { start: "12:20", end: "01:10" },
              { start: "02:00", end: "02:50" },
              { start: "02:50", end: "03:40" },
              { start: "03:40", end: "04:30" }
            ];
            
            setRoomSlots([timeSlots[timeSlotIndex]]);
          }
          setTimeout(() => {
            document.querySelector('[role="tab"]:nth-child(2)').click();
          }, 100);
          setTimeout(() => {
            if (viewAvailableSlotsButtonRef.current) {
              viewAvailableSlotsButtonRef.current.click();
            }
          }, 100);
          setEditingId(compId);
          setIsEditing(true);  // Set editing mode to true

           // Mark as editing
           

          // Switch to the second tab (edit form)
          document.querySelector('[role="tab"]:nth-child(2)').click();
        } catch (error) {
          console.error('Error fetching record for edit:', error);
          showSnackbar("Error loading record for editing", "danger")
        }
      };
      
      const handleSlotSelect = (slots) => {
        // Define all possible time slots
        if (slots.length > 0) {
          const [dayIndex] = slots[0].split('-').map(Number);
          const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
          setSelectedDay(days[dayIndex]);
        }
        const timeSlots = [
            { start: "08:30", end: "09:20" },
            { start: "09:20", end: "10:10" },
            { start: "10:10", end: "11:00" },
            { start: "11:30", end: "12:20" },
            { start: "12:20", end: "01:10" },
            { start: "02:00", end: "02:50" },
            { start: "02:50", end: "03:40" },
            { start: "03:40", end: "04:30" }
        ];
    
        // Extract unique time indices from selected slots
        const selectedTimes = slots.map(slotKey => {
            const [, timeIndex] = slotKey.split('-');
            return timeSlots[parseInt(timeIndex, 10)];
        });
    
        setRoomSlots(selectedTimes);
        setSelectedSlots(slots);
    };

    const handleViewAvailableSlots = (event) => {
        console.log("Selected Course in State:", selectedCourse); // Debugging log
    
        if (selectedCourse) {
            setShowTimetable(true); // Show timetable if course is selected
        } else {
            showSnackbar("Please select a course before viewing available slots.", "danger")
        }
    };

    const sectionAndBatch = `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Room ${roomLookup[selectedRoom]?.Room_no || ''}`;
    console.log("ROOM",roomLookup[selectedRoom])
    const TimetableData = [
        { time: "08:30 - 09:20", days: ["", "DWH", "", "NLP", ""] },
        { time: "09:20 - 10:10", days: ["", "NLP", "", "NIS", ""] },
        { time: "10:10 - 11:00", days: ["", "NLP", "", "NIS", ""] },
        { time: "11:30 - 12:20", days: ["DWH (pr)", "NIS", "", "DWH", ""] },
        { time: "12:20 - 01:10", days: ["DWH (pr)", "OB", "", "DWH", ""] },
        { time: "02:00 - 02:50", days: ["NIS (pr)", "", "", "OB", ""] },
        { time: "02:50 - 03:40", days: ["NIS (pr)", "", "", "OB", ""] },
        { time: "03:40 - 04:30", days: ["", "", "", "", ""] },
    ];

    const tableHeadings = ['Teacher name', 'Course Name', 'Section', 'Room number','Day' ,'Week', 'Start time', 'End time','Session Type' ,'Status', 'Description', 'Actions'];

    // Map compensatory records from API to table rows
    const tableRows = compRecords.map((record) => [
        teacherLookup[record.Teacher_ID] ? teacherLookup[record.Teacher_ID].Name : "N/A",
        courseLookup[record.Course_ID] ? courseLookup[record.Course_ID].Course_name : "N/A",
        sectionLookup[record.Section_ID] ? sectionLookup[record.Section_ID].Section_name : "N/A",
        roomLookup[record.Room_ID] ? roomLookup[record.Room_ID].Room_no : "N/A",
        record.day,
        record.Week_number,
        record.Start_time,
        record.End_time,
        record.Lab_or_Theory || "N/A", 
        record.Status,
        record.Desc,
        record.Compensatory_ID  // This extra column is used for actions (edit/delete)
      ]);
      
      async function fetchTeacherAssignments(teacherID) {
        try {
          const resp = await batchCourseTeacherAssignmentService.getAllAssignments();
          const numericTeacherID = Number(teacherID);
          const assignments = resp.data.filter(a => 
            Number(a.Teacher_ID) === numericTeacherID // Ensure comparison as numbers
          );
          setTeacherAssignments(assignments);
          
          // Extract Batch IDs as numbers
          const uniqueBatches = [...new Set(assignments.map(a => Number(a.Batch_ID)))];
          setTeacherBatches(uniqueBatches);
          
          // Reset dependent states
          return assignments; // Add this return

        } catch (error) {
          console.error("Error fetching teacher assignments:", error);
        }
      }
      
      const handleViewRoomSlots = async () => {
        if (!selectedRoom || !selectedWeek) {
            
            showSnackbar("Please select a room and a week.", "danger")
            return;
        }
    
        const dayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long' });
    
        try {
            const response = await generationService.getTimetableDetails({
                roomID: selectedRoom,
                day: dayName,
                date: selectedWeek,
            });
    
            // console.log(response.data);
    
            const filteredDetails = response.data.filter(detail => detail.Room_ID === Number(selectedRoom));
    
            const formattedTimetable = [
                { time: "08:30 - 09:20", days: ["", "", "", "", ""] },
                { time: "09:20 - 10:10", days: ["", "", "", "", ""] },
                { time: "10:10 - 11:00", days: ["", "", "", "", ""] },
                { time: "11:30 - 12:20", days: ["", "", "", "", ""] },
                { time: "12:20 - 01:10", days: ["", "", "", "", ""] },
                { time: "02:00 - 02:50", days: ["", "", "", "", ""] },
                { time: "02:50 - 03:40", days: ["", "", "", "", ""] },
                { time: "03:40 - 04:30", days: ["", "", "", "", ""] },
            ];
    
            // Populate timetable with appropriate slots
            filteredDetails.forEach(detail => {
                const startTime = detail.Start_time;
                const endTime = detail.End_time;
            
                const sanitizedDay = detail.Day.trim();
                // console.log(`Sanitized Day: '${sanitizedDay}'`);
            
                // Get day index
                const dayIndex = getDayIndex(sanitizedDay);
                // console.log(`Day index for ${sanitizedDay}:`, dayIndex); // Log dayIndex for debugging
            
                // Get time slot index
                const timesToAdd = splitTimeIntoSlots(startTime, endTime);
                timesToAdd.forEach(slot => {
                    const timeSlotIndex = getTimeSlotIndex(slot.start, slot.end);
                    // console.log(`Time slot index for ${slot.start} - ${slot.end}:`, timeSlotIndex);
            
                    // Log before the condition check
                    // console.log(`Checking condition: timeSlotIndex !== -1 && dayIndex !== -1`);
                    // console.log(`timeSlotIndex: ${timeSlotIndex}, dayIndex: ${dayIndex}`);
                    
                    if (timeSlotIndex !== -1 && dayIndex !== -1) {
                        formattedTimetable[timeSlotIndex].days[dayIndex] = courseLookup[detail.Course_ID]?.Course_name || "";
                    } else {
                        // console.log(`Skipping: Invalid timeSlotIndex or dayIndex`);
                    }
                });
            });
            compRecords.forEach(compRecord => {
              const startTime = compRecord.Start_time;
              const endTime = compRecord.End_time;
              
              const sanitizedDay = compRecord.day.trim();
              
              // Get day index
              const dayIndex = getDayIndex(sanitizedDay);
            
              // Get time slot index
              const timesToAdd = splitTimeIntoSlots(startTime, endTime);
              timesToAdd.forEach(slot => {
                const timeSlotIndex = getTimeSlotIndex(slot.start, slot.end);
                
                if (timeSlotIndex !== -1 && dayIndex !== -1) {
                  // Only add the compensatory class to the timetable if its status is Pending
                  if (compRecord.Status === "Pending") {
                    const courseName = courseLookup[compRecord.Course_ID]?.Course_name || "";
                    formattedTimetable[timeSlotIndex].days[dayIndex] = `${courseName} (COMP)`;
                  }
                }
              });
            });
            
            console.log(compRecords)
    
            console.log("Formatted Timetable:", filteredDetails);
    
            // Update state with formatted timetable data
            setSectionTimetableDetails(formattedTimetable);
            setShowTimetable(true);
    
        } catch (error) {
            console.error("Error fetching timetable details for room", error);
         
            showSnackbar("Error fetching timetable details.", "danger")
        }
    };
    
    
    const splitTimeIntoSlots = (startTime, endTime) => {
        // console.log("START TIME AND END TIME",startTime, endTime)
        const slots = [
            { start: "08:30", end: "09:20" },
            { start: "09:20", end: "10:10" },
            { start: "10:10", end: "11:00" },
            { start: "11:30", end: "12:20" },
            { start: "12:20", end: "01:10" },
            { start: "02:00", end: "02:50" },
            { start: "02:50", end: "03:40" },
            { start: "03:40", end: "04:30" }
        ];
    
        let result = [];
        let currentStartTime = startTime;

        for (let i = 0; i < slots.length; i++) {
            // Check if the current slot matches one of the exceptions
            if (startTime === "11:30:00" && endTime === "01:10:00") {
                // Split it into two slots
                result.push({ start: "11:30", end: "12:20" });
                result.push({ start: "12:20", end: "01:10" });
                return result; // Exit early after adding the special split slots
            }
    
            if (startTime === "12:20:00" && endTime === "01:10:00") {
                // Handle the 12:20 to 01:10 case
                result.push({ start: "12:20", end: "01:10" });
                return result; // Exit early after adding this special slot
            }
        
            // General check for all other slots
            if (timeToMinutes(currentStartTime) < timeToMinutes(slots[i].end) && timeToMinutes(endTime) > timeToMinutes(slots[i].start)) {
                // console.log(slots[i]);
                result.push(slots[i]);
                currentStartTime = slots[i].end;
            }
        
            // Break when currentStartTime reaches endTime
            if (currentStartTime === endTime) {
                break;
            }
        }
    // console.log("RESULT", result)
        return result;
    };
    
     
      // Helper function to convert time to slot index
      const getTimeSlotIndex = (startTime, endTime) => {
        // Define all possible time slots

        const slots = [
            { start: "08:30", end: "09:20" },
            { start: "09:20", end: "10:10" },
            { start: "10:10", end: "11:00" },
            { start: "11:30", end: "12:20" },
            { start: "12:20", end: "01:10" },
            { start: "02:00", end: "02:50" },
            { start: "02:50", end: "03:40" },
            { start: "03:40", end: "04:30" }
          ]; 
        // Trim whitespace and normalize time format (if any extra spaces exist)
        const start = startTime.trim().slice(0, 5); // Ensure the start time is in "HH:MM" format
        const end = endTime.trim().slice(0, 5); // Ensure the end time is in "HH:MM" format
      
        // console.log("Checking times:", start, end);
      
        // Find the matching slot index
        for (let i = 0; i < slots.length; i++) {
          // Also trim the times in slots to ensure consistency in comparison
          const slotStart = slots[i].start.trim();
          const slotEnd = slots[i].end.trim();
      

          if (start === slotStart && end === slotEnd) {
            // console.log("MATCH")
            // console.log(`Comparing with slot ${slotStart} - ${slotEnd}`);
            // console.log("and",start, end )
            return i; // Return the matching slot index
          }
        }
      
        return -1; // If no match found, return -1
      };
      
      
      
      // Helper function to get the index of the day
const getDayIndex = (day) => {
    const dayMap = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5, // Added Saturday
        
    };

    // Log the day and its corresponding index for debugging
    // console.log(`Checking day: '${day}'`);
    
    // Sanitize day to make sure there are no hidden characters
    const sanitizedDay = day.trim();
    // console.log(`Sanitized Day: '${sanitizedDay}'`); // Log sanitized day before looking up

    const dayIndex = dayMap[sanitizedDay];
    // console.log(`Mapped index: ${dayIndex}`); // Log the index value

    return dayIndex !== undefined ? dayIndex : -1;  // If not found, return -1
};

      
      

    //API CODE:


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedDay) {
          showSnackbar("Please select a day by choosing slots","danger")
          return;
        }
        if (roomSlots.length === 0) {
          showSnackbar("Please select at least one time slot","danger")

          return;
        }
      
        try {
          if (editingId) {
            // Update existing record
            const dataToSend = {
              Teacher_ID: selectedTeacher,
              Course_ID: selectedCourse,
              Room_ID: selectedRoom,
              Batch_ID: selectedBatch,
              day: selectedDay,
              Week_number: Number(selectedWeek),
              Start_time: roomSlots[0].start,
              End_time: roomSlots[0].end,
              Status: "Pending",
              Desc: description,
              Section_ID: selectedSection,
              Lab_or_Theory: sessionType,  // Include the session type in the payload

            };
            
            await CompensatoryService.updateCompensatory(editingId, dataToSend);
            setEditingId(null);
            showSnackbar("Record updated successfully!", "success")
          } else {
            // Create new records
            const submissions = roomSlots.map(slot => {
              const dataToSend = {
                Teacher_ID: selectedTeacher,
                Course_ID: selectedCourse,
                Room_ID: selectedRoom,
                Batch_ID: selectedBatch,
                day: selectedDay,
                Week_number: Number(selectedWeek),
                Start_time: slot.start,
                End_time: slot.end,
                Status: "Pending",
                Desc: description,
                Section_ID: selectedSection,
                Lab_or_Theory: sessionType,  // Include the session type in the payload

              };
              console.log(dataToSend)
              return CompensatoryService.createCompensatory(dataToSend);
            });
            
            await Promise.all(submissions);
            showSnackbar("Compensatory Class(es) booked successfully!", "success")
          }
      
          // Refresh data and reset form
          const response = await CompensatoryService.getAllCompensatory();
          setCompRecords(response.data);
          resetForm();
          window.location.reload();
        } 
        
        catch (error) {
          console.error('Error submitting form:', error);
          showSnackbar(`Error ${editingId ? 'updating' : 'submitting'} record(s)`, "danger")
        }
      };
      
    
    
      
    async function fetchTeacherCourses(teacherID, sectionID) {
        try {
          const resp = await batchCourseTeacherAssignmentService.getAllAssignments();
          const numericTeacherID = Number(teacherID);
          const numericSectionID = Number(sectionID);
          // Filter assignments by teacher and section (both as numbers)
          const assignments = resp.data.filter(a => 
            a.Teacher_ID === numericTeacherID &&
            a.Section === numericSectionID
          );
          // Extract unique course IDs from these assignments
          const uniqueCourses = [...new Set(assignments.map(a => a.Course_ID))];
          setTeacherCourses(uniqueCourses);
        } catch (error) {
          console.error("Error fetching teacher courses:", error);
        }
      }
      
      const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };
      
      const handleViewAvailableRooms = () => {
       
        // Determine the day name from the selected date (e.g., "Monday")
        const dayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long' });
        
        // Define working slots (in HH:MM format) excluding break times.
        const workingSlots = [
          { start: "08:30", end: "11:00" },
          { start: "11:30", end: "13:10" },
          { start: "14:00", end: "16:30" }
        ];
        
        // Get timetable details for the selected day
        const detailsForDay = sectionTimetableDetails.filter(detail => detail.Day === dayName);
        
        // For each room, check if at least one working slot is free
        const available = rooms.filter(room => {
            // Filter by session type:
            if (sessionType === "lab" && room.Room_type.toLowerCase() !== "lab") {
                // console.log(sessionType)
                // console.log(room.Room_type)
              return false;
            }
            if (sessionType === "theory" && room.Room_type.toLowerCase() !== "classroom") {
              return false;
            }
            // For this room, extract the booked time ranges from timetable details
            const bookedRanges = detailsForDay
              .filter(detail => Number(detail.Room_ID) === Number(room.Room_ID))
              .map(detail => ({
                start: detail.Start_time,
                end: detail.End_time
              }));
          
          // Check if any working slot does NOT overlap with a booked range
          return workingSlots.some(slot => {
            const slotStart = timeToMinutes(slot.start);
            const slotEnd = timeToMinutes(slot.end);
            const overlaps = bookedRanges.some(used => {
              const usedStart = timeToMinutes(used.start);
              const usedEnd = timeToMinutes(used.end);
              return usedStart < slotEnd && usedEnd > slotStart;
            });
            return !overlaps; // If no overlap, slot is free
          });
        });
        
        setAvailableRooms(available);
      };
      
      const fetchSectionTimetableDetails = async (sectionID) => {
        try {
          // Fetch timetable headers (using apiClient and your endpoint for timetable headers)
          const headersResp = await apiClient.get('/timetable-header/');
          // Fetch timetable details (using generationService's getTimetableDetails function)
          const detailsResp = await generationService.getTimetableDetails();
          
          const headers = headersResp.data;
          const details = detailsResp.data;
          
          // Filter headers to only those that have Section_ID matching the selected section
          const filteredHeaders = headers.filter(
            header => String(header.Section_ID) === String(sectionID)
          );
          
          // Extract the Timetable_IDs from these headers
          const headerIDs = filteredHeaders.map(header => header.Timetable_ID);
          
          // Filter details to only include those whose Timetable_ID is in the filtered headerIDs array
          const filteredDetails = details.filter(
            detail => headerIDs.includes(detail.Timetable_ID)
          );
          
          // Set the state with the filtered timetable details
          setSectionTimetableDetails(filteredDetails);
        } catch (error) {
          console.error("Error fetching timetable details for section", error);
        }
      };
      
      
      
    
    const tabLabels = ['View list of compensatory classes', "Book new compensatory class", 'View booked slots on timetable'];
    const tabContent = [
        <Tables tableHeadings={tableHeadings} tableRows={tableRows}  onEdit={(rowData) => handleEditClick(rowData[rowData.length - 1])}
        onDelete={(rowData) => handleDeleteClick(rowData[rowData.length - 1])}/>,
        <div>
            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 3,
                        maxWidth: 1000,
                        margin: '0 auto',
                        padding: 4,
                        borderRadius: 2,
                        boxShadow: 4,
                        backgroundColor: '#f5f5f5',
                    }}
                >



<FormControl fullWidth required>
<Singledropdown
  label="Teacher"
  menuItems={teachers.map(t => ({
    label: `${t.Teacher_ID} - ${t.Name}`,
    value: t.Teacher_ID,
  }))}
  value={selectedTeacher}
  onChange={(selectedValue) => {
    setSelectedTeacher(selectedValue);
    if (!selectedValue) {
      // Clear all dependent selections if teacher is unselected
      handleFieldChange()
      setTeacherAssignments([]);
      setTeacherBatches([]);
      setSelectedBatch("");
      setTeacherSections([]);
      setSelectedSection("");
      setTeacherCourses([]);
      setSelectedCourse("");
    } else {
      // When a teacher is selected, fetch that teacher's assignments
      fetchTeacherAssignments(selectedValue);
    }
  }}
  required
/>


</FormControl>

<FormControl fullWidth required>
<FormControl fullWidth required>
  <Singledropdown
    label="Batch"
    menuItems={teacherBatches.map(batchID => {
      const batchObj = batches.find(b => b.Batch_ID === batchID);
      return {
        label: batchObj ? batchObj.Batch_name : batchID,
        value: batchID,
      };
    })}
    value={selectedBatch}
    onChange={(selectedValue) => {
      handleFieldChange()
      setSelectedBatch(selectedValue);
      if (!selectedValue) {
        // Clear sections if batch is unselected
        setTeacherSections([]);
        setSelectedSection("");
      } else {
        // Get sections FOR THIS BATCH from ALL teacher assignments
        const sectionsForBatch = teacherAssignments
          .filter(a => a.Batch_ID === selectedValue)
          .map(a => Number(a.Section)); // Convert to number

        const uniqueSections = [...new Set(sectionsForBatch)];
        setTeacherSections(uniqueSections);
      }
      setTeacherCourses([]);
      setSelectedCourse("");
    }}
    required
  />
</FormControl>


</FormControl>

<FormControl fullWidth required>
<Singledropdown
  label="Section"
  menuItems={teacherSections.map(sectionID => {
    const sectionObj = sections.find(s => Number(s.Section_ID) === Number(sectionID));
    return {
      label: sectionObj ? sectionObj.Section_name : sectionID,
      value: sectionID,
    };
  })}
  value={selectedSection}
  onChange={(selectedValue) => {
    handleFieldChange()
    setSelectedSection(selectedValue);
    // When section changes, clear any room selections
    setAvailableRooms([]);
    setSelectedRoom("");
    setRoomSlots([]);
    // Fetch the timetable details for the selected section
    fetchSectionTimetableDetails(selectedValue);
    // Also, fetch teacher courses if needed
    fetchTeacherCourses(selectedTeacher, selectedValue);
  }}
  required
/>


</FormControl>

<FormControl fullWidth required>
<Singledropdown
  label="Course"
  menuItems={teacherCourses.map(courseID => {
    const courseObj = courses.find(c => c.Course_ID === courseID);
    return {
      label: courseObj ? courseObj.Course_name : courseID,
      value: courseID,
    };
  })}
  value={selectedCourse}
  onChange={(selectedValue) => {
    handleFieldChange()
    setSelectedCourse(selectedValue);
    console.log("Selected Course:", selectedValue);
  }}
  required
/>

</FormControl>


                    <TextField
                        id="Description"
                        label="Description"
                        variant="outlined"
                        type="text"
                        value={description} // Bind state
                        onChange={(event) => setDescription(event.target.value)} // Update state
                        fullWidth
                    />


<FormControl fullWidth required>
  <Singledropdown
    label="Select Week"
    menuItems={Array.from({length: 15}, (_, i) => ({
      label: `Week ${i+1}`,
      value: i+1,
    }))}
    value={selectedWeek}
    onChange={(selectedValue) => {
      handleFieldChange()
      setSelectedWeek(selectedValue)}
    }
      required
  />
</FormControl>


                    <RadioButton
  label="Select session type"
  options={['Lab', 'Theory']}
  icons={[<ComputerIcon />, <MenuBookIcon />]}
  value={sessionType}
  onChange={(value) => {
    handleFieldChange()
    setSessionType(value.toLowerCase())}
  
    }  required
/>


<Box sx={{ gridColumn: 'span 2', mt: 2 }}>
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    
    {availableRooms.length > 0 && (
      <FormControl fullWidth required>
        <Singledropdown
          label="Available Rooms"
          menuItems={availableRooms.map(room => ({
            label: room.Room_no, // Ensure this property is used
            value: room.Room_ID,
          }))}
          value={selectedRoom}
          onChange={(selectedValue) => {
            handleFieldChange()
            setSelectedRoom(selectedValue);
            setRoomSlots([]);
          }}
          required
        />
      </FormControl>
    )}
    {selectedRoom && (
      <Button variant="contained" color="secondary" onClick={handleViewRoomSlots} ref={viewAvailableSlotsButtonRef}>
  View available slots in room {roomLookup[selectedRoom]?.Room_no || 'N/A'}
  </Button>
    )}
{selectedRoom && showTimetable && (
  <Box sx={{ mt: 2, width: '100%' }}>
    {sectionTimetableDetails.length > 0 ? (
      <CompensatoryTimetable
        timetable={sectionTimetableDetails}
        onSlotSelect={handleSlotSelect}
        sectionAndBatch={sectionAndBatch}
        selectedCourse={courseLookup[selectedCourse]?.Course_name || selectedCourse}
        initialSelectedSlots={selectedSlots}
      />
    ) : (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        Loading timetable...
      </Box>
    )}
  </Box>
)}

  </Box>
</Box>


                    

<Box sx={{ gridColumn: 'span 2', textAlign: 'center', mt: 2 }}>
  {/* Show submit button only when at least one slot is selected */}
  {selectedSlots.length > 0 && (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      fullWidth
      required
    >
      {editingId ? 'Update' : 'Submit'}
    </Button>
  )}
</Box>

                </Box>
            </form>
        </div>,
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                <RadioButton
  label="Select session type"
  options={['Lab', 'Theory']}
  icons={[<ComputerIcon />, <MenuBookIcon />]}  // Optional icons
  onChange={(value) => setSessionType(value.toLowerCase())} // Update state
  required
/>

                </Box>
            </Box>

            <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 800, height: 200, border: '1px solid #ccc', borderRadius: 2 }} />
            </Box>
            
        </div>,
    ];

    return (
        <div>
                <AlertDialogModal
      open={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onConfirm={handleDeleteConfirm}
      message="Are you sure you want to delete this compensatory record?"
    />
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
            <CustomSnackbar
    open={snackbarOpen}
    onClose={() => setSnackbarOpen(false)}
    message={snackbarMessage}
    color={snackbarColor}
/>

        </div>
    );
}

export default Compensatory;
