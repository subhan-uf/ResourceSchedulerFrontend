// src/api/generationService.js
import axios from 'axios';

const API_URL = 'https://0d28-34-16-248-1.ngrok-free.app/solve';

const generateTimetable = async (generationData) => {
  try {
    const response = await axios.post(API_URL, generationData);
    return response.data;
  } catch (error) {
    console.error('Error generating timetable:', error);
    throw error;
  }
};

export default {
  generateTimetable
};