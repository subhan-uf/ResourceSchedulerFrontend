import apiClient from './apiClient';

const SectionService = {
  getAllSections: () => apiClient.get('/sections/'),
  getSectionById: (id) => apiClient.get(`/sections/${id}/`),
  createSection: (sectionData) => apiClient.post('/sections/', sectionData),
  updateSection: (id, sectionData) => apiClient.put(`/sections/${id}/`, sectionData),
  deleteSection: (id) => apiClient.delete(`/sections/${id}/`),
};

export default SectionService;
