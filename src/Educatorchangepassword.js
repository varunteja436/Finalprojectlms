import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, updatePassword } from "firebase/auth";
import { ref, update } from "firebase/database";
import { db } from "./firebase";
import "./Educatorchangepassword.css";

const EducatorChangePassword = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const handlePasswordChange = async () => {
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one digit, and one special character."
      );
      return;
    }

    try {
      if (user) {
        await updatePassword(user, newPassword);

        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, { firstTimeLogin: false });

        alert("Password updated successfully!");
        navigate("/educatordashboard");
      } else {
        setError("User is not authenticated. Please log in again.");
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
      setError("An error occurred while updating your password.");
    }
  };

  return (
    <div className="educator-change-password-container">
      <div className="change-password-form">
        <h1>Change Password</h1>
        <input
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
        />
        {error && <p className="error-text">{error}</p>}
        <button onClick={handlePasswordChange} className="submit-button">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default EducatorChangePassword;