import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import "./Educatordashboard.css";

const EducatorDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkFirstTimeLogin = async () => {
      if (!currentUser) {
        alert("No user is logged in.");
        navigate("/");
        return;
      }

      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.firstTimeLogin) {
          navigate("/educatorchangepassword");
        }
      } else {
        alert("User profile not found.");
        navigate("/");
      }
    };

    checkFirstTimeLogin();
  }, [currentUser, navigate]);

  return (
    <div className="educator-dashboard-container">
      <aside>
        <ul>
          <li><Link to="/educatorprofile">Profile</Link></li>
          <li><Link to="/educatorCourseList">Course List</Link></li>
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