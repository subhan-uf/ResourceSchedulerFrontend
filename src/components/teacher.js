import React, { useState } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Button, FormControl } from "@mui/material";
import axios from "axios";
import BasicBreadcrumbs from "./designelements/breadcrumbs";

function Teacher() {
  const breadcrumbs1 = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'view list of teachers', url: '' },
  ];
  const breadcrumbs2 = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Add new teacher', url: '' },
  ];
    const tableHeadings = ['Teacher ID', 'Name', "NIC", 'Email', 'Phone', 'Batch', 'Section', 'Course (Lab/Theory)'];
    const tableRows = [
        ['T001', 'Alice Johnson', '42101-1234567-8', 'alice.johnson@example.com', '0301-1234567', 'Batch 2021', 'A', 'Physics (Theory)'],
        ['T002', 'Bob Smith', '42102-2345678-9', 'bob.smith@example.com', '0302-2345678', 'Batch 2022', 'B', 'Mathematics (Lab)'],
        ['T003', 'Charlie Davis', '42103-3456789-0', 'charlie.davis@example.com', '0303-3456789', 'Batch 2023', 'C', 'Chemistry (Theory)'],
        ['T004', 'David Wilson', '42104-4567890-1', 'david.wilson@example.com', '0304-4567890', 'Batch 2021', 'A', 'Biology (Lab)'],
        ['T005', 'Eve Brown', '42105-5678901-2', 'eve.brown@example.com', '0305-5678901', 'Batch 2022', 'B', 'Computer Science (Theory)'],
    ];

    //API
    const handleMultiSelectChange = (name) => (event) => {
        const { value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: typeof value === 'string' ? value.split(',') : value, // Ensures the value is an array
        }));
    };
    
    const[formData, setFormData]= useState({
        teacherId: '',
        phone:'',
        name:'',
        maxClasses:'',
        email:'',
        NIC:'',
        courses:[],
        section:[],
        health:[],
        batch:[],
    })

    const handleInputChange= (event)=>{
        const{name, value, multiple}= event.target

        if(multiple){
            setFormData((prevData)=>({
                ...prevData,
                [name]: Array.from(event.target.selectedOptions, option=>option.value),
            }))
        }
        else{
            setFormData((prevData)=>({
                ...prevData,
                [name]:value,
            }))
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const dataToSubmit = {
            ...formData,
        };
    
        try {
            const response = await axios.post("https://e631e98f-7999-4dd6-89a1-676f3312fb48.mock.pstmn.io/api/teacher", dataToSubmit);
            if (response.status === 200) {
                console.log("Submission successful", response.data);
            } else {
                console.error("Submission failed", response.data);
            }
        } catch (error) {
            console.error("Error submitting data", error);
        }
    };
    
//API END    


    const tabLabels = ['View list of teachers', "Enter new teacher"];
    const tabContent = [
      <div>
        <BasicBreadcrumbs breadcrumbs={breadcrumbs1}/>
      <Tables tableHeadings={tableHeadings} tableRows={tableRows} /> 
      </div>,

      <div>
        <BasicBreadcrumbs breadcrumbs={breadcrumbs2}/>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // Two equal columns layout
              gap: 3, // Gap between grid items
              maxWidth: 1000,
              margin: "0 auto",
              padding: 4,
              borderRadius: 2,
              boxShadow: 4,
              backgroundColor: "#f5f5f5",
            }}
          >
            <TextField
              id="teacher-id"
              label="Teacher ID"
              variant="outlined"
              type="text"
              fullWidth
              required
              name="teacherId"
              value={formData.teacherId}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <TextField
              id="phone"
              label="Phone"
              variant="outlined"
              type="tel"
              fullWidth
              required
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <TextField
              id="name"
              label="Name"
              variant="outlined"
              type="text"
              fullWidth
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <TextField
              id="max-classes-per-day"
              label="Max Classes per day"
              variant="outlined"
              type="number"
              fullWidth
              required
              name="maxClasses"
              value={formData.maxClasses}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
              required
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <TextField
              id="NIC"
              label="NIC number"
              variant="outlined"
              type="text"
              fullWidth
              required
              name="NIC"
              value={formData.NIC}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px', // Set your custom border radius here
                },
              }}
            />
            <FormControl fullWidth required>
              <Dropdown
                heading="Courses (Select Multiple)"
                name="courses"
                menuItems={["2021", "2022", "2023", "2024"]}
                value={formData.courses} // Correctly bind value to formData
                onChange={handleMultiSelectChange("courses")}
                multiple
                
              />
            </FormControl>

            <FormControl fullWidth required>
              <Dropdown
                heading="Section (Select Multiple)"
                name="section"
                menuItems={["A", "B", "C", "D"]}
                value={formData.section}
                onChange={handleMultiSelectChange("section")}
                multiple
              />
            </FormControl>

            <FormControl fullWidth required>
              <Dropdown
                heading="Health Limitation (Select Multiple)"
                name="health"
                menuItems={["None", "Vision", "Hearing", "Mobility"]}
                value={formData.health}
                onChange={handleMultiSelectChange("health")}
                multiple
              />
            </FormControl>

            <FormControl fullWidth required>
              <Dropdown
                heading="Batch (Select Multiple)"
                name="batch"
                menuItems={[
                  "Batch 2021",
                  "Batch 2022",
                  "Batch 2023",
                  "Batch 2024",
                ]}
                value={formData.batch}
                onChange={handleMultiSelectChange("batch")}
                multiple
              />
            </FormControl>

            <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  borderRadius: '10px', // Adjust this value to your desired border radius
                }}
              
                
                required
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </div>,
    ];

    return (
        <div>
            <TeacherTabs tabLabels={tabLabels} tabContent={tabContent} />
        </div>
    );
}

export default Teacher;
