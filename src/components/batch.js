import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import DynamicForm from "./designelements/dynamicform";


function batch() {
    const tableHeadings = ['Batch name', 'Year', "Sections", 'Max students per section'];
    const tableRows = [
        [ 'Batch A', 2021, 3, 30], // Batch ID, Batch Name, Year, Sections, Max Students per Section
        [ 'Batch B', 2020, 4, 25],
        [ 'Batch C', 2019, 2, 35],
        [ 'Batch D', 2022, 5, 20],
        [ 'Batch E', 2023, 3, 40],
    ];
    const fields = [
        { componentType: 'TextField', label: 'Section Name', name: 'sectionName', type: 'text' },
        {componentType: 'TextField', label: 'Max Students', name: 'maxStudents', type: 'number' },
        { componentType: 'TextField', label: 'Max Class Gaps per Day', name: 'maxGaps', type: 'number' },
      ];
    
    
      const getSectionTitle = (id) => `Section ${String.fromCharCode(64 + id)}`;

    const tabLabels = ['View list of batches', "Enter new batch"];
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
                        id="teacher-id"
                        label="Batch name"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                   
                    <FormControl fullWidth required>
                        <Singledropdown label="Year"  menuItems = {[
                                { label: '2021' },
                                { label: '2022' },
                                { label: '2023' },
                                { label: '2024' },
                            ]}/>
                    </FormControl>
                    <FormControl fullWidth required>
                        <DynamicForm fields={fields} sectionTitle="Section" getSectionTitle={getSectionTitle} addButtonText="Add new Section"/>
                    </FormControl>
                    
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
        </div>
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default batch;
