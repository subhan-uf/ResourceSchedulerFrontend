import React, { useState } from "react";
import AuthService from "./api/authService";
import Box from "@mui/material/Box";
import BasicTabs from "./designelements/tabs";
import SignInbox from "./designelements/signing";
import { useNavigate } from "react-router-dom";
import CustomSnackbar from "./designelements/alert";
import { Fade } from "@mui/material";

function Login() {
  const tabNames = ["DEO", "Advisor"];
  const [selectedTab, setSelectedTab] = useState(0); // Track selected tab (0 or 1)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "neutral",
  });

  const navigate = useNavigate();

  const signIn = async (username, password) => {
    try {
      const role = tabNames[selectedTab]; // Get role from tabNames dynamically
      const credentials = { username, password };
      const response = await AuthService.login(credentials, role.toLowerCase());

      if (response.status === 200) {
        console.log("Login Successful", response.data);
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        window.dispatchEvent(new Event("storage"));

        console.log("Access Token Saved:", response.data.access);

        // Show success snackbar
        setSnackbar({
          open: true,
          message: "Login successful!",
          color: "success",
        });

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        // Show error snackbar
        setSnackbar({
          open: true,
          message: "Login failed. Please try again.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error during login", error);

      // Show error snackbar
      setSnackbar({
        open: true,
        message: "Invalid Credentials",
        color: "danger",
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue); // Update active tab
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Fade in timeout={600}>
      <Box
        component="section"
        sx={{
          width: 400,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.08)",
          mx: "auto",
          mt: "7vh",
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #2196F3 0%, #4CAF50 100%)",
          },
        }}
      >
        {/* Tabs for switching roles */}
        <BasicTabs tabNames={tabNames} onChange={handleTabChange} />

        {/* Render SignInbox dynamically based on active tab */}
        <SignInbox signIn={signIn} role={tabNames[selectedTab]} />

        {/* Snackbar */}
        <CustomSnackbar
          open={snackbar.open}
          onClose={closeSnackbar}
          message={snackbar.message}
          color={snackbar.color}
        />
      </Box>
    </Fade>
  );
}

export default Login;
