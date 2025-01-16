import React, { useState } from "react";
import { auth } from "./firebase";  
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./forgotpassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      console.error("Error sending reset email:", error.message);
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-form-container">
          <div className="forgot-password-header">Reset Password</div>

          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              className="forgot-password-input"
            />
          </div>

          <button onClick={handleResetPassword} className="forgot-password-button">
            Send Reset Link
          </button>

          {message && <p className="forgot-password-message">{message}</p>}

          <p className="forgot-password-footer-text">
            Remember your password? <span onClick={() => navigate("/")}>Login Here.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
