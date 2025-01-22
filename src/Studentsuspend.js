import React from "react";
import { Link } from "react-router-dom";
import "./Studentsuspend.css";
const SuspendedStudent = () => {
  return (
    <div className="educator-profile-container">
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
            <Link to="/adminprofile"> View Profile</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </aside>
      <div className="suspended-title">
        Account Suspended. Please Contact administrator
      </div>
    </div>
  );
};

export default SuspendedStudent;
