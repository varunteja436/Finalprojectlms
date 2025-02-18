import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, get, remove } from "firebase/database";
import { db } from "./firebase";
import "./Educatorlist.css";

const EducatorList = () => {
  const navigate = useNavigate();
  const [educators, setEducators] = useState([]);

  useEffect(() => {
    fetchEducators();
  }, []);

  const fetchEducators = async () => {
    const educatorsRef = ref(db, "users");
    const snapshot = await get(educatorsRef);
    if (snapshot.exists()) {
      const educatorsData = snapshot.val();
      const educatorsArray = Object.keys(educatorsData)
        .map((key) => ({
          ...educatorsData[key],
          id: key,
        }))
        .filter((user) => user.role === "EDUCATOR");
      setEducators(educatorsArray);
    } else {
      console.log("No educators found");
    }
  };

  const deleteUserById = async (userId) => {
    const userRef = ref(db, `users/${userId}`);

    try {
      await remove(userRef);
      await fetchEducators();
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const deleteButton = (
    <button className="delete-course-button">Delete Educator</button>
  );

  return (
    <div className="educator-list-container">
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
            <Link to="/adminviewcontent"> View Content</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <main className="educator-list-main">
        <header>
          <h1>Admin Educator List</h1>
        </header>
        <section className="educator-list-section">
          <button
            className="create-educator-button"
            onClick={() => navigate("/educatorcreate")}
          >
            Create Educator
          </button>
        </section>
        <section className="educator-table-section">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {educators.map((educator) => (
                <tr key={educator.id}>
                  <td>{educator.name}</td>
                  <td>{educator.email}</td>
                  <td>{educator.number}</td>
                  <td>{educator.qualification}</td>
                  <td>
                    <span
                      onClick={() =>
                        navigate("/adminediteducator", {
                          state: { educatorDetails: educator },
                        })
                      }
                      className="admin-educator-edit-btn-td"
                    >
                      Edit
                    </span>
                  </td>
                  <td onClick={() => deleteUserById(educator.id)}>
                    {deleteButton}
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

export default EducatorList;