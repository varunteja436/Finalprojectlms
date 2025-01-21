import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";


const AdminEditEducator = () => {
  const location = useLocation();
  const [educatorDetails, setEducatorDetails] = useState();

  useEffect(() => {
    if (location && location.state) {
      const fetchEducatorDetails = async (uid) => {
        const database = getDatabase();
        const userRef = ref(database, `users/${uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setEducatorDetails(snapshot.val());
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchEducatorDetails(location.state.educatorDetails.uid);
    }
  }, [location]);

  return (
    <div className="admin-educator-profile-container">
      <aside>
        <ul>
          <li>
            <Link to="/admindashboard">Home</Link>
          </li>
          <li>
            <Link to="/adminstudentslist">Student List</Link>
          </li>
          <li>
            <Link to="/educatorlist">Educator List</Link>
          </li>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-educator-profile-main">
        <header>
          <h1>Edit Educator</h1>
        </header>
        <section>
          {educatorDetails ? (
            <div>
              <h2>Educator Details</h2>
              <p><strong>Name:</strong> {educatorDetails.name}</p>
              <p><strong>Email:</strong> {educatorDetails.email}</p>
              <p><strong>Age:</strong> {educatorDetails.age}</p>
              <p><strong>Phone:</strong> {educatorDetails.number}</p>
              <p><strong>Qualification:</strong> {educatorDetails.qualification}</p>
            </div>
          ) : (
            <p>Loading educator details...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminEditEducator;