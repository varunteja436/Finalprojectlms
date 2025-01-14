import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Login = () => {
    const navigate = useNavigate();


  return (
    <div
      className="login-container"
    >
      <div className="login-form-container">
        <h1 className="login-title">Login Form</h1>
        <input
          type="text"
          placeholder="Email ID"
          name="email"
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="login-input"
        />
        <button
          className="login-button"
        >
          Login
        </button>
        <p className="signup-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;