import apiClient from './apiClient';

const AuthService = {
  // Login API - Accepts credentials and user role
  login: (credentials, role) => {
    const endpoint = role === 'advisor' ? '/advisor/login/' : '/deo/login/';
    return apiClient.post(endpoint, credentials);
  },

  // Logout API - Role-specific logout
  logout: (role) => {
    const endpoint = role === 'advisor' ? '/logout/advisor/' : '/deo/logout/';
    return apiClient.post(endpoint);
  },

  // Refresh Token (optional)
  refreshToken: () => apiClient.post('/refresh-token'),
};

export default AuthService;
