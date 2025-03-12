import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import generationService from "../api/generationService";
import apiClient from "../api/apiClient";

const GeneratedTimetables = ({ onEditGeneration }) => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [headerStatuses, setHeaderStatuses] = useState({});
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
                    onClick={() => handleDeleteGeneration(gen.Generation_ID)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default GeneratedTimetables;