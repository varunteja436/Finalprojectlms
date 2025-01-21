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
    
    try {
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const course = snapshot.val();
        const enrolledStudents = course.enrolledStudents
          ? Array.isArray(course.enrolledStudents)
            ? course.enrolledStudents
            : course.enrolledStudents.split(",")
          : [];

        if (enrolledStudents.includes(studentUid)) {
          return { success: false, message: "Student is already enrolled." };
        }

        enrolledStudents.push(studentUid);
        await update(courseRef, { enrolledStudents });

        navigate("/studentenrolledcourse", {
          state: { courseDetails: course, studentUid }
        });

        alert("Student enrolled successfully.");
      } else {
        return { success: false, message: "Course not found." };
      }
    } catch (error) {
      alert("Failed to enroll to the course, please try again");
    }
  };

  const courseDetailsHtml = location?.state?.courseDetails && (
    <div className="course-detail-view-main">
      <div className="course-detail-view-description-section">
        <span className="course-detail-view-description-heading">Course Title:</span>
        <span className="course-detail-view-description-title">
          {location?.state?.courseDetails?.title}
        </span>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-description-section">
        <div className="course-detail-view-description-heading">Course Description:</div>
        <div className="course-detail-view-description-value">
          {location?.state?.courseDetails?.description}
        </div>
      </div>
      <hr className="course-detail-view-divider" />
      <div className="course-detail-view-educator-section">
        <span className="course-detail-view-description-heading">Educator:</span>
        <span className="course-detail-view-description-title">
          {location?.state?.courseDetails?.educatorDetails?.name}
        </span>
      </div>
    </div>
  );

  return (
    <div className="student-courses-container">
      <div className="student-courses-sidebar">
        <aside>
          <ul><li><Link to="/studentdashboard">Home</Link></li></ul>
          <ul><li><Link to="/studentprofile">View Profile</Link></li></ul>
          <ul><li><Link to="/studentcourse">View Courses</Link></li></ul>
          <ul><li><Link to="/">Logout</Link></li></ul>
        </aside>
      </div>
      <div className="student-courses-main">
        <div className="student-courses-header">
          <h3 className="student-courses-title">Courses Details</h3>
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
