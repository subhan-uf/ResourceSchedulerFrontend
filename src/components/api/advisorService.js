import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/'; // Change this to your backend URL
const token = localStorage.getItem('accessToken');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
export const getAdvisors = () => {
  return axios.get(`${API_BASE_URL}advisors/`);
};

export const createAdvisor = (advisorData) => {
  return axios.post(`${API_BASE_URL}advisors/`, advisorData);
};

export const updateAdvisor = (id, advisorData) => {
  return axios.put(`${API_BASE_URL}advisors/${id}/`, advisorData);
};

export const deleteAdvisor = (id) => {
  return axios.delete(`${API_BASE_URL}advisors/${id}/`);
};
