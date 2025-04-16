import axios from "axios";

// Adjust BASE_URL to match your Django backend endpoint.
const BASE_URL = "http://127.0.0.1:8000/api/disciplines/";

const disciplineService = {
  getAllDisciplines: () => axios.get(BASE_URL),
  createDiscipline: (payload) => axios.post(BASE_URL, payload),
  updateDiscipline: (name, payload) =>
    axios.put(`${BASE_URL}${encodeURIComponent(name)}/`, payload),
  deleteDiscipline: (name) =>
    axios.delete(`${BASE_URL}${encodeURIComponent(name)}/`),
};

export default disciplineService;
