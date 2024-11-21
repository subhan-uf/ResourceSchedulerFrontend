import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";

function Course(){
    const tableHeadings = ['Course Code', 'Course Name', 'Batch', 'Max Classes per Day', 'Credit Hours', 'Description']
   

const tableRows = [
    ['CS101', 'Introduction to Computer Science', 'Batch 2021', 3, 4, 'An introductory course on computer science fundamentals, including programming and algorithms.'],
    ['MA202', 'Calculus II', 'Batch 2022', 2, 3, 'Advanced calculus covering integrals, derivatives, and applications.'],
    ['PH303', 'Physics - Mechanics', 'Batch 2023', 4, 4, 'A course focusing on the principles of mechanics, kinematics, and dynamics.'],
    ['CS204', 'Data Structures and Algorithms', 'Batch 2021', 3, 3, 'Covers basic data structures like arrays, linked lists, and algorithmic techniques for problem-solving.'],
    ['EE305', 'Electronics II', 'Batch 2022', 2, 4, 'Study of electronic circuits, semiconductors, and their applications in modern technology.'],
    ['CH101', 'Chemistry I', 'Batch 2023', 3, 3, 'Basic principles of chemistry, including atomic structure, chemical reactions, and bonding.'],
    ['CS301', 'Operating Systems', 'Batch 2021', 4, 3, 'Covers concepts of operating systems, including memory management, scheduling, and file systems.'],
    ['EN102', 'English Literature', 'Batch 2022', 2, 2, 'Exploration of classic and modern literature, focusing on analysis and interpretation of texts.'],
    ['MT404', 'Mathematics - Linear Algebra', 'Batch 2023', 3, 3, 'Covers vector spaces, matrices, determinants, and linear transformations.'],
    ['CS105', 'Web Development', 'Batch 2021', 3, 2, 'Introduction to front-end and back-end web development, including HTML, CSS, and JavaScript.']
];

    const tabLabels = ['View list of courses', "Enter new course"];
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
                    <TextField
                        id="course-code"
                        label="Course Code"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="phone"
                        label="Course name"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="Course Description"
                        label="Course description"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />

                    <TextField
                        id="Course Description"
                        label="Max classes per day"
                        variant="outlined"
                        type="number"
                        fullWidth
                        required
                    />
                   
                  
                    <FormControl fullWidth required>
                        <Singledropdown
                            label="Credit hours"
                            menuItems = {[
                                { label: '2' },
                                { label: '3' },
                                { label: '4' },
                            ]}
                            fullWidth
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth required>
                        <Singledropdown
                            label="Batch"
                            menuItems = {[
                                { label: '2021' },
                                { label: '2022' },
                                { label: '2023' },
                                { label: '2024' },
                            ]}
                            fullWidth
                            required
                        />
                    </FormControl>
                    
                    <Box sx={{ gridColumn: 'span 2', textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </form>
        </div>
    ];
    return(
        <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
    )
}

export default Course