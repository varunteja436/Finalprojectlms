import React from "react";
import { Link } from "react-router-dom";


const AdminEditEducator = () => {
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
        <div></div>
      </main>
    </div>
  );
};

export default AdminEditEducator;