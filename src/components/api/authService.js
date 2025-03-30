import apiClient from './apiClient';

const AuthService = {
  // Login API - Accepts credentials and user role
  login: (credentials, role) => {
    const endpoint = role === 'advisor' ? '/login/advisor/' : '/deo/login/';
    return apiClient.post(endpoint, credentials);
  },

  // Logout API - Role-specific logout
  logout: (role) => {
    const endpoint = role === 'advisor' ? '/logout/advisor/' : '/deo/logout/';
    // Get the refresh token from localStorage
    const refreshToken = localStorage.getItem("refreshToken");
    return apiClient.post(endpoint, { refresh_token: refreshToken });
  },
  

  // Refresh Token (optional)
  refreshToken: () => apiClient.post('/refresh-token'),
};

export default AuthService;
