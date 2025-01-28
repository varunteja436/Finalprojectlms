import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { db } from "./firebase";
import "./Studentprofile.css";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedStudent, setUpdatedStudent] = useState({});
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!currentUser) {
        alert("No user is logged in.");
        return;
      }

      try {
        const studentRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(studentRef);
        if (snapshot.exists()) {
          setStudent(snapshot.val());
          setUpdatedStudent(snapshot.val());
        } else {
          alert("Student details not found.");
        }
      } catch (error) {
        console.error("Error fetching student details:", error.message);
      }
    };

    fetchStudentDetails();
  }, [currentUser]);

  const handleChange = (e) => {
    setUpdatedStudent({ ...updatedStudent, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const ageRegex = /^[1-9][0-9]?$/;

    if (!nameRegex.test(updatedStudent.name)) {
      alert("Please enter a valid name (only letters and spaces).");
      return false;
    }
    if (!emailRegex.test(updatedStudent.email)) {
      alert("Please enter a valid email address.");
      return false;
    }
    if (!ageRegex.test(updatedStudent.age)) {
      alert("Please enter a valid age (1-99).");
      return false;
    }
    if (!phoneRegex.test(updatedStudent.number)) {
      alert("Please enter a valid phone number (10 digits).");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const studentRef = ref(db, `users/${currentUser.uid}`);
      await update(studentRef, updatedStudent);
      setStudent(updatedStudent);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating student profile:", error.message);
      alert("Error updating profile. Please try again.");
    }
  };

  return (
    <div className="student-profile-container">
<aside>
          <ul>
            <li>
              <Link to="/studentdashboard">Home</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentcourse">Courses</Link>
            </li>
          </ul>
          <ul>
                      <li>
                        <Link to="/studentallassignments">My Assignments</Link>
                      </li>
                    </ul>
          <ul>
            <li>
              <Link to="/studentprofile"> View Profile</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      <main className="student-profile-main">
        <header>
          <h1>Student Profile</h1>
        </header>
        <section className="student-details-section">
          {student ? (
            isEditing ? (
              <form>
                <input
                  type="text"
                  name="name"
                  value={updatedStudent.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  name="email"
                  value={updatedStudent.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <input
                  type="number"
                  name="age"
                  value={updatedStudent.age}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <input
                  type="text"
                  name="number"
                  value={updatedStudent.number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
                <button type="button" onClick={handleUpdate}>Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </form>
            ) : (
              <div>
                <table>
                  <tbody>
                    <tr>
                      <th>Full Name</th>
                      <td>{student.name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{student.email}</td>
                    </tr>
                    <tr>
                      <th>Age</th>
                      <td>{student.age}</td>
                    </tr>
                    <tr>
                      <th>Phone Number</th>
                      <td>{student.number}</td>
                    </tr>
                  </tbody>
                </table>
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>
            )
          ) : (
            <p>Loading student details...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;
