import React, { useState, useEffect } from "react";
import { get, getDatabase, ref, update } from "firebase/database";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./StudentUnenrolledCourse.css";

const StudentUnEnrolledCoursesViewDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [studentCourseDetails, setStudentCourseDetails] = useState({});

  useEffect(() => {
    setStudentCourseDetails(location?.state?.courseDetails);
  }, [location]);

  const enrollStudentToCourse = async (studentUid, courseUid) => {
    const database = getDatabase();
    const courseRef = ref(database, `courses/${courseUid}`);
    const studentRef = ref(database, `users/${studentUid}`);
    try {
      const courseSnapshot = await get(courseRef);
      const studentSnapshot = await get(studentRef);
      if (!courseSnapshot.exists() || !studentSnapshot.exists()) {
        alert("Course or Student not found.");
        return;
      }
      const course = courseSnapshot.val();
      const student = studentSnapshot.val();
      const enrolledStudents = course.enrolledStudents || [];
      const enrolledCourses = student.enrolledCourses || [];
      if (enrolledStudents.includes(studentUid)) {
        alert("Already enrolled.");
        return;
      }
      enrolledStudents.push(studentUid);
      enrolledCourses.push(courseUid);
      await update(courseRef, { enrolledStudents });
      await update(studentRef, { enrolledCourses });
      alert("Successfully enrolled.");
      navigate("/studentenrolledcourses");
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Failed to enroll. Please try again.");
    }
  };

  const courseDetailsHtml = studentCourseDetails && (
    <div className="course-detail-view-main">
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">Course Title:</span>
        <span className="course-detail-view-description-title">
          {studentCourseDetails.title}
        </span>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">Course Description:</span>
        <span className="course-detail-view-description-value">
          {studentCourseDetails.description}
        </span>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">Start Date:</span>
        <span className="course-detail-view-description-title">
          {studentCourseDetails.startDate}
        </span>
      </div>
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">End Date:</span>
        <span className="course-detail-view-description-title">
          {studentCourseDetails.endDate}
        </span>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-schedules">
        <span className="course-detail-view-description-heading">Weekly Schedules:</span>
        <ul>
          {studentCourseDetails?.weeklySchedules?.map((week, idx) => (
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
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="student-courses-container">
      <div className="student-courses-sidebar">
        <aside>
          <ul>
            <li><Link to="/studentdashboard">Home</Link></li>
            <li><Link to="/studentprofile">View Profile</Link></li>
            <li><Link to="/studentcourse">View Courses</Link></li>
            <li><Link to="/">Logout</Link></li>
          </ul>
        </aside>
      </div>
      <div className="student-courses-main">
        <div className="student-courses-header">
          <h3 className="student-courses-title">Course Details</h3>
        </div>
        <div className="detailed-course-view-wrapper">{courseDetailsHtml}</div>
        <div className="enroll-btn-wrapper">
          <button
            className="assignment-button-style"
            onClick={() =>
              enrollStudentToCourse(user?.uid, studentCourseDetails?.courseId)
            }
          >
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentUnEnrolledCoursesViewDetails;