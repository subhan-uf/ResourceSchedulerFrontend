import apiClient from './apiClient';

const RoomService = {
  getAllRooms: () => apiClient.get('/rooms/'),
  getRoomById: (id) => apiClient.get(`/rooms/${id}/`),
  createRoom: (roomData) => apiClient.post('/rooms/', roomData),
  updateRoom: (id, roomData) => apiClient.put(`/rooms/${id}/`, roomData),
  deleteRoom: (id) => apiClient.delete(`/rooms/${id}/`),
};

export default RoomService;
