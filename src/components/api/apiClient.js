import axios from 'axios';

// Create a base instance of Axios
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Optional timeout of 5 seconds
});

// ========= Token Handling ============

// Request Interceptor - Attach Access Token to Requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Fetch access token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

// ========= Token Refresh Logic ============
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Response Interceptor - Handle Token Expiry and Auto Refresh
apiClient.interceptors.response.use(
  (response) => response, // Return response if successful
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and not retried yet, refresh the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue failed requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://127.0.0.1:8000/api/refresh-token/', {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/'; // Redirect to login page on token failure
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
