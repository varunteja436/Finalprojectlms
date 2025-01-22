import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentEnrolledCourse.css";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";

const StudentEnrolledCourses = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [allEnrolledCourses, setAllEnrolledCourses] = useState([]);
  useEffect(() => {
    if (user) {
      fetchEnrolledCourses(user.uid);
    }
  }, [user]);

  const fetchEnrolledCourses = async (studentUid) => {
    const database = getDatabase();
    const coursesRef = ref(database, "courses");

    try {
      const snapshot = await get(coursesRef);

      if (snapshot.exists()) {
        const courses = snapshot.val();
        const enrolledCourses = [];


        for (const courseId in courses) {
          const course = courses[courseId];
          const enrolledStudents = course.enrolledStudents || [];


          if (enrolledStudents.includes(studentUid)) {
            enrolledCourses.push({ courseId, ...course });
          }
        }
        console.log("enrolledCourses", enrolledCourses);
        setAllEnrolledCourses(enrolledCourses);
      } else {
        console.log("No courses found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error.message);
      return [];
    }
  };

  const enrolledCoursesCardWrapper =
    allEnrolledCourses &&
    allEnrolledCourses.map((course) => (
      <div className="student-enrolled-courses-card">
        <div className="student-enrolledcourse-title">{course?.title}</div>{" "}
        <button
          onClick={() =>
            navigate("/studentcoursedetails", {
              state: { courseDetails: course },
            })
          }
          className="student-enrolledcourse-btn"
        >
          Details
        </button>
      </div>
    ));

  return (
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
          <h3 className="student-courses-title">Enrolled Courses</h3>

          {/* // remaining header */}
        </div>

        <div className="card-wrapper-enrolled-courses">
          {enrolledCoursesCardWrapper}
        </div>
      </div>
    </div>
  );
};

export default StudentEnrolledCourses;
