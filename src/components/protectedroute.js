import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 1) Not even logged in → send to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2) Logged in but no allowed role → send to dashboard
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3) OK
  return children;
};

export default ProtectedRoute;
