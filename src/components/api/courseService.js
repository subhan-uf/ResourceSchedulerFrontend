import apiClient from './apiClient';

const CourseService = {
  // GET all
  getAllCourses: () => apiClient.get('/courses/'),

  // GET by id
  getCourseById: (id) => apiClient.get(`/courses/${id}/`),

  // POST
  createCourse: (courseData) => apiClient.post('/courses/', courseData),

  // PUT
  updateCourse: (id, courseData) => apiClient.put(`/courses/${id}/`, courseData),

  // DELETE
  deleteCourse: (id) => apiClient.delete(`/courses/${id}/`),
};

export default CourseService;
