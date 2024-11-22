import React, { useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import DynamicForm from "./designelements/dynamicform";
import axios from "axios";

function Preference() {
    const tableHeadingsTime = ['Teacher ID', 'Name', "Course ID", 'Course name', 'Dates', 'Start Time', 'End Time', 'Lab/Theory'];
    const tableHeadingsRoom = ['Teacher ID', 'Name', "Room type", 'Preferred floor'];
    
    const tableRowsTime = [
        ['T001', 'Alice Johnson', 'C101', 'Physics', '2023-11-01, 2023-11-08', '09:00 AM', '10:30 AM', 'Lab'],
        ['T002', 'Bob Smith', 'C102', 'Mathematics', '2023-11-02, 2023-11-09', '11:00 AM', '12:30 PM', 'Theory'],
        // Add more rows as needed
    ];
    
    const tableRowsRoom = [
        ['T001', 'Alice Johnson', 'Lecture Hall', '1st Floor'],
        ['T002', 'Bob Smith', 'Computer Lab', 'Ground Floor'],
        // Add more rows as needed
    ];
    
    const fieldsTime = [
        { componentType: 'SingleDropdown', label: 'Course', name: 'course', options: ['CCN','TAFL','NIS'] },
        { componentType: 'RadioGroup', label: 'Type of class', name: 'ClassType', options: ['Lab', 'Theory'] },
        { componentType: 'TextField', label: '', name: 'date', type: 'date' },
        { componentType: 'SingleDropdown', label: 'Start time', name: 'startTime', options: ['8:30','9:20','10:10','11:30','12:20','2:00','2:50','3:40'] },
        { componentType: 'SingleDropdown', label: 'End time', name: 'endTime', options: ['9:20','10:10','11:30','12:20','2:00','2:50','3:40','4:30'] },
        { componentType: 'Checkbox', label: 'Multimedia', name: 'multimedia' },
        { componentType: 'Checkbox', label: 'Speaker', name: 'speaker' },
    ];
    
    const getSectionTitle = (id) => `Preference ${id}`;
    
    // State for main form data
    const [formData, setFormData] = useState({
        teacherName: '',
        preferredFloor: '',
    });

    // State for dynamic preferences
    const [preferences, setPreferences] = useState([]);

    // Handle changes for main form inputs
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle preferences updates from DynamicForm
    const handlePreferencesChange = (newPreferences) => {
        setPreferences(newPreferences);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const dataToSubmit = {
            ...formData,
            preferences: preferences.map(pref => pref.values),
        };

        try {
            const response = await axios.post("https://6c836a05-f1dc-4255-aa6b-26be7ad9cba1.mock.pstmn.io/preference", dataToSubmit);
            if (response.status === 200) {
                console.log("Submission successful", response.data);
            } else {
                console.error("Submission failed", response.data);
            }
        } catch (error) {
            console.error("Error submitting data", error);
        }
    };

    const tabLabels = ['View list of room preferences', 'View list of class time preferences', "Enter new preference"];
    const tabContent = [
        <Tables tableHeadings={tableHeadingsRoom} tableRows={tableRowsRoom} />,
        <Tables tableHeadings={tableHeadingsTime} tableRows={tableRowsTime} />,
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
                            label="Teacher name"
                            name="teacherName" // Bind with formData
                            value={formData.teacherName}
                            menuItems={[
                                { label: 'Sir Karim' },
                                { label: 'Sir Kamran' },
                                { label: 'Sir Shariq' },
                            ]}
                            onChange={handleInputChange}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <Singledropdown 
                            label="Preferred floor (Optional)"
                            name="preferredFloor" // Bind with formData
                            value={formData.preferredFloor}
                            menuItems={[
                                { label: 'Ground' },
                                { label: '1st' },
                                { label: '2nd' },
                            ]}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <Box sx={{ gridColumn: 'span 2', mt: 2 }}>
                        <DynamicForm 
                            fields={fieldsTime} 
                            sectionTitle="Preference" 
                            getSectionTitle={getSectionTitle} 
                            addButtonText="Add new preference" 
                            onPreferencesChange={handlePreferencesChange} // Pass handler to capture preferences
                        />
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
        </div>
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Preference;
