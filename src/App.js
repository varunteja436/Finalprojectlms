import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Login from "./Login"; 
import Dashboard from "./Dashboard"; 
import Educatorlist from "./Educatorlist"; 
import Registration from "./Registration";
import StudentDashboard from "./StudentDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/educatorlist" element={<Educatorlist />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

export default App;
