import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "./firebase"; 
import './Login.css';

const adminEmail = 'admin123@gmail.com';
const adminPassword = 'admin123';

function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignin = async (event) => {
    event.preventDefault();
    try {
      if (email === adminEmail && password === adminPassword) {
        console.log("Admin login successful!");
        navigate('/dashboard');
      } else {
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = ref(database, 'users/' + user.uid);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          if (userData.role === "EDUCATOR") {
            navigate('/educatordashboard', { state: { email: user.email } }); 
          } else if (userData.role === "STUDENT") {
            navigate('/studentdashboard', { state: { email: user.email } }); 
          } else {
            throw new Error("Unknown role, access denied.");
          }
        } else {
          throw new Error('User not found in database');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-form-container">
          <div className="login-header">Sign In</div>
          <form onSubmit={handleSignin}>
            <input
              type="email"
              className="login-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-button">Sign In</button>
          </form>
          {error && <p className="error-text">{error}</p>}
          <p className="footer-text">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/registration")}
              className="signup-link"
            >
              Signup Here.
            </span>
          </p>
          <p
            onClick={() => navigate("/forgotpassword")}
            className="forgot-password"
          >
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
