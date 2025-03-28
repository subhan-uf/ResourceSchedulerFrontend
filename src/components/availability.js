import React, { useEffect, useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import { Box, Typography } from "@mui/material";
import Table from '@mui/joy/Table';
import generationService from "./api/generationService";
import teacherService from "./api/teacherService";
import RoomService from "./api/roomService";
import BatchService from "./api/batchService";
import SectionService from "./api/sectionService";
import { TextField } from "@mui/material";

function Availability() {
    // Setting up current day and time
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [teacherAvailability, setTeacherAvailability] = useState([]);
const [roomAvailability, setRoomAvailability] = useState([]);
const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
const [roomSearchQuery, setRoomSearchQuery] = useState("");

useEffect(() => {
    fetchAvailability();
  }, [currentDateTime]);
      
useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const day = dayNames[now.getDay()];
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            setCurrentDateTime(`Current day and Time: ${day}, ${time}`);
        };
        updateTime();
        const intervalId = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);
    const fetchAvailability = async () => {
        try {
            const formatTimeDisplay = (timeStr) =>
                timeStr && timeStr !== "-" ? timeStr.slice(0, 5) : timeStr;
              
          // 1. Fetch timetable headers and details
          const headersRes = await generationService.getTimetableHeaders();
          const detailsRes = await generationService.getTimetableDetails();
          // Filter timetable headers with status Published (case‑insensitive)
          const publishedHeaders = headersRes.data.filter(
            header => header.Status && header.Status.toLowerCase() === "published"
          );
          // Get the list of published Timetable_IDs (assumed to be simple IDs)
          const publishedHeaderIDs = publishedHeaders.map(header => header.Timetable_ID);
          // Filter timetable details whose Timetable_ID is in the published list
          const validDetails = detailsRes.data.filter(detail =>
            publishedHeaderIDs.includes(detail.Timetable_ID)
          );
      
          // 2. Fetch teacher and room data (to get names/numbers)
          const teacherRes = await teacherService.getAllTeachers();
          const teachersData = teacherRes.data;
          const roomRes = await RoomService.getAllRooms();
          const roomsData = roomRes.data;
          const batchRes = await BatchService.getAllBatches();
const batchesData = batchRes.data;
const sectionRes = await SectionService.getAllSections();
const sectionsData = sectionRes.data;
          // 3. Get current day and time
          const now = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDay = dayNames[now.getDay()];
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
          // Helper: convert a time string (e.g., "09:20" or "09:20:00") to minutes since midnight
          const timeStringToMinutes = (timeStr) => {
            const parts = timeStr.split(':').map(Number);
            let hours = parts[0];
            const minutes = parts[1];
            // If the hour is less than 8, assume it's in the afternoon and add 12 hours
            if (hours < 8) {
               hours += 12;
            }
            return hours * 60 + minutes;
        };
        
      
          // 4. Compute teacher availability
          // Group valid timetable details by Teacher_ID for classes on the current day
          const teacherGroups = {};
          validDetails.forEach(detail => {
            if (detail.Day !== currentDay) return;
            const tId = detail.Teacher_ID; // assuming this is an ID (not an object)
            if (!teacherGroups[tId]) teacherGroups[tId] = [];
            teacherGroups[tId].push(detail);
          });

          
          const teacherAvailRows = [];
          teachersData.forEach(teacher => {
            const tId = teacher.Teacher_ID;
            const classesToday = teacherGroups[tId] || [];
            let isInClass = false;
            let currentRoom = "";
            let currentClassEndTime = ""; // to hold the end time of the current class (if any)
            let nextAvailable = "";
            let nextClass = "";
            let currentBatch = "";
          
            // Sort the classes by start time
            classesToday.sort((a, b) => timeStringToMinutes(a.Start_time) - timeStringToMinutes(b.Start_time));
          
            // Check if the teacher is currently in a class and capture current class end time
            classesToday.forEach(cls => {
                const start = timeStringToMinutes(cls.Start_time);
                const end = timeStringToMinutes(cls.End_time);
                if (currentMinutes >= start && currentMinutes < end) {
                  isInClass = true;
                  // Find the room object from roomsData
                  const roomObj = roomsData.find(r => r.Room_ID === cls.Room_ID);
                  if (roomObj) {
                    // Set currentRoom to the room number and append " (Lab)" if the type is lab
                    currentRoom = roomObj.Room_no;
                    if (roomObj.Room_type && roomObj.Room_type.toLowerCase() === "lab") {
                      currentRoom = `Lab ${currentRoom}`;
                    }
                  } else {
                    currentRoom = cls.Room_ID;
                  }
                  currentClassEndTime = cls.End_time; // save the current class's end time
                }
              });
              
          
            if (isInClass) {
              // When currently in class, set "next available" to the end time of the current class.
              nextAvailable = currentClassEndTime;
              // Optionally, you might still want to show when the next class starts if one exists.
              const futureClasses = classesToday.filter(cls => timeStringToMinutes(cls.Start_time) > currentMinutes);
              if (futureClasses.length > 0) {
                nextClass = futureClasses[0].Start_time;
              } else {
                nextClass = "-";
              }
            } else {
              // Teacher is not in class, so use the first future class if available.
              const futureClasses = classesToday.filter(cls => timeStringToMinutes(cls.Start_time) > currentMinutes);
              if (futureClasses.length > 0) {
                const next = futureClasses[0];
                nextClass = next.Start_time;
                nextAvailable = next.End_time;
              } else {
                nextClass = "-";
                nextAvailable = "-";
              }
            }
            let batchSectionStr = "-";
            // If the teacher is in class and we have a currentBatch (from the header), look it up
            if (isInClass && currentBatch) {
              const batchObj = batchesData.find(b => b.Batch_ID === currentBatch);
              if (batchObj) {
                // Assuming the batch object has a Section_ID property
                const sectionObj = sectionsData.find(s => s.Section_ID === batchObj.Section_ID);
                batchSectionStr = batchObj.Name + " - Section " + (sectionObj ? sectionObj.Name : "");
              }
            }
            teacherAvailRows.push([
              teacher.Name,
              isInClass ? "Unavailable" : "Available",
              isInClass ? currentRoom : "-",
            //   batchSectionStr,
            formatTimeDisplay(nextClass),
            formatTimeDisplay(nextAvailable)
            ]);
          });
          teacherAvailRows.sort((a, b) => {
            if (a[0].toLowerCase() < b[0].toLowerCase()) return -1;
            if (a[0].toLowerCase() > b[0].toLowerCase()) return 1;
            return 0;
          });
          console.log(teacherAvailRows)
          setTeacherAvailability(teacherAvailRows);
      
          // 5. Compute room availability
          // Group valid timetable details by Room_ID for current day
          const roomGroups = {};
          validDetails.forEach(detail => {
            if (detail.Day !== currentDay) return;
            const rId = detail.Room_ID;
            if (!roomGroups[rId]) roomGroups[rId] = [];
            roomGroups[rId].push(detail);
          });


          const roomAvailRows = [];
          roomsData.forEach(room => {
                      // If room type is "Lab", append " (Lab)" to the room number display.
const displayRoomNo =
room.Room_type && room.Room_type.toLowerCase() === "lab"
  ? `Lab ${room.Room_no}`
  : room.Room_no;
            const rId = room.Room_ID;
            const classesToday = roomGroups[rId] || [];
            let isInClass = false;
            let currentBatch = "";
            let currentClassEndTime = ""; // to store current class's end time if room is occupied
            let nextAvailable = "";
            let nextClass = "";
          
            // Sort the classes by start time
            classesToday.sort((a, b) => timeStringToMinutes(a.Start_time) - timeStringToMinutes(b.Start_time));
          
            // Check if the room is currently in use and capture the current class's end time
            classesToday.forEach(cls => {
              const start = timeStringToMinutes(cls.Start_time);
              const end = timeStringToMinutes(cls.End_time);
              if (currentMinutes >= start && currentMinutes < end) {
                isInClass = true;
                // Look up the timetable header for this detail to get the Batch_ID
                const header = publishedHeaders.find(h => h.Timetable_ID === cls.Timetable_ID);
                currentBatch = header ? header.Batch_ID : "-";
                currentClassEndTime = cls.End_time;
              }
            });
            const minutesToTimeString = (minutes) => {
                // Convert total minutes into hours and minutes
                const hrs = Math.floor(minutes / 60);
                const mins = minutes % 60;
              
                // Convert to 12-hour format if desired, or keep it 24-hour
                // Below is a simple zero-padded 24-hour style
                const hoursStr = hrs.toString().padStart(2, '0');
                const minsStr = mins.toString().padStart(2, '0');
                
                // If you prefer a 12-hour format with AM/PM, you'd do something like:
                // const suffix = hrs >= 12 ? 'PM' : 'AM';
                // const adjustedHours = hrs % 12 || 12;
              
                return `${hoursStr}:${minsStr}`;
              };
              
            if (isInClass) {
                // Start by assuming the room becomes free when the current class ends
                let chainEndMinutes = timeStringToMinutes(currentClassEndTime);
              
                // Get all future classes (start time > current time)
                const futureClasses = classesToday.filter(cls =>
                  timeStringToMinutes(cls.Start_time) > currentMinutes
                );
              
                // Chain consecutive classes
                futureClasses.forEach(cls => {
                  const clsStart = timeStringToMinutes(cls.Start_time);
                  const clsEnd = timeStringToMinutes(cls.End_time);
                  // If the next class starts on or before chainEnd, extend the chain
                  if (clsStart <= chainEndMinutes) {
                    chainEndMinutes = Math.max(chainEndMinutes, clsEnd);
                  }
                });
              
                // nextAvailable is now the final free time after chaining
                nextAvailable = minutesToTimeString(chainEndMinutes);
              
                // nextClass at is simply the next future class's start time (if any)
                nextClass =
                  futureClasses.length > 0
                    ? futureClasses[0].Start_time
                    : "-";
              }
              else {
              // If not occupied, show details from the first upcoming class
              const futureClasses = classesToday.filter(cls => timeStringToMinutes(cls.Start_time) > currentMinutes);
              if (futureClasses.length > 0) {
                const next = futureClasses[0];
                nextClass = next.Start_time;
                nextAvailable = next.End_time;
              } else {
                nextClass = "-";
                nextAvailable = "-";
              }
            }
            let batchSectionStr = "-";
// If the room is in use and we have a currentBatch from the header, look it up
if (isInClass && currentBatch) {
  const batchObj = batchesData.find(b => b.Batch_ID === currentBatch);
  console.log(batchObj)
  if (batchObj) {
    const sectionObj = sectionsData.find(s => s.Section_ID === batchObj.Section_ID);
    
    // batchSectionStr = batchObj.Batch_name + " - Section " + (sectionObj ? sectionObj.Section_name : "");
    batchSectionStr = batchObj.Batch_name 
  }
}

            roomAvailRows.push([
                displayRoomNo,
              isInClass ? "Unavailable" : "Available",
              batchSectionStr,
              formatTimeDisplay(nextClass),
              formatTimeDisplay(nextAvailable)
            ]);
          });
          // Sort roomAvailRows in ascending order by room number (assumed to be in index 0)
roomAvailRows.sort((a, b) => {
    if (a[0].toLowerCase() < b[0].toLowerCase()) return -1;
    if (a[0].toLowerCase() > b[0].toLowerCase()) return 1;
    return 0;
  });
  
          
          setRoomAvailability(roomAvailRows);
        } catch (error) {
          console.error("Error fetching availability:", error);
        }
      };
      


    // Exclude the last column for table headings and rows
    

    // Custom Table Component with Joy UI
    const CustomTable = ({ headings, rows }) => (
        <Table>
            <thead>
                <tr>
                    {headings.map((heading, index) => (
                        <th key={index} style={{ padding: '10px', textAlign: 'left' }}>{heading}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={{ padding: '10px' }}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    // Tabs Content
    const tableHeadingsTeacher = ['Teacher Name', 'Current Availability', 'Teaching in Room',  'Next class at', 'Availablity after next Class'];
    const tableHeadingsRoom = ['Room number', 'Current Availability', 'Batch using the Room', 'Next class at', 'Availablity after next Class'];
    
    const tabLabels = ['View teacher availability', 'View room availability'];
    const tabContent = [
<Box key="teacher">
  <Typography variant="body1" sx={{ mb: 2 }}>{currentDateTime}</Typography>
  <TextField
    placeholder="Search teachers..."
    value={teacherSearchQuery}
    onChange={(e) => setTeacherSearchQuery(e.target.value)}
    variant="outlined"
    size="small"
    sx={{ mb: 2, width: "300px", ml: 0 }}
  />
  <CustomTable
    headings={tableHeadingsTeacher}
    rows={
      teacherAvailability.filter((row) =>
        row.join(" ").toLowerCase().includes(teacherSearchQuery.toLowerCase())
      )
    }
  />
</Box>,
<Box key="room">
  <Typography variant="body1" sx={{ mb: 2 }}>{currentDateTime}</Typography>
  <TextField
    placeholder="Search rooms..."
    value={roomSearchQuery}
    onChange={(e) => setRoomSearchQuery(e.target.value)}
    variant="outlined"
    size="small"
    sx={{ mb: 2, width: "300px", ml: 0 }}
  />
  <CustomTable
    headings={tableHeadingsRoom}
    rows={
      roomAvailability.filter((row) =>
        row.join(" ").toLowerCase().includes(roomSearchQuery.toLowerCase())
      )
    }
  />
</Box>
    ];
    

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Availability;
