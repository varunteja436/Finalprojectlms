import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import "./StudentCourse.css";

const StudentCourses = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [availableCoursesToEnroll, setAvailableCoursesToEnroll] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (user.uid) {
      fetchUnenrolledCourses(user.uid);
      fetchEnrolledCourses(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredCourses(availableCoursesToEnroll);
    } else {
      const lowercasedSearchValue = searchValue.toLowerCase();
      const filtered = availableCoursesToEnroll.filter((course) =>
        course.title.toLowerCase().includes(lowercasedSearchValue)
      );
      setFilteredCourses(filtered);
    }
  }, [searchValue, availableCoursesToEnroll]);

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

        return enrolledCourses;
      } else {
        console.log("No courses found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error.message);
      return [];
    }
  };

  const fetchUnenrolledCourses = async (studentUid) => {
    const database = getDatabase();
    const coursesRef = ref(database, "courses");

    try {
      const snapshot = await get(coursesRef);

      if (snapshot.exists()) {
        const courses = snapshot.val();
        const unenrolledCourses = [];

        for (const courseId in courses) {
          const course = courses[courseId];
          const enrolledStudents = course.enrolledStudents || [];

          if (!enrolledStudents.includes(studentUid)) {
            unenrolledCourses.push({ courseId, ...course });
          }
        }

        setAvailableCoursesToEnroll(unenrolledCourses);
        setFilteredCourses(unenrolledCourses); 
      } else {
        console.log("No courses found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching unenrolled courses:", error.message);
      return [];
    }
  };

  const availableCourseCard =
    filteredCourses &&
    filteredCourses.map((course, index) => {
      return (
        <div className="student-unenrolledcourse-card" key={course.courseId}>
          <div className="student-unenrolledcourse-name">{course.title}</div>
          <button
            className="student-unenrolledcourse-btn"
            onClick={() => {
              navigate("/studentunenrolledcourse", {
                state: { courseDetails: course },
              });
            }}
          >
            Course Details
          </button>
        </div>
      );
    });

  const unenrolledCoursesWrapper = (
    <div className="unenrolled-course-wrapper">
      <div className="unenrolled-course-wrapper-title">Available Courses</div>
      <div className="unenrolled-course-card-wrapper">
        {availableCourseCard}
      </div>
    </div>
  );

  return (
    <div className="student-course-container">
      <div className="student-course-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/studentdashboard">Home</Link>
            </li>
            <li>
              <Link to="/studentcourse">Courses</Link>
            </li>
            <li>
              <Link to="/studentassignment">My Assignments</Link>
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
      <div className="student-course-main">
        <div className="student-course-header">
          <h3 className="student-course-title">Courses</h3>
          <input
            type="text"
            placeholder="Search courses"
            className="student-course-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="student-course-details">
          <div className="student-enrolled-course">
            <div>View enrolled Courses</div>
            <button
              onClick={() => navigate("/studentenrolledcourse")}
              className="stu-enrolledcourse-btn"
            >
              View
            </button>
          </div>
          <hr className="divider" />
          {unenrolledCoursesWrapper}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;