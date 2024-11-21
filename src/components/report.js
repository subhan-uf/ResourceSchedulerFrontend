import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tablereport from "./designelements/tablereport";
import { Box } from "@mui/material";

function Report() {
    const handleView = (row) => {
        alert(`Viewing details for ${row.Batch} - Section ${row.Section}`);
    };

    const columns = [
        { label: 'Batch name', field: 'Batch' },
        { label: 'Section', field: 'Section' },
    ];

    const rows = [
        { Batch: '2021', Section: 'A' },
        { Batch: '2022', Section: 'B' },
    ];

    const tabLabels = ['View list of timetables'];
    const tabContent = [
        <Box 
            sx={{
                maxWidth: 600, // Set a max width to make the table container smaller
                width: '90%',  // Adjusts to viewport, up to the max width
                margin: '0 auto', // Centers the box horizontally
                padding: 2,
                boxShadow: 2,
                bgcolor: 'white', // Optional: Background color
                borderRadius: 2 // Optional: Rounded corners
            }}
        >
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
