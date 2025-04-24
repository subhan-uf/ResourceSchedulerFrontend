// src/components/dashboard.js
import React from "react";
import Cards from "./designelements/dashboardmenu";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role; // "Advisor" or "DEO"

  // All possible cards with the roles that may see them
  const allCards = [
    {
      key: "teacher",
      roles: ["Advisor", "DEO"],
      heading: "Teacher Management",
      subtext: "Add, delete, edit and view teachers",
      imageSrc: "teacher.png",
      linkTo: "/teacher",
    },
    {
      key: "room",
      roles: ["Advisor", "DEO"],
      heading: "Room Management",
      subtext: "Add, delete, edit and view rooms",
      imageSrc: "room.png",
      linkTo: "/room",
    },
    {
      key: "course",
      roles: ["Advisor", "DEO"],
      heading: "Course Management",
      subtext: "Add, delete, edit and view courses",
      imageSrc: "course2.png",
      linkTo: "/course",
    },
    {
      key: "batch",
      roles: ["Advisor", "DEO"],
      heading: "Batch Management",
      subtext: "Manage batches",
      imageSrc: "batch.png",
      linkTo: "/batch",
    },
    {
      key: "preference",
      roles: ["Advisor"],
      heading: "Preferences & Constraints",
      subtext: "Set room & timing preferences",
      imageSrc: "preference.png",
      linkTo: "/preference",
    },
    {
      key: "compensatory",
      roles: ["Advisor"],
      heading: "Compensatory Classes",
      subtext: "Book & manage compensatory classes",
      imageSrc: "compensatory.png",
      linkTo: "/compensatory",
    },
    {
      key: "generation",
      roles: ["Advisor"],
      heading: "Timetable Generation",
      subtext: "Generate batch-wise timetables",
      imageSrc: "timetable.png",
      linkTo: "/generation",
    },
    {
      key: "report",
      roles: ["Advisor"],
      heading: "Reports",
      subtext: "View PDF copies of generated timetables",
      imageSrc: "report.png",
      linkTo: "/report",
    },
    {
      key: "availability",
      roles: ["Advisor"],
      heading: "Availability",
      subtext: "Check teacher & room availability",
      imageSrc: "availability.png",
      linkTo: "/availability",
    },
    {
      key: "user",
      roles: ["DEO"],
      heading: "User Management",
      subtext: "Add or edit users",
      imageSrc: "user.png",
      linkTo: "/user",
    },
    {
      key: "disciplines",
      roles: ["DEO"],
      heading: "Discipline Management",
      subtext: "Manage disciplines",
      imageSrc: "discipline.png",
      linkTo: "/disciplines",
    },
  ];

  // For Advisor, override the four “Management” cards to “View …” + adjusted subtext
  const advisorOverrides = {
    teacher: { heading: "View Teacher", subtext: "Get a list of all the teachers" },
    room: { heading: "View Room", subtext: "Get a list of all the rooms" },
    course: { heading: "View Course", subtext: "Get a list of all the courses" },
    batch: { heading: "View Batch", subtext: "Get a list of all the batches" },
  };

  // Filter by role
  const visibleCards = allCards.filter((c) => c.roles.includes(role));

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          {user && user.username
            ? `Welcome back ${
                user.username.charAt(0).toUpperCase() +
                user.username.slice(1)
              }`
            : "Welcome back"}
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Quickly navigate to all scheduling modules
        </Typography>
        <Divider sx={{ mb: 1 }} />

        <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={5} justifyContent="center">
            {visibleCards.map((card) => {
              let heading = card.heading;
              let subtext = card.subtext;

              if (role === "Advisor" && advisorOverrides[card.key]) {
                heading = advisorOverrides[card.key].heading;
                subtext = advisorOverrides[card.key].subtext;
              }

              return (
                <Grid key={card.key} item xs={12} sm={6} md={4}>
                  <Cards
                    heading={heading}
                    subtext={subtext}
                    imageSrc={card.imageSrc}
                    linkTo={card.linkTo}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
