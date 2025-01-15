import apiClient from './apiClient';

const BatchService = {
  getAllBatches: () => apiClient.get('/batches/'),
  getBatchById: (id) => apiClient.get(`/batches/${id}/`),
  createBatch: (batchData) => apiClient.post('/batches/', batchData),
  updateBatch: (id, batchData) => apiClient.put(`/batches/${id}/`, batchData),
  deleteBatch: (id) => apiClient.delete(`/batches/${id}/`),
};

export default BatchService;
