import React, { useEffect, useState } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import "./Adminviewstudents.css";


const AdminViewStudents = () => {
  const [studentList, setStudentList] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const database = getDatabase();
    const usersRef = ref(database, "users"); 

    try {
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const allUsers = snapshot.val(); 
        const students = {};


        for (const uid in allUsers) {
          if (allUsers[uid].role === "STUDENT") {
            students[uid] = allUsers[uid]; 
          }
        }

        console.log("Students:", students);
        setStudentList(students); 
      } else {
        console.log("No users found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const deactivateUserById = async (userId, flag) => {
    const userRef = ref(db, `users/${userId}`);

    try {
      await update(userRef, { isActive: flag });
      await fetchStudents();
      alert("User deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  return (
    <div className="admin-view-students-container">
      <aside>
        <ul>
          <li>
            <Link to="/dashboard">Home</Link>
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
            <Link to="/adminviewcontent"> View Content</Link>
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
      <main className="admin-view-students-main">
        <header>
          <h1>Admin Students List</h1>
        </header>

        <section className="admin-view-students-section">
          <table border="1">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {studentList &&
                Object.keys(studentList).map((key) => (
                  <tr key={key}>
                    <td>{studentList[key].name}</td>
                    <td>
                      {studentList[key]?.isActive ? (
                        <button
                          className="suspend-btn"
                          onClick={() =>
                            deactivateUserById(studentList[key]?.uid, false)
                          }
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          className="active-student-btn"
                          onClick={() =>
                            deactivateUserById(studentList[key]?.uid, true)
                          }
                        >
                          Activate Student
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminViewStudents;
