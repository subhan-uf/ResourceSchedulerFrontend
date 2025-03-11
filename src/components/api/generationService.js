// src/api/generationService.js
import apiClient from './apiClient';
import axios from 'axios';

const GENERATION_API_URL = 'https://83b8-34-86-234-131.ngrok-free.app/solve';

const generateTimetable = async (generationData) => {
  try {
    const response = await axios.post(GENERATION_API_URL, generationData);
    return response.data;
  } catch (error) {
    console.error('Error generating timetable:', error);
    throw error;
  }
};
const deleteTimetableHeader = (headerId) => {
  return apiClient.delete(`/timetable-header/${headerId}/`);
};

const deleteTimetableDetail = (detailId) => {
  return apiClient.delete(`/timetable-detail/${detailId}/`);
};
const saveTimetableHeader = (headerPayload) => {
  return apiClient.post('/timetable-header/', headerPayload);
};

const saveTimetableDetail = (detailPayload) => {
  return apiClient.post('/timetable-detail/', detailPayload);
};

// NEW FUNCTIONS FOR GENERATION ENDPOINTS:
const createGeneration = (payload) => {
  return apiClient.post('/generation/', payload);
};

const getGenerations = () => {
  return apiClient.get('/generation/');
};

const deleteGeneration = (id) => {
  return apiClient.delete(`/generation/${id}/`);
};

const updateGeneration = (id, payload) => {
  return apiClient.put(`/generation/${id}/`, payload);
};

export default {
  generateTimetable,
  saveTimetableHeader,
  saveTimetableDetail,
  createGeneration,
  getGenerations,
  deleteGeneration,
  updateGeneration,
};
