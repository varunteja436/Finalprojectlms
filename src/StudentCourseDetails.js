import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import "./StudentCourseDetails.css";

const StudentCourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const dropCourse = async () => {
    try {
      const courseId = location?.state?.courseDetails?.courseId;
      if (!user || !courseId) {
        alert("User or course information is missing.");
        return;
      }

      const studentId = user.uid;
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);

      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.val();
        const enrolledStudents = courseData.enrolledStudents || [];
        const updatedEnrolledStudents = enrolledStudents.filter(
          (id) => id !== studentId
        );

        await update(courseRef, { enrolledStudents: updatedEnrolledStudents });

        alert("Successfully removed from the course.");
        navigate("/studentcourse");
      } else {
        alert("Course not found.");
      }
    } catch (error) {
      console.error("Error dropping the course:", error);
      alert("Failed to drop the course. Please try again.");
    }
  };

  return (
    <div className="student-courses-container">
      <div className="student-courses-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/studentdashboard">Home</Link>
            </li>
            <li>
              <Link to="/studentcourse">Courses</Link>
            </li>
            <li>
              <Link to="/studentallassignment">My Assignments</Link>
            </li>
            <li>
              <Link to="/studentprofile">View Profile</Link>
            </li>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>

      <div className="student-courses-main">
        <div className="student-courses-header">
          <h3 className="student-courses-title">Course Details</h3>
          <button onClick={dropCourse} className="student-enrolledcourse-btn-drop">
            Drop Course
          </button>
        </div>

        {location?.state?.courseDetails ? (
          <div className="detailed-course-view-wrapper">
            <div className="course-detail-view-main">
              <div className="course-detail-view-description-section">
                <span className="course-detail-view-description-heading">
                  Course Title:
                </span>
                <span className="course-detail-view-description-title">
                  {location.state.courseDetails.title}
                </span>
              </div>
              <hr className="course-detail-view-divider" />
              <div className="course-detail-view-description-section">
                <span className="course-detail-view-description-heading">
                  Course Description:
                </span>
                <span className="course-detail-view-description-value">
                  {location.state.courseDetails.description}
                </span>
              </div>
              <hr className="course-detail-view-divider" />
              <div className="course-detail-view-description-section">
                <span className="course-detail-view-description-heading">
                  Start Date:
                </span>
                <span className="course-detail-view-description-title">
                  {location.state.courseDetails.startDate}
                </span>
              </div>
              <div className="course-detail-view-description-section">
                <span className="course-detail-view-description-heading">
                  End Date:
                </span>
                <span className="course-detail-view-description-title">
                  {location.state.courseDetails.endDate}
                </span>
              </div>
              <hr className="course-detail-view-divider" />
              <div className="course-detail-view-educator-section">
                <span className="course-detail-view-description-heading">
                  Educator:
                </span>
                <span className="course-detail-view-description-title">
                  {location.state.courseDetails.educatorDetails?.name || "N/A"}
                </span>
              </div>
              <hr className="course-detail-view-divider" />
              <div className="course-detail-view-schedules">
                <span className="course-detail-view-description-heading">
                  Weekly Schedules:
                </span>
                <ul>
                  {location.state.courseDetails.weeklySchedules?.map(
                    (week, idx) => (
                      <li key={idx}>
                        <strong>Week {idx + 1}: </strong>
                        {week.startDate} to {week.endDate}
                        <ul>
                          {week.schedule.map((day, dayIdx) => (
                            <li key={dayIdx}>
                              {day.day}: {day.startTime} - {day.endTime}
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p>No course details available.</p>
        )}

        <div className="assignment-btns">
          <button
            className="assignment-btn-style"
            onClick={() =>
              navigate("/studentassignments", {
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
  );
};

export default StudentCourseDetails;