import React, { useState, useEffect } from "react";
import TeacherTabs from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from '@mui/material/TextField';
import Dropdown from "./designelements/multipledropdown";
import Singledropdown from "./designelements/singledropdown";
import { Box, Button, FormControl } from "@mui/material";
import { getAdvisors, createAdvisor, updateAdvisor, deleteAdvisor } from "./api/advisorService";
import CustomSnackbar from "./designelements/alert";
import AlertDialogModal from "./designelements/modal";

function Teacher() {
  // State for advisors list and form fields
  const [advisors, setAdvisors] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    phone_number: "",
    staff_id: "",
    year: "",
    faculty: "",
    seniority: "",
  });
  const [editingAdvisorId, setEditingAdvisorId] = useState(null);
  // New state for controlling the active tab (0: View Advisors, 1: Form)
  const [activeTab, setActiveTab] = useState(0);

  // New state for snackbar messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "neutral" // or 'success', 'danger', 'info'
  });

  // New state for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState(null);
  // Fetch advisors when the component mounts
  const showSnackbar = (message, color = "neutral") => {
    setSnackbar({ open: true, message, color });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  useEffect(() => {
    fetchAdvisors();
    console.log(advisors)
  }, []);

  const fetchAdvisors = () => {
    getAdvisors()
      .then(response => {
        // Assume response.data is an array of advisor objects
        setAdvisors(response.data);
      })
      .catch(error => console.error("Error fetching advisors:", error));
  };
  const currentUser = JSON.parse(localStorage.getItem("user"));
console.log(currentUser)
  // Handle input change for the form
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle form submit for create/update
  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
  
    // For creation, check duplicates among existing advisors.
    if (!editingAdvisorId) {
      let duplicateErrors = [];
      if (advisors.some(a => a.username === formData.username)) {
        duplicateErrors.push("Username already exists.");
      }
      if (advisors.some(a => a.email === formData.email)) {
        duplicateErrors.push("Email already exists.");
      }
      if (advisors.some(a => a.phone_number === formData.phone_number)) {
        duplicateErrors.push("Phone number already exists.");
      }
      if (advisors.some(a => a.staff_id === formData.staff_id)) {
        duplicateErrors.push("Staff ID already exists.");
      }
      if (duplicateErrors.length > 0) {
        showSnackbar(duplicateErrors.join(" "), "danger");
        return; // Stop processing since there are duplicates
      }
    } else {
      // For update, check duplicates excluding the current advisor
      let duplicateErrors = [];
      if (advisors.some(a => a.username === formData.username && a.id !== editingAdvisorId)) {
        duplicateErrors.push("Username already exists.");
      }
      if (advisors.some(a => a.email === formData.email && a.id !== editingAdvisorId)) {
        duplicateErrors.push("Email already exists.");
      }
      if (advisors.some(a => a.phone_number === formData.phone_number && a.id !== editingAdvisorId)) {
        duplicateErrors.push("Phone number already exists.");
      }
      if (advisors.some(a => a.staff_id === formData.staff_id && a.id !== editingAdvisorId)) {
        duplicateErrors.push("Staff ID already exists.");
      }
      if (duplicateErrors.length > 0) {
        showSnackbar(duplicateErrors.join(" "), "danger");
        return; // Stop processing if duplicates are found
      }
    }
  
    // Now proceed with API call.
    if (editingAdvisorId) {
      // Update advisor
      updateAdvisor(editingAdvisorId, formData)
        .then(response => {
          fetchAdvisors();
          showSnackbar("Advisor updated successfully!", "success");
          // Reset editing and switch to view tab
          setEditingAdvisorId(null);
          setFormData({
            username: "", email: "", first_name: "", last_name: "",
            password: "", phone_number: "", staff_id: "", year: "",
            faculty: "", seniority: ""
          });
          setActiveTab(0);
        })
        .catch(error => {
          const errMsg = error.response?.data?.error || "Error updating advisor";
          showSnackbar(errMsg, "danger");
        });
    } else {
      // Create new advisor
      createAdvisor(formData)
        .then(response => {
          fetchAdvisors();
          showSnackbar("Advisor created successfully!", "success");
          setFormData({
            username: "", email: "", first_name: "", last_name: "",
            password: "", phone_number: "", staff_id: "", year: "",
            faculty: "", seniority: ""
          });
          setActiveTab(0);
        })
        .catch(error => {
          const errMsg = error.response?.data?.error || "Error creating advisor";
          showSnackbar(errMsg, "danger");
        });
    }
  };
  


  // Handle edit action from the table
  const handleEdit = (row) => {
    const advisorId = row[row.length - 1];
    const [username, email, first_name, last_name, phone_number, staff_id, year, faculty, seniority] = row;
    setFormData({
      username, email, first_name, last_name,
      password: "", // leave password blank on edit; update only if provided
      phone_number, staff_id, year, faculty, seniority
    });
    setEditingAdvisorId(advisorId);
    // Switch to form tab and change its label by updating activeTab (we’ll handle label change below)
    setActiveTab(1);
  };

  // Handle delete action from the table
  const handleDelete = (row) => {
    const advisorId = row[row.length - 1];
    // Instead of prompt(), open the delete modal
    setAdvisorToDelete(advisorId);
    setDeleteModalOpen(true);
  };

  // Function to handle confirmed deletion
  const confirmDelete = () => {
    deleteAdvisor(advisorToDelete)
      .then(() => {
        fetchAdvisors();
        showSnackbar("Advisor deleted successfully!", "success");
        setDeleteModalOpen(false);
        setAdvisorToDelete(null);
      })
      .catch(error => {
        const errMsg = error.response?.data?.error || "Error deleting advisor";
        showSnackbar(errMsg, "danger");
        setDeleteModalOpen(false);
      });
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setAdvisorToDelete(null);
  };


  // Define the two tabs:
  const tabLabels = [
    'View Advisors',
    editingAdvisorId ? 'Editing Advisor' : 'Create Advisor'
  ];
console.log(advisors)
  // Tab 1: Table view
  const viewTab = (
    <Tables
      tableHeadings={['Username', 'Email', 'First Name', 'Last Name', 'Phone', 'Staff ID', 'Year', 'Faculty', 'Seniority', 'Actions']}
      tableRows={advisors.map(advisor => ([
        advisor.username,
        advisor.email,
        advisor.first_name,
        advisor.last_name,
        advisor.phone_number,
        advisor.staff_id,
        advisor.year,
        advisor.faculty,
        advisor.seniority,
        
      ]))}
      onEdit={(row) => handleEdit(row)}
      onDelete={(row) => handleDelete(row)}
    />
  );

  // Tab 2: Form view
  const createTab = (
    <div>
      <form onSubmit={handleCreateOrUpdate}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 3,
            maxWidth: 1000,
            margin: '0 auto',
            padding: 4,
            borderRadius: 2,
            // boxShadow: 4,
            backgroundColor: 'transparent',
          }}
        >
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            type="text"
            fullWidth
            required
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            id="first_name"
            label="First Name"
            variant="outlined"
            type="text"
            fullWidth
            required
            value={formData.first_name}
            onChange={handleInputChange}
          />
          <TextField
            id="last_name"
            label="Last Name"
            variant="outlined"
            type="text"
            fullWidth
            required
            value={formData.last_name}
            onChange={handleInputChange}
          />
          {/* Only require password on creation; on update leave it optional */}
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            id="phone_number"
            label="Phone"
            variant="outlined"
            type="tel"
            fullWidth
            required
            value={formData.phone_number}
            onChange={handleInputChange}
          />
          <TextField
            id="staff_id"
            label="Staff ID"
            variant="outlined"
            type="text"
            fullWidth
            required
            value={formData.staff_id}
            onChange={handleInputChange}
          />
          <FormControl fullWidth required>
          <Singledropdown
  label="Year"
  menuItems={[
    { label: 'First', value: 'first' },
    { label: 'Second', value: 'second' },
    { label: 'Third', value: 'third' },
    { label: 'Fourth', value: 'fourth' },
  ]}
  full
  required
  value={formData.year}
  onChange={(selectedValue) => setFormData(prev => ({ ...prev, year: selectedValue }))}
/>

          </FormControl>
          <FormControl fullWidth required>
          <Singledropdown
  label="Faculty"
  menuItems={[
    { label: 'BCIT', value: 'BCIT' },
  ]}
  full
  required
  value={formData.faculty}
  onChange={(selectedValue) => setFormData(prev => ({ ...prev, faculty: selectedValue }))}
/>

          </FormControl>
          <FormControl fullWidth required>
          <Singledropdown
  label="Seniority"
  menuItems={[
    { label: 'Lecturer', value: 'lecturer' },
    { label: 'IT Manager (Sr.)', value: 'it_manager_sr' },
    { label: 'IT Manager (Jr.)', value: 'it_manager_jr' },
    { label: 'Associate Professor', value: 'associate_professor' },
    { label: 'Assistant Professor', value: 'assistant_professor' },
    { label: 'Professor', value: 'professor' },
  ]}
  full
  required
  value={formData.seniority}
  onChange={(selectedValue) => setFormData(prev => ({ ...prev, seniority: selectedValue }))}
/>

          </FormControl>
          <Box sx={{ gridColumn: 'span 2', textAlign: 'center', mt: 2 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {editingAdvisorId ? "Update Advisor" : "Create Advisor"}
            </Button>
            {editingAdvisorId && (
              <Button variant="outlined" color="secondary" onClick={() => {
                // Cancel editing
                setEditingAdvisorId(null);
                setFormData({
                  username: "", email: "", first_name: "", last_name: "",
                  password: "", phone_number: "", staff_id: "", year: "",
                  faculty: "", seniority: ""
                });
              }} sx={{ mt: 1 }}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </div>
  );

  const tabContent = [viewTab, createTab];

  return (
<div>
      <TeacherTabs 
         tabLabels={tabLabels} 
         tabContent={[viewTab, createTab]} 
         externalIndex={activeTab}
         onIndexChange={(index) => setActiveTab(index)}
      />
      {/* Snackbar for messages */}
      <CustomSnackbar 
         open={snackbar.open} 
         onClose={handleCloseSnackbar} 
         message={snackbar.message} 
         color={snackbar.color} 
      />
      {/* Alert Dialog for delete confirmation */}
      <AlertDialogModal 
         open={deleteModalOpen}
         onClose={cancelDelete}
         onConfirm={confirmDelete}
         message={
           <div>
             <strong>Warning:</strong> Deleting this advisor will remove the associated user account. This action cannot be undone.
           </div>
         }
      />
    </div>
  );
}

export default Teacher;
