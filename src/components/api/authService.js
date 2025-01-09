import apiClient from './apiClient';

const AuthService = {
  // Login API - Accepts credentials and user role
  login: (credentials, role) => {
    const endpoint = role === 'advisor' ? '/advisor/login/' : '/login/deo/';
    return apiClient.post(endpoint, credentials);
  },

  // Logout API - Role-specific logout
  logout: (role) => {
    const endpoint = role === 'advisor' ? '/logout/advisor/' : '/logout/deo/';
    return apiClient.post(endpoint);
  },

  // Refresh Token (optional)
  refreshToken: () => apiClient.post('/refresh-token'),
};

export default AuthService;
