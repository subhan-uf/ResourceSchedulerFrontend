import React, {useEffect, useState} from 'react';
import './App.css';
import Availability from './components/availability';
import Batch from './components/batch';
import Compensatory from './components/compensatory';
import Course from './components/course';
import Dashboard from './components/dashboard';
import ResponsiveAppBar from './components/designelements/navbar';
import Generation from './components/generation';
import Login from './components/login';
import Preference from './components/preference';
import Report from './components/report';
import Room from './components/room';
import Teacher from './components/teacher';
import User from './components/user';
import './index.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/protectedroute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token to verify login state
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);  // Update login state
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };
 
  return (
    <Router>
    <div className="App">
      <ResponsiveAppBar isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout}/>
      <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path='/availability' element={<Availability/>}/>
        <Route path='/batch' element={<ProtectedRoute><Batch/></ProtectedRoute>}/>
        <Route path='/Compensatory' element={<Compensatory/>}/>
        <Route path='/Course' element={<ProtectedRoute><Course/></ProtectedRoute>}/>
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path='/generation' element={<ProtectedRoute><Generation/></ProtectedRoute>}/>
        <Route path='/preference' element={<ProtectedRoute><Preference/></ProtectedRoute>}/>
        <Route path='/report' element={<ProtectedRoute><Report/></ProtectedRoute>}/>
        <Route path='/room' element={<ProtectedRoute><Room/></ProtectedRoute>}/>
        <Route path='/Teacher' element={<ProtectedRoute><Teacher/></ProtectedRoute>}/>
        <Route path='/user' element={<ProtectedRoute><User/></ProtectedRoute>}/>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
