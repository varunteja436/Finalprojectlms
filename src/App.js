import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Login from "./Login"; 
import Dashboard from "./Dashboard"; 
import Educatorlist from "./Educatorlist"; 
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/educatorlist" element={<Educatorlist />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
