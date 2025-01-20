import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const AdminDashboard = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in");
        return;
      }

      const uid = user.uid;
      const database = getDatabase();
      const userRef = ref(database, `users/${uid}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("userDate", userData);
          setName(userData.name);
        } else {
          console.error("No data available for this user.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserProfile();
  }, []);

  console.log("name", name);

  return (
    <div className="admin-dashboard-container">
      <aside>
        <ul>
          <li>
            <Link to="/dashboard">Home</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/adminviewstudents">Student List</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/educatorlist">Educator List</Link>
          </li>
        </ul>

        <ul>
          <li>
            <Link to="/adminprofile"> View Profile</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-dashboard-main">
        <header>
          <h1>Admin Dashboard</h1>
        </header>
        <div className="admin-details">
          {name ? `Welcome, ${name}` : "Loading..."}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
