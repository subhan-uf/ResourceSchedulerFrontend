import React, {useState} from 'react';
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

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn]= React.useState(false)

  const handeLogin=()=>{
    setIsLoggedIn(true)
  }
  const handleLogout=()=>{
    setIsLoggedIn(false)
  }
 
  return (
    <Router>
    <div className="App">
      <ResponsiveAppBar isLoggedIn={isLoggedIn} onLogin={handeLogin} onLogout={handleLogout}/>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/availability' element={<Availability/>}/>
        <Route path='/batch' element={<Batch/>}/>
        <Route path='/Compensatory' element={<Compensatory/>}/>
        <Route path='/Course' element={<Course/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/generation' element={<Generation/>}/>
        <Route path='/preference' element={<Preference/>}/>
        <Route path='/report' element={<Report/>}/>
        <Route path='/room' element={<Room/>}/>
        <Route path='/Teacher' element={<Teacher/>}/>
        <Route path='/user' element={<User/>}/>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
