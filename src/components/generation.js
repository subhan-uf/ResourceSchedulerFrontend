import React from "react";
import TeacherTabs from "./designelements/tabforall";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import Buttonn from "./designelements/button";
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';

function Generation() {
    const tableHeadings = ['Teacher ID', 'Name', "NIC", 'Email', 'Phone', 'Batch', 'Section', 'Course (Lab/Theory)'];
    const tableRows = [];

    const tabLabels = ['Generate timetable'];
    const tabContent = [
        <div>
            <form>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr', // Three equal columns layout
                        gap: 2, // Gap between grid items
                        maxWidth: 1000,
                        margin: '0 auto',
                        padding: 4,
                        borderRadius: 2,
                        boxShadow: 4,
                        backgroundColor: '#f5f5f5',
                    }}
                >
                    {/* Dropdowns */}
                    <FormControl fullWidth required>
                        <Singledropdown 
                            label="Batch" 
                            menuItems={[
                                { label: '2021' },
                                { label: '2022' },
                                { label: '2023' },
                            ]}
                            full
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
                            full
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth required>
                        <Singledropdown 
                            label="Disable days" 
                            menuItems={[
                                { label: 'Monday' },
                                { label: 'Tuesday' },
                                { label: 'Wednesday' },
                            ]}
                            full
                            required
                        />
                    </FormControl>
                    
                    {/* Main action buttons for timetable generation */}
                    <Box sx={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Buttonn content="Generate timetable Batch wise" />
                        <Buttonn content="Generate timetable Section wise" />
                    </Box>

                    {/* Placeholder box for timetable display */}
                    <Box sx={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Box sx={{ width: '100%', maxWidth: 800, height: 200, border: '1px solid #ccc', borderRadius: 2 }} />
                    </Box>

                    {/* Additional action buttons organized in a button group */}
                    <Box sx={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <ButtonGroup variant="solid" size="md" orientation="horizontal">
                            <Button variant="outlined">Lock Selected Slots</Button>
                            <Button variant="outlined">Change Teacher Course Assignment</Button>
                            <Button variant="outlined">Change Preference</Button>
                            <Button variant="outlined">Disable a Room</Button>
                        </ButtonGroup>
                    </Box>

                    {/* Draft Button below the table */}
                    <Box sx={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="soft" color="neutral" size="lg">
                            Draft Timetable
                        </Button>
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{ gridColumn: 'span 3', textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="solid"
                            color="primary"
                            type="submit"
                            fullWidth
                            size="lg"
                        >
                            Publish timetable
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

export default Generation;
