import React, { useEffect, useMemo, useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tablereport from "./designelements/tablereport";
import { Box, FormControl, InputLabel, Typography } from "@mui/material";
import { PdfGenerator } from "./designelements/PdfGenerator";
import generationService from "./api/generationService";
import BatchService from "./api/batchService";
import SectionService from "./api/sectionService";
import CourseService from "./api/courseService";
import RoomService from "./api/roomService";
import apiClient from "./api/apiClient";
import teacherService from "./api/teacherService";
import { CircularProgress } from "@mui/material";

 import {
     Dialog, DialogTitle, DialogContent, DialogActions,
     TextField, Select, MenuItem, Button
   } from "@mui/material";
  
// Predefined timetable structure with breaks


  
const TIMETABLE_STRUCTURE = [
    { time: "08:30 - 09:20", isBreak: false },
    { time: "09:20 - 10:10", isBreak: false },
    { time: "10:10 - 11:00", isBreak: false },
    { time: "11:00 - 11:30", isBreak: true, label: "BREAK" },
    { time: "11:30 - 12:20", isBreak: false },
    { time: "12:20 - 01:10", isBreak: false },
    { time: "01:10 - 02:00", isBreak: true, label: "SALAH BREAK" },
    { time: "02:00 - 02:50", isBreak: false },
    { time: "02:50 - 03:40", isBreak: false },
    { time: "03:40 - 04:30", isBreak: false }
];
const fetchTimetableData = async () => {
  try {
    // Fetch all headers
    const { data: headers } = await apiClient.get('/timetable-header/');
    // Manually filter to only published headers
    const publishedHeaders = headers.filter(header => header.Status === "published");

    const { data: detailsAll } = await generationService.getTimetableDetails();
    // Only keep details whose Timetable_ID appears in your published headers
    const publishedIds = publishedHeaders.map(h => h.Timetable_ID);
    const details = detailsAll.filter(d => publishedIds.includes(d.Timetable_ID));

    const { data: allCourses } = await CourseService.getAllCourses();
    const courseMap = Object.fromEntries(allCourses.map(c => [c.Course_ID, c]));

    const dataDict = {};

    for (let header of publishedHeaders) {
      const { data: batch } = await BatchService.getBatchById(header.Batch_ID);
      const { data: section } = await SectionService.getSectionById(header.Section_ID);

      const discipline = batch.Batch_name.slice(0,4);
      const batchKey = batch.Year;
      const sectionKey = section.Section_name;

      dataDict[discipline] ??= {};
      dataDict[discipline][batchKey] ??= {};
      dataDict[discipline][batchKey][sectionKey] ??= { room: '', courses: [], courseData: [] };

      const sectionDetails = details.filter(d => d.Timetable_ID === header.Timetable_ID);
      if (sectionDetails.length) {
        const { data: room } = await RoomService.getRoomById(sectionDetails[0].Room_ID);
        dataDict[discipline][batchKey][sectionKey].room = room.Room_no;
      }

      // Group details by Course_ID
      const grouped = sectionDetails.reduce((acc, d) => {
        acc[d.Course_ID] ??= [];
        acc[d.Course_ID].push(d);
        return acc;
      }, {});

      // Build course objects
      const courseArray = [];
      for (const [courseId, slots] of Object.entries(grouped)) {
        const course = courseMap[courseId];
        const theoryDetail = slots.find(s => s.Theory_or_Lab === 'theory');
        const labDetail = slots.find(s => s.Theory_or_Lab === 'lab');
      
        const theoryTeacher = theoryDetail
          ? (await teacherService.getTeacherById(theoryDetail.Teacher_ID)).data.Name
          : '';
        const labTeacher = labDetail
          ? (await teacherService.getTeacherById(labDetail.Teacher_ID)).data.Name
          : '';
      
        const labRoomNo = labDetail
          ? (await RoomService.getRoomById(labDetail.Room_ID)).data.Room_no
          : null;
            
        courseArray.push({
          code: course.Course_code,
          fullName: course.Course_fullname,
          shortForm: course.Course_name,
          creditHours: course.Credit_hours,
          labHours: course.Is_Lab ? 1 : 0,
          nonCredit: course.Non_Credit,  
          teachers: { theory: theoryTeacher, lab: labTeacher },
          labNumber: parseInt(labRoomNo, 10),
          slots: slots.flatMap(s => {
            const start = s.Start_time.slice(0,5);
            const end = s.End_time.slice(0,5);
            const periods = TIMETABLE_STRUCTURE.filter(slot => !slot.isBreak);
            const startIndex = periods.findIndex(p => p.time.startsWith(start));
            const endIndex = periods.findIndex(p => p.time.endsWith(end));
          
            if (startIndex >= 0 && endIndex >= startIndex) {
              return periods.slice(startIndex, endIndex + 1).map(p => ({
                time: p.time,
                days: [ {"Monday":0,"Tuesday":1,"Wednesday":2,"Thursday":3,"Friday":4,"Saturday":5}[s.Day] ],
                type: s.Theory_or_Lab
              }));
            }
            return [];
          })
        });
      }
      dataDict[discipline][batchKey][sectionKey].courses = courseArray;
      dataDict[discipline][batchKey][sectionKey].courseData = courseArray;
    }

    return dataDict;
  }
  catch(err) {
    console.error(err);
    throw err;
  }
};

  
// Enhanced course data structure
const COURSE_DATA = {
    "BSCS": {
        "2021": {
            "Section A": {
                room: "R-101",
                courses: [
                    {
                        code: "MATH-101",
                        fullName: "Mathematics",
                        shortForm: "MATH",
                        creditHours: 3,
                        labHours: 1,
                        teachers: { theory: "Prof. Ali", lab: "Prof. Ali" },
                        labNumber: 5,
                        slots: [
                            { time: "08:30 - 09:20", days: [0, 2], type: "theory" },
                            { time: "12:20 - 01:10", days: [1, 3], type: "lab" }
                        ]
                    },
                    {
                        code: "PHY-201",
                        fullName: "Physics",
                        shortForm: "PHY",
                        creditHours: 3,
                        labHours: 1,
                        teachers: { theory: "Dr. Khan", lab: "Ms. Sana" },
                        labNumber: 3,
                        slots: [
                            { time: "09:20 - 10:10", days: [0, 1, 3], type: "theory" },
                            { time: "02:00 - 02:50", days: [2, 4], type: "lab" }
                        ]
                    }
                ]
            },
            "Section B": {
                room: "R-102",
                courses: []
            }
        }
    },
    "BSDT": {
        "2021": {
            "Section B": {
                room: "LAB-1",
                courses: [
                    {
                        code: "PHY-201",
                        fullName: "Physics",
                        shortForm: "PHYy",
                        creditHours: 3,
                        labHours: 0,
                        teachers: { theory: "Dr. Blob Khan" },
                        slots: [
                            { time: "02:00 - 02:50", days: [0, 1, 3], type: "theory" }
                        ]
                    }
                ]
            }
        }
    }
};


function Report() {
    const [timetableDict, setTimetableDict] = useState({});
    const [loading, setLoading] = useState(true);
      const [modalOpen, setModalOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [session, setSession] = useState("Fall");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);
    useEffect(() => {
      setLoading(true);
        fetchTimetableData()
          .then(data => setTimetableDict(data))
          .catch(error => console.error("Failed to fetch timetable data", error))
          .finally(() => setLoading(false));
        }, []);
         const handleView = (row) => {
             setSelectedDiscipline(row.Batch);
             setModalOpen(true);
           };
    console.log(timetableDict)
           
    const academicYearOptions = useMemo(() => {
      const current = new Date().getFullYear();
      // generate start years: current-2, current-1, current
      return [current - 2, current - 1, current].map(y => `${y}-${y + 1}`);
    }, []);





    const generatePdf = (discipline, academicYear, session, effectiveDate) => {        if (!timetableDict[discipline]) {
          console.error("No data found for", discipline);
          return;
        }
        const timetables = [];
        // timetableDict[discipline] is an object with keys as batch names (e.g. "2021")
        Object.entries(timetableDict[discipline]).forEach(([batchName, sectionsObj]) => {
          Object.entries(sectionsObj).forEach(([sectionName, sectionData]) => {
            const courseMatrix = {};
TIMETABLE_STRUCTURE.forEach(slot => {
  if (!slot.isBreak) courseMatrix[slot.time] = Array(6).fill('');
});
sectionData.courses.forEach(course => {
    course.slots.forEach(s => {
      courseMatrix[s.time][s.days[0]] = 
        s.type === 'lab'
          ? `${course.shortForm} (Lab ${course.labNumber})`
          : course.shortForm;
    });
  });
  
            timetables.push({
              batch: `${discipline} ${batchName}`,
              section: sectionName,
              room: sectionData.room,
              structure: TIMETABLE_STRUCTURE,
              courses: courseMatrix,
              courseData: sectionData.courseData
            });
          });
        });
      
        // Open a new window and generate the PDF
        const pdfWindow = window.open();
        pdfWindow.document.write(
          "<html><head><title>Timetable Report</title></head><body><div id='pdf-content'></div></body></html>"
        );
        pdfWindow.document.close();
        PdfGenerator.generate({ timetables, academicYear, session, effectiveDate }, pdfWindow);
      };
      
    

    const columns = [{ label: 'Batch name', field: 'Batch' }];
    const rows = Object.keys(timetableDict).map(discipline => ({ Batch: discipline }));

    const tabLabels = ['View list of timetables'];
    const tabContent = [
        <Box key="table" sx={{ 
            maxWidth: 600, 
            width: '90%', 
            margin: '0 auto', 
            padding: 2, 
            boxShadow: 2, 
            bgcolor: 'white', 
            borderRadius: 2 
        }}>
            <Tablereport 
                caption="Timetables" 
                columns={columns} 
                rows={rows} 
                onView={handleView}
            />
        </Box>
    ];
   


    return (
      <div>
{loading ? (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',     // stack vertically
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh'
  }}>
    <CircularProgress />
    <Typography variant="body1" sx={{ mt: 2 }}>
      Fetching Timetable details, this can take up to a minute
    </Typography>
  </Box>
        ) : (
          <>
           <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
  <DialogTitle>Generate Timetable PDF</DialogTitle>
  <DialogContent>
  <FormControl fullWidth margin="dense" required>
  <InputLabel id="year-select-label">Academic Year</InputLabel>
  <Select
    labelId="year-select-label"
    label="Academic Year"
    value={academicYear}
    onChange={e => setAcademicYear(e.target.value)}
  >
    {academicYearOptions.map((yr) => (
      <MenuItem key={yr} value={yr}>
        {yr}
      </MenuItem>
    ))}
  </Select>
</FormControl>

    <Select value={session} fullWidth
      margin="dense" required onChange={e => setSession(e.target.value)}>
      <MenuItem value="Fall">Fall</MenuItem>
      <MenuItem value="Spring">Spring</MenuItem>
    </Select>
    <TextField
      label="Effective Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      fullWidth
      margin="dense"
      value={effectiveDate}
      required
      onChange={e => setEffectiveDate(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
    <Button
  variant="contained"
  disabled={!academicYear || !session || !effectiveDate}
  onClick={() => {
    setModalOpen(false);
    generatePdf(selectedDiscipline, academicYear, session, effectiveDate);
  }}
>
  Generate PDF
</Button>

  </DialogActions>
</Dialog>
          <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        
        </>
        )}
      </div>
    );
    
}

export default Report;