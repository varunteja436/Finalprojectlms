import React, { useEffect, useState } from "react";
import "./Adminediteducator.css";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import { db } from "./firebase";
const AdminEditEducator = () => {
  const location = useLocation();

  console.log("location", location);
  const [educatorDetails, setEducatorDetails] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEducator, setUpdatedEducator] = useState({});

  useEffect(() => {
    if (location && location.state) {
      if (location.state.educatorDetails) {
        const fetchEducatorDetails = async (uid) => {
          const database = getDatabase();
          const userRef = ref(database, `users/${uid}`);

          try {
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
              const userDetails = snapshot.val();
              console.log("User Details:", userDetails);
              setEducatorDetails(userDetails);
            } else {
              console.log("User not found.");
              return null;
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
            return null;
          }
        };
        fetchEducatorDetails(location.state.educatorDetails.uid);
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setUpdatedEducator({ ...updatedEducator, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const ageRegex = /^[1-9][0-9]?$/;

    if (!nameRegex.test(updatedEducator.name)) {
      alert("Please enter a valid name (only letters and spaces).");
      return false;
    }
    if (!emailRegex.test(updatedEducator.email)) {
      alert("Please enter a valid email address.");
      return false;
    }
    if (!ageRegex.test(updatedEducator.age)) {
      alert("Please enter a valid age (1-99).");
      return false;
    }
    if (!phoneRegex.test(updatedEducator.number)) {
      alert("Please enter a valid phone number (10 digits).");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const educatorRef = ref(
        db,
        `users/${location.state.educatorDetails.uid}`
      );
      await update(educatorRef, updatedEducator);
      setEducatorDetails(updatedEducator);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating student profile:", error.message);
      alert("Error updating profile. Please try again.");
    }
  };

  if (!educatorDetails) {
    return <div>Loading educator details...</div>;
  }

  return (
    <div className="admin-educator-profile-container ">
      <aside>
        <ul>
          <li>
            <Link to="/admindashboard">Home</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/adminstudentslist">Student List</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/educatorlist">Educator List</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-educator-profile-main">
        <header>
          <h1>Edit Educator</h1>
        </header>
        {isEditing ? (
          <form>
            <input
              type="text"
              name="name"
              value={updatedEducator.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <input
              type="email"
              name="email"
              value={updatedEducator.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              type="number"
              name="age"
              value={updatedEducator.age}
              onChange={handleChange}
              placeholder="Age"
            />
            <input
              type="text"
              name="number"
              value={updatedEducator.number}
              onChange={handleChange}
              placeholder="Phone Number"
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
            <section className="admin-educator-details-section">
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
            </section>
            <button
              className="admin-educator-edit-btn"
              onClick={() => {
                setUpdatedEducator(educatorDetails);
                setIsEditing(true);
              }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEditEducator;
