import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tablereport from "./designelements/tablereport";
import { Box } from "@mui/material";
import { PdfGenerator } from "./designelements/PdfGenerator";

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
    const handleView = (row) => {
        generatePdf(row.Batch);
    };

    const generatePdf = (batchName) => {
        const batchData = COURSE_DATA[batchName];
        const timetables = [];
    
        Object.entries(batchData).forEach(([year, yearSections]) => {
            Object.entries(yearSections).forEach(([sectionName, sectionData]) => {
                const courseSlots = {};
                TIMETABLE_STRUCTURE.forEach(slot => {
                    if (!slot.isBreak) courseSlots[slot.time] = Array(6).fill('');
                });
    
                sectionData.courses.forEach(course => {
                    course.slots.forEach(slot => {
                        if (courseSlots[slot.time]) {
                            slot.days.forEach(dayIdx => {
                                const suffix = slot.type === 'lab' ? ` (Lab ${course.labNumber})` : '';
                                courseSlots[slot.time][dayIdx] = `${course.shortForm}${suffix}`;
                            });
                        }
                    });
                });
    
                timetables.push({
                    batch: `${batchName} ${year}`,
                    section: sectionName,
                    room: sectionData.room,
                    structure: TIMETABLE_STRUCTURE,
                    courses: courseSlots,
                    courseData: sectionData.courses
                });
            });
        });
    
        const pdfWindow = window.open();
        pdfWindow.document.write(
            "<html><head><title>Timetable Report</title></head><body><div id='pdf-content'></div></body></html>"
        );
        pdfWindow.document.close();
        PdfGenerator.generate({ timetables }, pdfWindow);
    };
    

    const columns = [{ label: 'Batch name', field: 'Batch' }];
    const rows = Object.keys(COURSE_DATA).map(batch => ({ Batch: batch }));

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
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Report;