import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./StudentCourseDetails.css";

const StudentCourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  console.log("location", location);

  const courseDetailsHtml = location?.state?.courseDetails && (
    <div className="course-detail-view-main">
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">
          Course Title:
        </span>
        <span className="course-detail-view-description-title">
          {location?.state?.courseDetails?.title}
        </span>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-description-section">
        <div className="course-detail-view-description-heading">
          Course Description:
        </div>
        <div className="course-detail-view-description-value">
          {location?.state?.courseDetails?.description}
        </div>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-educator-section">
        <span className="course-detail-view-description-heading">
          Educator:
        </span>
        <span className="course-detail-view-description-title">
          {location?.state?.courseDetails?.educatorDetails?.name}
        </span>
      </div>
    </div>
  );

  return (
    // <div className="outer-layer-wrapper">
    <div className="student-courses-container">
      <div className="student-courses-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/studentdashboard">Home</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentcourses">Courses</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentassignments">My Assignments</Link>
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
      </div>
      <div className="student-courses-main">
        <div className="student-courses-header">
          <h3 className="student-courses-title"> Courses Detailed View</h3>

          {/* // remaining header */}
        </div>

        <div className="detailed-course-view-wrapper">{courseDetailsHtml}</div>
        <div className="assignment-btns">
          <button
            className="assignment-btn-style"
            onClick={() =>
              navigate("/studentassignmentsbycourse", {
                state: {
                  assignmentDetails: location?.state?.courseDetails?.courseId,
                },
              })
            }
          >
            View Assignments
          </button>
          <button className="assignment-btn-style">View Grade</button>
        </div>
      </div>
    </div>

    // </div>
  );
};

export default StudentCourseDetails;
