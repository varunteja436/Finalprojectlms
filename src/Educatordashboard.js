import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { getAuth, updatePassword } from "firebase/auth";
import { db } from "./firebase";
import "./Educatordashboard.css";

const EducatorDashboard = () => {
  const navigate = useNavigate();

  const handleFirstLoginPasswordChange = async (loggedInUserUid) => {
    if (!loggedInUserUid) {
      alert("UID not found, please login again");
      return;
    }

    const auth = getAuth();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    try {
      const userRef = ref(db, `users/${loggedInUserUid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.firstTimeLogin) {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("User not authenticated. Please log in again.");
          }

          let newPassword = prompt(
            "Please enter your new password (minimum 6 characters, including uppercase, lowercase, digit, and special character):"
          );
          if (!newPassword || !passwordRegex.test(newPassword)) {
            alert(
              "Invalid password. Please ensure it contains at least 6 characters, including one uppercase letter, one lowercase letter, one digit, and one special character."
            );
            return;
          }

          await updatePassword(user, newPassword);

          await update(userRef, { firstTimeLogin: false });

          alert("Password updated successfully! You can now continue.");
        }
      } else {
        alert("User profile not found.");
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert("Error updating password. Please try again.");
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      handleFirstLoginPasswordChange(currentUser.uid);
    } else {
      alert("No user is logged in. Please log in again.");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="educator-dashboard-container">
      <aside>
        <ul>
          <li><Link to="/educatorprofile">Profile</Link></li>
        </ul>
      </aside>
      <main className="educator-dashboard-main">
        <header>
          <h1>Educator Dashboard</h1>
        </header>
        <section className="educator-dashboard-content">
          <h1>Welcome, Educator!</h1>
        </section>
      </main>
    </div>
  );
};

export default EducatorDashboard;