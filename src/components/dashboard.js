import React from "react";
import Cards from "./designelements/dashboardmenu";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function Dashboard() {
  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        {/* <Typography variant="h3" align="center" fontWeight={700} gutterBottom>
          Dashboard
        </Typography> */}
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Quickly navigate to all scheduling modules
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {/* Cards Grid */}
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={5} justifyContent="center">
            {[
              { heading: "Teacher Management", subtext: "Add, delete, edit and view teachers", imageSrc: "teacher.png", linkTo: "/teacher" },
              { heading: "Room Management", subtext: "Add, delete, edit and view rooms", imageSrc: "room.png", linkTo: "/room" },
              { heading: "Course Management", subtext: "Add, delete, edit and view courses", imageSrc: "course.png", linkTo: "/course" },
              { heading: "Batch Management", subtext: "Manage batches", imageSrc: "batch.png", linkTo: "/batch" },
              { heading: "Preferences & Constraints", subtext: "Set room & timing preferences", imageSrc: "preference.png", linkTo: "/preference" },
              { heading: "Compensatory Classes", subtext: "Book & manage compensatory classes", imageSrc: "compensatory.png", linkTo: "/compensatory" },
              { heading: "User Management", subtext: "Add or edit users", imageSrc: "user.png", linkTo: "/user" },
              { heading: "Reports", subtext: "View generated timetables", imageSrc: "report.png", linkTo: "/report" },
              { heading: "Timetable Generation", subtext: "Generate section‑ or batch‑wise timetables", imageSrc: "timetable.png", linkTo: "/generation" },
              { heading: "Availability", subtext: "Check teacher & room availability", imageSrc: "availability.png", linkTo: "/availability" },
            ].map((card) => (
              <Grid key={card.heading} item xs={12} sm={6} md={4}>
                <Cards {...card} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
