import apiClient from './apiClient';

const CompensatoryService = {
  // GET all compensatory records
  getAllCompensatory: () => apiClient.get('/compensatory/'),

  // GET one compensatory record by id
  getCompensatoryById: (id) => apiClient.get(`/compensatory/${id}/`),

  // POST (create) a new compensatory record
  createCompensatory: (compensatoryData) => apiClient.post('/compensatory/', compensatoryData),

  // PUT (update) an existing compensatory record by id
  updateCompensatory: (id, compensatoryData) => apiClient.put(`/compensatory/${id}/`, compensatoryData),

  // DELETE a compensatory record by id
  deleteCompensatory: (id) => apiClient.delete(`/compensatory/${id}/`),
};

export default CompensatoryService;
