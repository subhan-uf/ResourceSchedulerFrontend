import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResponsiveAppBar from './components/designelements/navbar';
import ProtectedRoute from './components/protectedroute';

import Login from './components/login';
import Availability from './components/availability';
import Batch from './components/batch';
import Compensatory from './components/compensatory';
import Course from './components/course';
import Dashboard from './components/dashboard';
import Generation from './components/generation';
import Preference from './components/preference';
import Report from './components/report';
import Room from './components/room';
import Teacher from './components/teacher';
import User from './components/user';
import DisciplineAndLabSettingsPage from './components/disciplines';

import './App.css';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check localStorage for token
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <ResponsiveAppBar isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        {/* Advisor-only */}
        <Route
          path="/availability"
          element={
            <ProtectedRoute roles={['Advisor']}>
              <Availability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compensatory"
          element={
            <ProtectedRoute roles={['Advisor']}>
              <Compensatory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generation"
          element={
            <ProtectedRoute roles={['Advisor']}>
              <Generation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preference"
          element={
            <ProtectedRoute roles={['Advisor']}>
              <Preference />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute roles={['Advisor']}>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* DEO-only */}
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={['DEO']}>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/disciplines"
          element={
            <ProtectedRoute roles={['DEO']}>
              <DisciplineAndLabSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Both advisor & deo */}
        <Route
          path="/batch"
          element={
            <ProtectedRoute roles={['Advisor', 'DEO']}>
              <Batch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course"
          element={
            <ProtectedRoute roles={['Advisor', 'DEO']}>
              <Course />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['Advisor', 'DEO']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room"
          element={
            <ProtectedRoute roles={['Advisor', 'DEO']}>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['Advisor', 'DEO']}>
              <Teacher />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
