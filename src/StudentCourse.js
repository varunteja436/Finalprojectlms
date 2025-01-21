import React from "react";
import { Link } from "react-router-dom";


const AvailableCourseCard = ({ course, onViewDetails }) => {
  return (
    <div className="student-AvailableCourse-card">
      <div className="student-AvailableCourse-name">{course.title}</div>
      <button
        className="student-AvailableCourse-btn"
        onClick={onViewDetails}
      >
        Enroll Now
      </button>
    </div>
  );
};

const StudentCourse = () => {
  return (
    <aside>
      <ul>
        <li><Link to="/studentdashboard">Home</Link></li>
        
        <li><Link to="/studentprofile">View Profile</Link></li>
        <li><Link to="/studentcourses">View Course</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </aside>
  );
};

export default StudentCourse;