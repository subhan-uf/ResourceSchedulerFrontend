import React, { useEffect, useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import { Box, Typography } from "@mui/material";
import Table from '@mui/joy/Table';

function Availability() {
    // Setting up current day and time
    const [currentDateTime, setCurrentDateTime] = useState('');

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

    // Original data with all columns
    const tableHeadingsTeacher = ['Teacher Name', 'Availability', 'Teaching in Room', 'Next available at', 'Next class at'];
const tableRowsTeacher = [
    ['Sir Karim', 'Available', 'Room 101', '10:00 am', '3:40 pm'],
    ['Ms. Sara', 'Unavailable', 'Room 102', '1:00 pm', '4:00 pm'],
    ['Mr. Ahmed', 'Available', 'Room 103', '11:30 am', '2:00 pm'],
    ['Ms. Hira', 'Available', 'Room 104', '9:00 am', '12:00 pm'],
    ['Dr. Asad', 'Unavailable', 'Room 105', '2:30 pm', '5:00 pm'],
    ['Prof. Anwar', 'Available', 'Room 106', '1:30 pm', '4:30 pm'],
    ['Mr. Iqbal', 'Unavailable', 'Room 107', '3:00 pm', '5:30 pm'],
    ['Ms. Alia', 'Available', 'Room 108', '10:30 am', '1:30 pm'],
    ['Mr. Farhan', 'Unavailable', 'Room 109', '12:30 pm', '3:30 pm'],
    ['Ms. Fiza', 'Available', 'Room 110', '8:30 am', '11:30 am']
];

const tableHeadingsRoom = ['Room number', 'Availability', 'Current Batch studying', 'Next available at', 'Next class at'];
const tableRowsRoom = [
    ['101', 'Available', 'Batch 2021', '10:30 am', '2:00 pm'],
    ['102', 'Unavailable', 'Batch 2022', '11:30 am', '1:30 pm'],
    ['103', 'Available', 'Batch 2021', '9:00 am', '12:00 pm'],
    ['104', 'Unavailable', 'Batch 2023', '1:30 pm', '3:30 pm'],
    ['105', 'Available', 'Batch 2022', '2:00 pm', '4:30 pm'],
    ['106', 'Available', 'Batch 2024', '8:30 am', '11:00 am'],
    ['107', 'Unavailable', 'Batch 2021', '3:00 pm', '5:00 pm'],
    ['108', 'Available', 'Batch 2023', '12:30 pm', '3:00 pm'],
    ['109', 'Unavailable', 'Batch 2022', '10:00 am', '1:00 pm'],
    ['110', 'Available', 'Batch 2024', '9:30 am', '12:30 pm']
];

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
    const tabLabels = ['View teacher availability', "View room availability"];
    const tabContent = [
        <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>{currentDateTime}</Typography>
            <CustomTable headings={tableHeadingsTeacher} rows={tableRowsTeacher} />
        </Box>,
        <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>{currentDateTime}</Typography>
            <CustomTable headings={tableHeadingsRoom} rows={tableRowsRoom} />
        </Box>,
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Availability;
