import React from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";

function Teacher() {
  

    const tabLabels = ['Create an advisor'];
    const tabContent = [
       
        <div>
            <form>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr', // Two equal columns layout
                        gap: 3, // Gap between grid items
                        maxWidth: 1000,
                        margin: '0 auto',
                        padding: 4,
                        borderRadius: 2,
                        boxShadow: 4,
                        backgroundColor: '#f5f5f5',
                    }}
                >
                    <TextField
                        id="teacher-id"
                        label="Teacher ID"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="fname"
                        label="First name"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="lname"
                        label="Last name"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="username"
                        label="Username"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        required
                    />
                    <TextField
                        id="NIC"
                        label="NIC number"
                        variant="outlined"
                        type="text"
                        fullWidth
                        required
                    />
                    <TextField
                        id="email"
                        label="email"
                        variant="outlined"
                        type="email"
                        fullWidth
                        required
                    />
                     <TextField
                        id="number"
                        label="Phone"
                        variant="outlined"
                        type="tel"
                        fullWidth
                        required
                    />
                    <FormControl fullWidth required>
                    <Singledropdown label="Year" menuItems = {[
                                { label: 'First' },
                                { label: 'Second' },
                                { label: 'Third' },
                                { label: 'Fourth' },
                            ]}
                            full
                            required
                            />
                    </FormControl>

                    <FormControl fullWidth required>
                    <Singledropdown label="Faculty" menuItems = {[
                                { label: 'BCIT' },
                                
                            ]}
                            full
                            required
                            />
                    </FormControl>

                    <FormControl fullWidth required>
                    <Singledropdown label="Seniority" menuItems = {[
                                { label: 'Lecturer' },
                                { label: 'IT manager (Sr.)' },
                                { label: 'IT manager (Jr.)' },
                                { label: 'Associate Professor' },
                                { label: 'Assistant Professor' },
                                { label: 'Professor' },
                                
                            ]}
                            full
                            required
                            />
                    </FormControl>
                    
                    <Box sx={{ gridColumn: 'span 2', textAlign: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            required
                        >
                            Create an Advisor
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

export default Teacher;
