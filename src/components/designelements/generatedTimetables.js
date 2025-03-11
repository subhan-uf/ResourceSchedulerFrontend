// GeneratedTimetables.jsx
import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import generationService from "../api/generationService";

const GeneratedTimetables = ({ onEditGeneration }) => {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const fetchGenerations = async () => {
      setLoading(true);
      try {
        const res = await generationService.getGenerations();
        setGenerations(res.data);
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
                <TableCell>Time Generated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {generations.map((gen) => (
                <TableRow key={gen.Generation_ID}>
                  <TableCell>{gen.Generation_ID}</TableCell>
                  <TableCell>{gen.Description || "N/A"}</TableCell>
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
                      color="danger"
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