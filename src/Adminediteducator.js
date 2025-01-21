import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {db} from "./firebase";
import { getDatabase, ref, get, update } from "firebase/database";


const AdminEditEducator = () => {
  const location = useLocation();
  const [educatorDetails, setEducatorDetails] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEducator, setUpdatedEducator] = useState({});

  useEffect(() => {
    if (location && location.state) {
      const fetchEducatorDetails = async (uid) => {
        const database = getDatabase();
        const userRef = ref(database, `users/${uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setEducatorDetails(snapshot.val());
            setUpdatedEducator(snapshot.val());
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchEducatorDetails(location.state.educatorDetails.uid);
    }
  }, [location]);

  const handleChange = (e) => {
    setUpdatedEducator({ ...updatedEducator, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!nameRegex.test(updatedEducator.name)) {
      alert("Invalid name. Please enter a valid name (letters and spaces only).");
      return false;
    }
    if (!emailRegex.test(updatedEducator.email)) {
      alert("Invalid email. Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const educatorRef = ref(db, `users/${location.state.educatorDetails.uid}`);
      await update(educatorRef, updatedEducator);
      setEducatorDetails(updatedEducator);
      setIsEditing(false);
      alert("Educator profile updated successfully!");
    } catch (error) {
      console.error("Error updating educator profile:", error);
      alert("Error updating educator profile. Please try again.");
    }
  };

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
            isEditing ? (
              <form>
                <input
                  type="text"
                  name="name"
                  value={updatedEducator.name || ""}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  name="email"
                  value={updatedEducator.email || ""}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <input
                  type="number"
                  name="age"
                  value={updatedEducator.age || ""}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <input
                  type="text"
                  name="number"
                  value={updatedEducator.number || ""}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  name="qualification"
                  value={updatedEducator.qualification || ""}
                  onChange={handleChange}
                  placeholder="Qualification"
                />
                <button type="button" onClick={handleUpdate}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <h2>Educator Details</h2>
                <table>
                  <tbody>
                    <tr>
                      <th>Full Name</th>
                      <td>{educatorDetails.name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{educatorDetails.email}</td>
                    </tr>
                    <tr>
                      <th>Age</th>
                      <td>{educatorDetails.age}</td>
                    </tr>
                    <tr>
                      <th>Phone Number</th>
                      <td>{educatorDetails.number}</td>
                    </tr>
                    <tr>
                      <th>Qualification</th>
                      <td>{educatorDetails.qualification}</td>
                    </tr>
                  </tbody>
                </table>
                <button
                  className="admin-educator-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            )
          ) : (
            <p>Loading educator details...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminEditEducator;