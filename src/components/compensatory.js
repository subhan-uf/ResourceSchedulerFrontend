import React, { useState } from "react";
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

function Compensatory() {
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [showTimetable, setShowTimetable] = useState(false); // State to control timetable visibility
    const [sessionType, setSessionType] = useState(""); // State for Lab or Theory
    const [teacher, setTeacher] = useState("");
    const [section, setSection] = useState("");
    const [description, setDescription] = useState("");

    const handleSlotSelect = (slots) => {
        setSelectedSlots(slots);
    };

    const handleViewAvailableSlots = (event) => {
        console.log("Selected Course in State:", selectedCourse); // Debugging log
    
        if (selectedCourse) {
            setShowTimetable(true); // Show timetable if course is selected
        } else {
            alert("Please select a course before viewing available slots.");
        }
    };

    const sectionAndBatch = "Section-B Batch 2021";
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

    const tableHeadings = ['Teacher name', 'Course Name', "Section", 'Room number', 'Date', 'Start time', 'End time', 'Status', 'Description'];
    const tableRows = [
        ['Alice Johnson', 'Physics', 'A', '101', '2023-11-01', '09:00 AM', '10:30 AM', 'Scheduled', 'Introduction to Mechanics'],
        ['Bob Smith', 'Mathematics', 'B', '102', '2023-11-02', '11:00 AM', '12:30 PM', 'Completed', 'Algebra Review'],
        ['Charlie Davis', 'Chemistry', 'C', '103', '01:00 PM', '02:30 PM', 'Cancelled', 'Organic Chemistry Basics'],
        ['David Wilson', 'Biology', 'A', '104', '10:00 AM', '11:30 AM', 'Scheduled', 'Introduction to Genetics'],
        ['Eve Brown', 'Computer Science', 'B', '105', '02:00 PM', '03:30 PM', 'Scheduled', 'Data Structures Overview'],
    ];


    //API CODE:

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
    
        // Create the data object to send
        const dataToSend = {
            teacher: teacher, // Selected teacher
            section: section, // Selected section
            course: selectedCourse, // Selected course
            description: description, // Input description
            sessionType: sessionType, // Lab or Theory
            selectedSlots: selectedSlots, // Selected slots
        };
    
        try {
            // Make the POST request
            const response = await axios.post('https://6c836a05-f1dc-4255-aa6b-26be7ad9cba1.mock.pstmn.io/preference', dataToSend);
            
            // Handle successful response
            console.log('Form submitted successfully:', response.data);
            alert('Form submitted successfully!');
        } catch (error) {
            // Handle error
            console.error('Error submitting the form:', error);
            alert('An error occurred while submitting the form.');
        }
    };
    
    const tabLabels = ['View list of compensatory classes', "Book new compensatory class", 'View booked slots on timetable'];
    const tabContent = [
        <Tables tableHeadings={tableHeadings} tableRows={tableRows} />,
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
                            menuItems={[
                                { label: 'Sir Karim' },
                                { label: 'Sir Kamran' },
                                { label: 'Sir Shariq' },
                            ]}
                            value={teacher} // Bind state
    onChange={(newValue) => setTeacher(newValue.target.value)} // Update state
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth required>
                        <Singledropdown
                            label="Section"
                            menuItems={[
                                { label: 'A' },
                                { label: 'B' },
                                { label: 'C' },
                            ]}
                            value={section} // Bind state
    onChange={(newValue) => setSection(newValue.target.value)} // Update state
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth required>
                        <Singledropdown
                            label="Course"
                            menuItems={[
                                { label: 'CCN' },
                                { label: 'TAFL' },
                                { label: 'NIS' },
                            ]}
                            value={selectedCourse} // Bind state
                            onChange={(newValue) => {
                                setSelectedCourse(newValue.target.value); 
                                console.log(newValue.target.value)// Update state
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
                        <TextField label='' type="date" required />
                    </FormControl>

                    <RadioButton
                        label="Select session type"
                        options={['Lab', 'Theory']}
                        icons={[<ComputerIcon />, <MenuBookIcon />]}
                        onChange={(value) => setSessionType(value)}
                        required
                    />

                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleViewAvailableSlots}
                        >
                            View available slots
                        </Button>
                    </Box>

                    {showTimetable && (
                        <Box
                            sx={{
                                gridColumn: 'span 2',
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 800,
                                    
                                    border: '1px solid #ccc',
                                    borderRadius: 2,
                                    overflow: 'visible',
                                }}
                            >
                                <CompensatoryTimetable
                                    timetable={TimetableData}
                                    onSlotSelect={handleSlotSelect}
                                    sectionAndBatch={sectionAndBatch}
                                    selectedCourse={selectedCourse}
                                />
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ gridColumn: 'span 2', textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            required
                        >
                            Submit
                        </Button>
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
                        icons={[<ComputerIcon />, <MenuBookIcon />]}
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
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Compensatory;
