import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Login from "./Login"; 
import Dashboard from "./Dashboard"; 
import Educatorlist from "./Educatorlist"; 
import Educatorcreate from "./Educatorcreate"; 
import Registration from "./Registration"; 
import StudentDashboard from "./StudentDashboard"; 
import EducatorDashboard from "./Educatordashboard";
import Educatorprofile from "./Educatorprofile";
import EducatorCreateCourse from "./EducatorCreateCourse";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/educatorlist" element={<Educatorlist />} />
          <Route path="/educatorcreate" element={<Educatorcreate />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/educatordashboard" element={<EducatorDashboard />} />
          <Route path="/educatorprofile" element={<Educatorprofile />} />
          <Route path="/educatorcreatecourse" element={<EducatorCreateCourse />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
