import apiClient from './apiClient';

const teacherCourseAssignmentService = {
  getAllAssignments: () => apiClient.get('/teacher-course-assignments/'),
  getAssignmentById: (id) => apiClient.get(`/teacher-course-assignments/${id}/`),
  createAssignment: (data) => apiClient.post('/teacher-course-assignments/', data),
  updateAssignment: (id, data) => apiClient.put(`/teacher-course-assignments/${id}/`, data),
  deleteAssignment: (id) => apiClient.delete(`/teacher-course-assignments/${id}/`),
};

export default teacherCourseAssignmentService;
