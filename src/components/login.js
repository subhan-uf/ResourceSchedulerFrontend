import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import BasicTabs from "./designelements/tabs";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SignInbox from "./designelements/signing";


function Login() {
  const tabNames = ["DEO", "Advisor"];
  const [selectedTab, setSelectedTab]=useState("DEO");
  
  const signIn= async(username, password) =>{
    try{
      const response= await axios.post(
        "https://32e9acb7-9bc4-4143-abda-861f06d69b58.mock.pstmn.io/deo/login/",
        {
          username: username,
          password: password,
        },
        {
          header:{
            "Content-Type": "application/json",

          },
        }
      )

      if (response.status===200){
        console.log("Login Successful", response.data)
      }
      else{
        console.error("Login failed", response.data)
      }
    }
      catch(error){
        console.error("Error during login", error)
      }
    }

  
  
  return (
    <Box
      component="section"
      sx={{
        width: 400, // Set a fixed width for the box
        p: 3, // Adjust padding as needed
        border: "1px dashed grey",
        borderRadius: 2, // Add some border-radius for rounded corners
        boxShadow: 3, // Optional: Add a shadow for some elevation
        backgroundColor: "white", // Set background color
        mx: "auto", // Center horizontally
        mt: "7vh", // Center vertically with margin-top (adjust as needed)
      }}
    >
      <BasicTabs tabNames={tabNames} onChange={(event, newValue) => setSelectedTab(tabNames[newValue])}>
  <SignInbox signIn={(username, password) => signIn(username, password)} role="DEO" />
  <SignInbox signIn={(username, password) => signIn(username, password)} role="Advisor" />
</BasicTabs>

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