import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Breadcrumbs, Button, Checkbox, FormControl } from "@mui/material";
import Checkboxx from "./designelements/checkbox";
import Singledropdown from "./designelements/singledropdown";
import BasicBreadcrumbs from "./designelements/breadcrumbs";

function room() {
    const breadcrumbs1 = [
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'view list of rooms', url: '' },
      ];
      const breadcrumbs2 = [
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Add new room', url: '' },
      ];



    const tableHeadings = ['Room number', 'Max capacity', "Floor", 'Room type', 'Multimedia', 'Speaker', 'Room enable/disable'];
    const tableRows = [
        ['101', '30', 'Ground', 'Lecture Hall', 'Available', 'Available', 'Enabled'],
        ['102', '25', 'Ground', 'Computer Lab', 'Not Available', 'Available', 'Enabled'],
        ['201', '50', '1st', 'Auditorium', 'Available', 'Available', 'Disabled'],
        ['202', '35', '1st', 'Lecture Hall', 'Available', 'Not Available', 'Enabled'],
        ['301', '40', '2nd', 'Science Lab', 'Available', 'Available', 'Disabled'],
        ['302', '20', '2nd', 'Tutorial Room', 'Not Available', 'Not Available', 'Enabled'],
        ['401', '60', '3rd', 'Lecture Hall', 'Available', 'Available', 'Enabled'],
        ['402', '45', '3rd', 'Computer Lab', 'Not Available', 'Available', 'Disabled'],
    ];
    
    
    const label = "Select room type";
    const menuItems = [
        { label: 'Ten' },
        { label: 'Twenty' },
        { label: 'Thirty' },
    ];
    

    const tabLabels = ['View list of rooms', "Enter new room"];
    const tabContent = [
        <>
        <BasicBreadcrumbs breadcrumbs={breadcrumbs1}/>
        <Tables tableHeadings={tableHeadings} tableRows={tableRows} />
        </>
        ,
        <>
        <BasicBreadcrumbs breadcrumbs={breadcrumbs2}/>
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
                        label="Room number"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="Max"
                        label="Max capacity"
                        variant="outlined"
                        type="number"
                        fullWidth
                        required
                    />
                    <TextField
                        id="name"
                        label="Floor"
                        variant="outlined"
                        type="number"
                        fullWidth
                        required
                    />
                    <Singledropdown label={label} menuItems={menuItems} required/>
                    <Checkboxx label="Multimedia"/>
                    <Checkboxx label="Speaker"/>
                    
                    
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
        </>
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default room;
