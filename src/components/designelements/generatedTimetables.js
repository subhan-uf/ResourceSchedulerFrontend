import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip, Snackbar, Typography } from "@mui/material";
import generationService from "../api/generationService";
import apiClient from "../api/apiClient";
import AlertDialogModal from "./modal";
import CustomSnackbar from "./alert";

const GeneratedTimetables = ({ onEditGeneration }) => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [headerStatuses, setHeaderStatuses] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [selectedGenId, setSelectedGenId] = useState(null);
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');  

const fetchGenerations = async () => {
    setLoading(true);
    try {
      const res = await generationService.getGenerations();
      setGenerations(res.data);
      
      // Fetch all timetable headers to get statuses
      const headersRes = await apiClient.get('/timetable-header/');
      const headers = headersRes.data;
      
      // Create a map of generation IDs to statuses
      const statusMap = {};
      headers.forEach(header => {
        const genId = header.Generation;
        // If we already have a status for this generation and it's "published", keep it
        // Otherwise, use the current header's status
        if (!statusMap[genId] || statusMap[genId] !== "published") {
          statusMap[genId] = header.Status;
        }
      });
      
      setHeaderStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching generations:", error);
    } finally {
      setLoading(false);
    }
  };

  
  
  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleDeleteGeneration = async (genId) => {
    if (!window.confirm("Are you sure you want to delete this generation? This will remove all related timetable headers (and timetable details will be deleted automatically).")) {
      return;
    }
    try {
      await generationService.deleteGeneration(genId);
      // Refresh the generation list after deletion
      fetchGenerations();
    } catch (error) {
      console.error("Error deleting generation:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "In Progress":
        return "warning";
      case "Failed":
        return "error";
      case "draft":
        return "info";
      default:
        return "default";
    }
  };
  const getDisplayStatus = (status) => {
    // Capitalize the first letter of the status
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  };
  return (
    <Box sx={{ p: 2 }}>
      <CustomSnackbar
  open={snackbarOpen}
  onClose={() => setSnackbarOpen(false)}
  message={snackbarMessage}
  color="success"
/>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
<TableHead>
  <TableRow>
    <TableCell>Generation ID</TableCell>
    <TableCell>Description</TableCell>
    <TableCell>Status</TableCell>
    <TableCell>Time Generated</TableCell>
    <TableCell>Last Edited By</TableCell>
    <TableCell>Actions</TableCell>
  </TableRow>
</TableHead>
          <TableBody>
          {generations.map((gen) => (
  <TableRow key={gen.Generation_ID}>
    <TableCell>{gen.Generation_ID}</TableCell>
    <TableCell>{gen.Description || "N/A"}</TableCell>
    <TableCell>
      <Chip 
        label={getDisplayStatus(headerStatuses[gen.Generation_ID])} 
        color={getStatusColor(headerStatuses[gen.Generation_ID])} 
        size="small" 
      />
    </TableCell>
    <TableCell>{new Date(gen.Time_Generated).toLocaleString()}</TableCell>
    <TableCell>
  {gen.last_edited_by || "N/A"}
</TableCell>



    <TableCell>
      <Button
        variant="outlined"
        onClick={() => onEditGeneration(gen)}
        sx={{ mr: 1 }}
      >
        View/Edit
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => {
          setSelectedGenId(gen.Generation_ID);
          setDeleteModalOpen(true);
        }}
      >
        Delete
      </Button>
    </TableCell>
  </TableRow>
))}

          </TableBody>
        </Table>
      )}
      <AlertDialogModal
  open={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  onConfirm={async () => {
    try {
      await generationService.deleteGeneration(selectedGenId);
      fetchGenerations();
      setSnackbarMessage('Generation deleted successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting generation:", error);
    }
    setDeleteModalOpen(false);
  }}
  message={
    <Box>
      <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
        WARNING!
      </Typography>
      <Typography variant="body1" fontWeight="bold" gutterBottom>
        Are you sure you want to delete this Timetable Generation? All of the following related records will be <span style={{ textDecoration: 'underline' }}>PERMANENTLY deleted</span>:
      </Typography>
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {[
          
          "-Complete Timetable data ",
          "-Reports of this Timetable",
          "-Compensatory Classes booked on this Timetable",
         
         
        ].map(item => (
          <Typography component="li" key={item} >
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  }
/>
    </Box>
  );
};

export default GeneratedTimetables;