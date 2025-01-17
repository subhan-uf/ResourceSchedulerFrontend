import apiClient from './apiClient';

const teacherService = {
  getAllTeachers: () => apiClient.get('/teachers/'),
  getTeacherById: (id) => apiClient.get(`/teachers/${id}/`),
  createTeacher: (teacherData) => apiClient.post('/teachers/', teacherData),
  updateTeacher: (id, teacherData) => apiClient.put(`/teachers/${id}/`, teacherData),
  deleteTeacher: (id) => apiClient.delete(`/teachers/${id}/`),
};

export default teacherService;
