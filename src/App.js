import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import MainPage from './main'; 
import StudentPage from './student'; 
import LecturerPage from './lecturer'; 

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} /> 
          <Route path="/student" element={<StudentPage />} /> 
          <Route path="/lecturer" element={<LecturerPage />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;
