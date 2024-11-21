import React from "react";
import Cards from "./designelements/dashboardmenu";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from '@mui/joy/Typography';

function Dashboard() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div>
        <Typography level="h1" align="center" gutterBottom>Dashboard</Typography>
        <Box
          sx={{
            flexGrow: 1,
            padding: 2,
            border: '1px solid #ccc', // Light gray border color
            borderRadius: '8px', // Rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for a lifted effect
            backgroundColor: '#f9f9f9',
            maxWidth: 1200, // Constrain width for better centering
            margin: 'auto', // Center the box horizontally
          }}
        >
          <Grid
            container
            spacing={3}
            justifyContent="center"
          >
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Teacher Management"
                subtext="Add, delete, edit and view teachers"
                imageSrc="teacher.png"
                linkTo="/teacher"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Room Management"
                subtext="Add, delete, edit and view Rooms"
                imageSrc="room.png"
                linkTo="/room"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Course Management"
                subtext="Add, delete, edit and view Courses"
                imageSrc="course.png"
                linkTo="/course"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Batch Management"
                subtext="Add, delete, edit and view Batches"
                imageSrc="batch.png"
                linkTo="/batch"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Preference/Constraint"
                subtext="Add, delete, edit and view room and timing preferences"
                imageSrc="preference.png"
                linkTo="/preference"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Compensatory"
                subtext="Book, delete, edit and view Compensatory classes"
                imageSrc="compensatory.png"
                linkTo="/compensatory"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="User Management"
                subtext="Edit user details and add users"
                imageSrc="user.png"
                linkTo="/user"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Reports"
                subtext="View generated or drafted timetables"
                imageSrc="report.png"
                linkTo="/report"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Timetable Generation"
                subtext="Generate timetables sectionwise or batchwise"
                imageSrc="timetable.png"
                linkTo="/generation"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Cards
                heading="Teacher & Room Availability"
                subtext="Check teacher and room availability"
                imageSrc="availability.png"
                linkTo="/availability"
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
}

export default Dashboard;
