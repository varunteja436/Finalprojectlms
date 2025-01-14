import React from "react";
import "./App.css";
import Login from "./Login"; 
import { BrowserRouter, Route, Routes } from "react-router-dom"; 
import Dashboard from "./Dashboard"; function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
