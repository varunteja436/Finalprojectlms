import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import "./Educatorlist.css";

const EducatorList = () => {
  const navigate = useNavigate();
  const [educators, setEducators] = useState([]);

  useEffect(() => {
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

    fetchEducators();
  }, []);

  return (
    <div className="educator-list-container">
      <aside>
        <ul>
          <li>
            <Link to="/educatorlist">Educator List</Link>
          </li>
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
              </tr>
            </thead>
            <tbody>
              {educators.map((educator) => (
                <tr key={educator.id}>
                  <td>{educator.name}</td>
                  <td>{educator.email}</td>
                  <td>{educator.number}</td>
                  <td>{educator.qualification}</td>
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
