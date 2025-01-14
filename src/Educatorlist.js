import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Educatorlist.css";

const EducatorList = () => {
  const navigate = useNavigate();

  return (
    <div className="educator-list-container">
      <aside>
        <ul>
          <li><Link to="/educatorlist">Educatorlist</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </aside>
      <main className="educator-list-main">
        <header>
          <h1>Admin Educator List</h1>
        </header>
        <section className="educator-list-section">
          <button
            className="create-educator-button"
            onClick={() => navigate("/create-educator")}
          >
            Create Educator
          </button>
        </section>
      </main>
    </div>
  );
};

export default EducatorList;
