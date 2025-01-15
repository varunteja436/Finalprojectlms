import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import "./Educatorprofile.css";

const EducatorProfile = () => {
  const [educator, setEducator] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEducatorDetails = async () => {
      if (!currentUser) {
        alert("No user is logged in.");
        return;
      }

      try {
        const educatorRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(educatorRef);

        if (snapshot.exists()) {
          setEducator(snapshot.val());
        } else {
          alert("Educator details not found.");
        }
      } catch (error) {
        console.error("Error fetching educator details:", error.message);
      }
    };

    fetchEducatorDetails();
  }, [currentUser]);

  if (!educator) {
    return <div>Loading educator profile...</div>;
  }

  return (
    <div className="educator-profile-container">
      <aside>
        <ul>
          <li>
            <Link to="/educatorlist">Back to Educator List</Link>
          </li>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <main className="educator-profile-main">
        <header>
          <h1>Educator Profile</h1>
        </header>
        <section className="educator-details-section">
          <table>
            <tbody>
              <tr>
                <th>Full Name</th>
                <td>{educator.name}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{educator.email}</td>
              </tr>
              <tr>
                <th>Age</th>
                <td>{educator.age}</td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>{educator.number}</td>
              </tr>
              <tr>
                <th>Qualification</th>
                <td>{educator.qualification}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default EducatorProfile;