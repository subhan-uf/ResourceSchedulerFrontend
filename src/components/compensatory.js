import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import RadioButton from "./designelements/radiobutton";
import ComputerIcon from '@mui/icons-material/Computer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Buttonn from "./designelements/button";

function Compensatory() {
    const tableHeadings = ['Teacher name', 'Course Name', "Section", 'Room number', 'Date', 'Start time', 'End time', 'Status','Description'];
    const tableRows = [
        ['Alice Johnson', 'Physics', 'A', '101', '2023-11-01', '09:00 AM', '10:30 AM', 'Scheduled', 'Introduction to Mechanics'],
        ['Bob Smith', 'Mathematics', 'B', '102', '2023-11-02', '11:00 AM', '12:30 PM', 'Completed', 'Algebra Review'],
        ['Charlie Davis', 'Chemistry', 'C', '103', '2023-11-03', '01:00 PM', '02:30 PM', 'Cancelled', 'Organic Chemistry Basics'],
        ['David Wilson', 'Biology', 'A', '104', '2023-11-04', '10:00 AM', '11:30 AM', 'Scheduled', 'Introduction to Genetics'],
        ['Eve Brown', 'Computer Science', 'B', '105', '2023-11-05', '02:00 PM', '03:30 PM', 'Scheduled', 'Data Structures Overview'],
    ];
    

    const tabLabels = ['View list of compensatory classes', "Book new compensatory class", 'View booked slots on timetable'];
    const tabContent = [
        <Tables tableHeadings={tableHeadings} tableRows={tableRows} />,
        <div>
            <form>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr', // Two equal columns layout
                        gap: 3, // Gap between grid items
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
                            menuItems = {[
                                { label: 'Sir Karim' },
                                { label: 'Sir Kamran' },
                                { label: 'Sir Shariq' },
                            ]}
                            fullWidth
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth required>
                    <Singledropdown
                            label="Section"
                            menuItems = {[
                                { label: 'A' },
                                { label: 'B' },
                                { label: 'C' },
                            ]}
                            fullWidth
                            required
                        />
                    </FormControl>


                    <FormControl fullWidth required>
                    <Singledropdown
                            label="Course"
                            menuItems = {[
                                { label: 'CCN' },
                                { label: 'TAFL' },
                                { label: 'NIS' },
                            ]}
                            fullWidth
                            required
                        />
                    </FormControl>


                    <TextField
                        id="Description"
                        label="Description"
                        variant="outlined"
                        type="text"
                        fullWidth
                        
                    />

                    <FormControl fullWidth required>
                        <TextField label='' type="Date" required/>
                    </FormControl>
                        
                        <RadioButton
                            label="Select session type"
                            options={['Lab','Theory']}
                            icons={[<ComputerIcon/>,<MenuBookIcon/>]}
                            required
                            />

                    {/* Centered Buttonn Component and Box */}
                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Buttonn content="View available slots"/>
                    </Box>

                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        {/* Placeholder for table with available rooms */}
                        <Box sx={{ width: '100%', maxWidth: 800, height: 200, border: '1px solid #ccc', borderRadius: 2 }} />
                    </Box>
                    
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
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2 
            }}
        >
            {/* Center and restrict the width of RadioButton */}
            <Box sx={{ width: '100%', maxWidth: 300 }}>
                <RadioButton
                    label="Select session type"
                    options={['Lab','Theory']}
                    icons={[<ComputerIcon/>,<MenuBookIcon/>]}
                    required
                />
            </Box>
        </Box>
    
        <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', mt: 2 }}>
            {/* Placeholder for table with available rooms */}
            <Box sx={{ width: '100%', maxWidth: 800, height: 200, border: '1px solid #ccc', borderRadius: 2 }} />
        </Box>
    </div>
    
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Compensatory;
