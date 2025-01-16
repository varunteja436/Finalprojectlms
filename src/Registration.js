import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { set, ref } from "firebase/database";
import './Registration.css';
import { updateProfile } from "firebase/auth";


const Registration = () => {
  const navigate = useNavigate();
  const regexPatterns = {
    name: /^[A-Za-z]+([ '-][A-Za-z]+)*$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
  };

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    password: "",
    isActive: true,
  });

  const handleChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const registerUser = async () => {
    try {
      if (!regexPatterns.email.test(userProfile?.email)) {
        alert("Not a valid email");
        return;
      }
      if (!regexPatterns.password.test(userProfile?.password)) {
        alert(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
        );
        return;
      }
      if (!userProfile.name || !userProfile.email) {
        alert("Email or name is missing!");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userProfile.email,
        userProfile.password
      );
      const user = userCredential.user;

      const userProfileData = {
        name: userProfile.name,
        email: userProfile.email,
        role: "STUDENT",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
        uid: user.uid,
        courses: {},
      };
      await set(ref(db, "users/" + user.uid), userProfileData);
      navigate("/");
    } catch (error) {
      console.error("Error registering user: ", error.message);
      alert("Error registering user: " + error.message);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-wrapper">
        <div className="registration-form-container">
          <div className="registration-header">Sign Up</div>

          <div className="input-wrapper">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full name"
              value={userProfile.name}
              onChange={handleChange}
              className="registration-input"
            />
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Email"
              value={userProfile.email}
              onChange={handleChange}
              className="registration-input"
            />
          </div>

          <div className="input-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={userProfile.password}
              onChange={handleChange}
              className="registration-input"
            />
          </div>

          <button
            onClick={registerUser}
            className="registration-button"
          >
            Register
          </button>

          <p className="registration-footer-text">
            Already have an account!{" "}
            <span onClick={() => navigate("/")}>Login Here.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
