import React, { useEffect, useState } from "react";
import TabsTeachers from "./designelements/tabforall";
import Tables from "./designelements/tables";
import TextField from "@mui/material/TextField";
import { Box, Button, FormControl } from "@mui/material";
import Singledropdown from "./designelements/singledropdown";
import Checkboxx from "./designelements/checkbox";
import AlertDialogModal from "./designelements/modal";
import CustomSnackbar from "./designelements/alert";
import RoomService from "./api/roomService";

// A custom breadcrumb component (if needed)
import BasicBreadcrumbs from "./designelements/breadcrumbs";

function Room() {
  // -----------------------------
  // SNACKBAR (for success/error messages)
  // -----------------------------
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("neutral"); // success, danger, etc.

  // -----------------------------
  // ROOM FORM DATA
  // -----------------------------
  const [roomData, setRoomData] = useState({
    Room_no: "",
    Max_capacity: "",
    Floor: "",
    Room_type: "",       // e.g. "Lecture Hall"
    Multimedia: false,
    Speaker: false,
    Room_status: "enable", // can be "enable" or "disable"
  });

  // For editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // -----------------------------
  // TABLE DATA
  // -----------------------------
  const [rooms, setRooms] = useState([]);

  // For tabs
  const [currentTab, setCurrentTab] = useState(0);

  // For delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomIdToDelete, setRoomIdToDelete] = useState(null);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role; // "Advisor" or "DEO"
  const hideForAdvisor = role === 'Advisor';
  // BREADCRUMBS data
  const breadcrumbsListRooms = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "View list of rooms", url: "" },
  ];
  const breadcrumbsNewRoom = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Add new room", url: "" },
  ];

  // -----------------------------
  // LOAD DATA ON MOUNT
  // -----------------------------
  useEffect(() => {
    fetchAllRooms();
  }, []);

  const fetchAllRooms = async () => {
    try {
      const response = await RoomService.getAllRooms();
      // e.g. [ {Room_ID:301, Room_no:'Lab-1', Max_capacity:50, ...}, ... ]
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showSnackbar("Failed to fetch rooms.", "danger");
    }
  };

  // -----------------------------
  // TABLE HEADINGS & ROWS
  // -----------------------------
  const tableHeadings = [
    "Room number",
    "Max capacity",
    "Floor",
    "Room type",
    "Multimedia",
    "Speaker",
    "Room status",
    
  ];

  // Build rows from rooms state
  const filteredRooms = rooms.filter(room =>
    Object.values(room)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  
  const tableRows = filteredRooms.map(room => [
    room.Room_no,
    room.Max_capacity,
    room.Floor,
    room.Room_type,
    room.Multimedia ? "Available" : "Not Available",
    room.Speaker ? "Available" : "Not Available",
    room.Room_status,
    room.Room_ID,
  ]);
  const handleStopEditing = () => {
    resetForm(); // Reuse your existing reset function
  };
  // -----------------------------
  // EDIT
  // -----------------------------
  const handleEdit = async (rowData) => {
    const roomId = rowData[rowData.length - 1];
    if (!roomId) {
      showSnackbar("No valid Room ID for editing.", "danger");
      return;
    }
    try {
      const resp = await RoomService.getRoomById(roomId);
      const foundRoom = resp.data; 
      // e.g. {Room_ID:301, Room_no:"Lab-1", Max_capacity:50, Floor:2, ...}

      setRoomData({
        Room_no: foundRoom.Room_no ?? "",
        Max_capacity: foundRoom.Max_capacity?.toString() ?? "",
        Floor: foundRoom.Floor?.toString() ?? "",
        Room_type: foundRoom.Room_type ?? "",
        Multimedia: foundRoom.Multimedia ?? false,
        Speaker: foundRoom.Speaker ?? false,
        Room_status: foundRoom.Room_status ?? "enable",
      });
      setIsEditing(true);
      setEditingRoomId(roomId);
      setCurrentTab(1); // Switch to "Enter new room" tab
    } catch (error) {
      console.error("Error fetching room for edit:", error);
      showSnackbar("Failed to fetch room data.", "danger");
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------
  const handleDeleteClick = (rowData) => {
    const roomId = rowData[rowData.length - 1];
    setRoomIdToDelete(roomId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomIdToDelete) return;
    try {
      await RoomService.deleteRoom(roomIdToDelete);
      showSnackbar("Room deleted successfully!", "success");
      fetchAllRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      showSnackbar("Failed to delete the room.", "danger");
    } finally {
      setDeleteModalOpen(false);
      setRoomIdToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRoomIdToDelete(null);
  };

  // -----------------------------
  // CREATE OR UPDATE
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      // The backend wants these fields exactly
      // "Room_no", "Max_capacity", "Floor", "Room_type", "Multimedia", "Speaker", "Room_status"
      Room_no: roomData.Room_no,
      Max_capacity: parseInt(roomData.Max_capacity, 10) || 0,
      Floor: parseInt(roomData.Floor, 10) || 0,
      Room_type: roomData.Room_type,
      Multimedia: !!roomData.Multimedia, // ensure boolean
      Speaker: !!roomData.Speaker,       // ensure boolean
      Room_status: roomData.Room_status, // "enable" or "disable"
    };

     const duplicate = rooms.find(r =>
         String(r.Room_no)   === String(payload.Room_no)   &&  // same number
         r.Room_type         === payload.Room_type         &&  // same type
         (!isEditing || r.Room_ID !== editingRoomId)           // ignore self when editing
       );
       if (duplicate) {
         showSnackbar(
           `${payload.Room_type} room ${payload.Room_no} already exists.`,
           "danger"
         );
         return;  // stop here—don’t call create/update
       }

    try {
      if (isEditing && editingRoomId) {
        // Update
        await RoomService.updateRoom(editingRoomId, payload);
        showSnackbar("Room updated successfully!", "success");
      } else {
        // Create
        await RoomService.createRoom(payload);
        showSnackbar("Room created successfully!", "success");
      }
      // Refresh
      fetchAllRooms();
      resetForm();
    } catch (error) {
      console.error("Error creating/updating room:", error);
      showSnackbar("Failed to save room data.", "danger");
    }
  };

  const resetForm = () => {
    setRoomData({
      Room_no: "",
      Max_capacity: "",
      Floor: "",
      Room_type: "",
      Multimedia: false,
      Speaker: false,
      Room_status: "enable",
    });
    setIsEditing(false);
    setEditingRoomId(null);
    setCurrentTab(0);
  };

  // -----------------------------
  // SNACKBAR HELPER
  // -----------------------------
  const showSnackbar = (message, color) => {
    setSnackbarMessage(message);
    setSnackbarColor(color);
    setSnackbarOpen(true);
  };

  // -----------------------------
  // TABS
  // -----------------------------
  const tabLabels = role === 'Advisor'
  ? ['View list of rooms']
  : isEditing
    ? ['View list of rooms', 'Editing Room']
    : ['View list of rooms', 'Enter new Room'];

  // First tab content (list rooms)
  const tableContent = (
    <>
      <BasicBreadcrumbs breadcrumbs={breadcrumbsListRooms} />
      <Box sx={{ mb: 2, maxWidth: 200}}>
      <TextField
        label="Search rooms..."
        fullWidth
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </Box>
      <Tables
        tableHeadings={[...tableHeadings, "Actions"]}
        tableRows={tableRows}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        hideActionsForAdvisor={hideForAdvisor}
      />
    </>
  );

  // Second tab content (form)
  const formContent = (
    <>
      <BasicBreadcrumbs breadcrumbs={breadcrumbsNewRoom} />
      <div>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              maxWidth: 1000,
              margin: "0 auto",
              padding: 4,
              borderRadius: 2,
              // boxShadow: 4,
              backgroundColor: "transparent",
            }}
          >
            <TextField
              label="Room number"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={roomData.Room_no}
              onChange={(e) =>
                setRoomData({ ...roomData, Room_no: e.target.value })
              }
            />
            <TextField
              label="Max capacity"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={roomData.Max_capacity}
              onChange={(e) =>
                setRoomData({ ...roomData, Max_capacity: e.target.value })
              }
            />
            <TextField
              label="Floor"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={roomData.Floor}
              onChange={(e) =>
                setRoomData({ ...roomData, Floor: e.target.value })
              }
            />
            {/* Room Type as singledropdown or textfield. Let's do singledropdown with some example */}
            <FormControl fullWidth required>
  <Singledropdown
    label="Room type"
    value={roomData.Room_type}
    onChange={(selectedValue) =>
      setRoomData({ ...roomData, Room_type: selectedValue })
    }
    // Example room types
    menuItems={[
      { label: "Classroom", value: "Classroom" },
      { label: "Lab", value: "Lab" },
      { label: "Lecture Hall", value: "Lecture Hall" },
      
    ]}
    required
  />
</FormControl>


            {/* Multimedia & Speaker as checkboxes */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Checkboxx
  label="Multimedia"
  checked={!!roomData.Multimedia}  // Convert to boolean if necessary
  onChange={(checked) =>
    setRoomData({ ...roomData, Multimedia: Boolean(checked) })
  }
/>
<Checkboxx
  label="Speaker"
  checked={!!roomData.Speaker}
  onChange={(checked) =>
    setRoomData({ ...roomData, Speaker: Boolean(checked) })
  }
/>

</Box>


            {/* Room status: "enable" or "disable" */}
            <FormControl fullWidth required>
              <Singledropdown
                label="Room Status"
                value={roomData.Room_status}
                onChange={(selectedValue) =>
                  setRoomData({ ...roomData, Room_status: selectedValue })
                }
                menuItems={[
                  { label: "Enable", value: "enable" },
                  { label: "Disable", value: "disable" },
                ]}
                required
              />
            </FormControl>

            <Box sx={{ gridColumn: "span 2", textAlign: "center", mt: 2 }}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                {isEditing ? "Update" : "Submit"}
              </Button>
            </Box>
          </Box>
        </form>
      </div>
    </>
  );

  return (
    <div>
      {/* SNACKBAR for success/error */}
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        color={snackbarColor}
      />

      {/* TABS */}
      <Box sx={{ position: 'relative' }}>
      <TabsTeachers
        tabLabels={tabLabels}
        tabContent={[tableContent, formContent]}
        externalIndex={currentTab}
        onIndexChange={(val) => setCurrentTab(val)}
      />
      
      {/* Add Stop Editing button */}
      {isEditing && (
        <Button
          variant="contained"

          onClick={handleStopEditing}
          sx={{
            position: 'absolute',
            top: 40,
            right: 360,
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: 2,
            px: 3,
            py: 1
          }}
        >
          Stop Editing
        </Button>
      )}
    </Box>

      {/* DELETE MODAL */}
      <AlertDialogModal
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this room?"
      />
    </div>
  );
}

export default Room;
