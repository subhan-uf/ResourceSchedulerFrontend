import apiClient from './apiClient';

const batchCourseTeacherAssignmentService = {
  getAllAssignments: () => apiClient.get('/batch-course-teacher-assignments/'),
  getAssignmentById: (id) => apiClient.get(`/batch-course-teacher-assignments/${id}/`),
  createAssignment: (data) => apiClient.post('/batch-course-teacher-assignments/', data),
  updateAssignment: (id, data) => apiClient.put(`/batch-course-teacher-assignments/${id}/`, data),
  deleteAssignment: (id) => apiClient.delete(`/batch-course-teacher-assignments/${id}/`),
};

export default batchCourseTeacherAssignmentService;
