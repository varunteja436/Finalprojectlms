import React from "react";
import { Link } from "react-router-dom";


const StudentCourse = () => {
  return (
    <aside>
      <ul>
        <li><Link to="/studentdashboard">Home</Link></li>
        <li><Link to="/studentcourse">Courses</Link></li>
        <li><Link to="/studentprofile">View Profile</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </aside>
  );
};

export default StudentCourse;