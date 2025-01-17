import apiClient from './apiClient';

const roomPreferenceService = {
  getAll: () => apiClient.get('/teacher-room-preference/'),
  getById: (id) => apiClient.get(`/teacher-room-preference/${id}/`),
  create: (data) => apiClient.post('/teacher-room-preference/', data),
  update: (id, data) => apiClient.put(`/teacher-room-preference/${id}/`, data),
  delete: (id) => apiClient.delete(`/teacher-room-preference/${id}/`),
};

export default roomPreferenceService;
