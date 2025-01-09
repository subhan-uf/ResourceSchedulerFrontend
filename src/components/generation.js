import React, { useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import Buttonn from "./designelements/button";
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';
import Timetable from "./designelements/timetable";

function Generation() {
    const tableHeadings = ['Teacher ID', 'Name', "NIC", 'Email', 'Phone', 'Batch', 'Section', 'Course (Lab/Theory)'];
    const tableRows = [];
    const [lockedSlots, setLockedSlots] = useState([]);

    const TimetableData= [
        // Sample data: Replace this with the actual timetable data
        { time: "08:30 - 09:20", days: ["", "DWH", "", "NLP", ""] },
        { time: "09:20 - 10:10", days: ["", "NLP", "", "NIS", ""] },
        { time: "10:10 - 11:00", days: ["", "NLP", "", "NIS", ""] },
        { time: "11:30 - 12:20", days: ["DWH (pr)","NIS","","DWH",""] },
        { time: "12:20 - 01:10", days: ["DWH (pr)","OB","","DWH",""] },
        { time: "02:00 - 02:50", days: ["NIS (pr)","","","OB",""] },
        { time: "02:50 - 03:40", days: ["NIS (pr)","","","OB",""] },
        { time: "03:40 - 04:30", days: ["","","","",""] },
      ]
      const slotColors = {
        "0-3": "bg-green-200",
        "0-4": "bg-green-200",
        "1-1": "bg-yellow-200", // Monday 08:30-09:20
        "1-2": "bg-yellow-200", // Tuesday 10:10-11:00
        "1-4": "bg-red-200", // Friday 09:20-10:10
        "3-3": "bg-red-200",
        "3-4": "bg-red-200",
        "3-5": "bg-yellow-200", // Monday 08:30-09:20
        "3-6": "bg-yellow-200",
        "3-1": "bg-green-200",
        "3-2": "bg-green-200",
      };
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

                  
                    
                    {/* Main action buttons for timetable generation */}
                    <Box sx={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Buttonn content="Generate timetable Batch wise" />
                        <Buttonn content="Generate timetable Section wise" />
                    </Box>

                    {/* Placeholder box for timetable display */}
                    <Box
  sx={{
    gridColumn: 'span 3',
    display: 'flex',
    justifyContent: 'center',
    mt: 2,
  }}
>
<div className="w-full max-w-4xl border border-gray-300 rounded-lg p-4">
    <Timetable timetable={TimetableData} slotColors={slotColors} sectionAndBatch="Section B - Batch 2021" lockedSlots={lockedSlots} onLockedSlotsChange={(updatedSlots) => setLockedSlots(updatedSlots)}/>
  </div>
   
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
