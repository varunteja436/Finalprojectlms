import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, database } from "./firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, database } from "./firebase"; 
import { useNavigate } from "react-router-dom";
import './Login.css'; 


const adminEmail = 'admin123@gmail.com';
const adminPassword = 'admin123';

const Login = () => {
  const regexPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  };

  const navigate = useNavigate();
  const [loginCreds, setLoginCreds] = useState({ email: "", password: "" });
  const [error, setError] = useState('');

  const onChangeHandler = (name, value) => {
    setLoginCreds({ ...loginCreds, [name]: value });
  };

  const loginUser = async (event) => {
    event.preventDefault();
    try {
      const { email, password } = loginCreds;

      if (email === adminEmail && password === adminPassword) {
        navigate('/dashboard');
        return;
      }

      if (!regexPatterns.email.test(email)) {
        alert("Not a valid email");
        return;
      }
      
      if (!email || !password) {
        alert("Email or password is missing!");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;

      const userRef = ref(database, `users/${user.uid}`);
      const userData = await get(userRef);

      if (userData.exists()) {
        navigate('/StudentDashboard', { state: { email: user.email } });
      } else {
        throw new Error("User not found in database");
      }
    } catch (err) {
      setError(err.message);  
      alert(err.message); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-form-container">
          <div className="login-header">Login</div>
          <form onSubmit={loginUser}>
            <input
              type="text"
              placeholder="Email ID"
              name="email"
              value={loginCreds.email}
              onChange={({ target: { name, value } }) => onChangeHandler(name, value)}
              className="login-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={loginCreds.password}
              onChange={({ target: { name, value } }) => onChangeHandler(name, value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          {error && <p className="error-text">{error}</p>}
          <p className="footer-text">
            Don't have an account!{" "}
            <span
              onClick={() => navigate("/registration")}
              className="signup-link"
            >
              Signup Here.
            </span>
          </p>
          <p
            onClick={() => navigate("/forgot-password")}
            className="forgot-password"
          >
            Forgot Password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

