import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import "./AdminViewStudents.css";

const AdminViewStudents = () => {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const database = getDatabase();
      const usersRef = ref(database, "users");

      try {
        const data = await get(usersRef);

        if (data.exists()) {
          const allUsers = snapshot.val();
          const students = {};

          for (const uid in allUsers) {
            if (allUsers[uid].role === "STUDENT") {
              students[uid] = allUsers[uid];
            }
          }

          setStudentList(students);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="admin-view-students-container">
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
              </tr>
            </thead>
            <tbody>
              {studentList &&
                Object.keys(studentList).map((key) => (
                  <tr key={key}>
                    <td>{studentList[key].name}</td>
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