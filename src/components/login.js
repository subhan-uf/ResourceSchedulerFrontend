import React, { useState } from "react";
import AuthService from "./api/authService";
import Box from "@mui/material/Box";
import BasicTabs from "./designelements/tabs";
import SignInbox from "./designelements/signing";
import { useNavigate } from "react-router-dom";

function Login() {
  const tabNames = ["DEO", "Advisor"];
  const [selectedTab, setSelectedTab] = useState(0);  // Track selected tab (0 or 1)
  const navigate = useNavigate();

  const signIn = async (username, password) => {
    try {
      const role = tabNames[selectedTab];  // Get role from tabNames dynamically
      const credentials = { username, password };
      const response = await AuthService.login(credentials, role.toLowerCase());
      
      if (response.status === 200) {
        console.log("Login Successful", response.data);
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        window.dispatchEvent(new Event('storage'));

        console.log("Access Token Saved:", response.data.access);
  
        if (role === "Advisor") {
          navigate("/dashboard");
        }
        else{
          navigate("/dashboard")
        }
      } else {
        console.error("Login failed", response.data);
      }
    } catch (error) {
      console.error("Error during login", error);
      alert("Invalid Credentials")
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);  // Update active tab
  };

  return (
    <Box
      component="section"
      sx={{
        width: 400,
        p: 3,
        border: "1px dashed grey",
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "white",
        mx: "auto",
        mt: "7vh",
      }}
    >
      {/* Tabs for switching roles */}
      <BasicTabs tabNames={tabNames} onChange={handleTabChange} />

      {/* Render SignInbox dynamically based on active tab */}
      <SignInbox signIn={signIn} role={tabNames[selectedTab]} />
    </Box>
  );
}

export default Login;



//This was the code in the tabs before for sigin fields 


  {/* <Typography variant="h5" component="h3" align="center" gutterBottom style={{ color: '#3f51b5' }}>
        Login
      </Typography>
            <form>
            <TextField id="outlined-basic" label="Username" variant="outlined" fullWidth style={{marginTop:'40px'}}/><br/>
            <TextField id="Password" label="Password" type="password" style={{marginTop:'40px'}} variant="outlined" fullWidth/><br/>
            <Button variant="contained" type="submit" style={{marginTop:'40px'}}>Submit</Button>
            </form>
        </div>
        <div>
        <Typography variant="h5" component="h3" align="center" gutterBottom style={{ color: '#3f51b5' }}>
        Login
      </Typography>
        <form>
           
            <TextField id="outlined-basic" label="Username" variant="outlined" fullWidth style={{marginTop:'40px'}}/><br/>
            <TextField id="Password" label="Password" type="password" style={{marginTop:'40px'}} variant="outlined" fullWidth/><br/>
            <Button variant="contained" type="submit" style={{marginTop:'40px'}}>Submit</Button>
            </form> */}