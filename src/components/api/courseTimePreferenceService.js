import apiClient from './apiClient';

const coursePreferenceService = {
  getAll: () => apiClient.get('/course-preference-constraints/'),
  getById: (id) => apiClient.get(`/course-preference-constraints/${id}/`),
  create: (data) => apiClient.post('/course-preference-constraints/', data),
  update: (id, data) => apiClient.put(`/course-preference-constraints/${id}/`, data),
  delete: (id) => apiClient.delete(`/course-preference-constraints/${id}/`),
};

export default coursePreferenceService;
