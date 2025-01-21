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

  useEffect(() => {
    if (user.uid) {
      fetchUnenrolledCourses(user.uid);
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
      } else {
        console.log("No courses found.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching unenrolled courses:", error.message);
      return [];
    }
  };

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
          console.log("Student is already enrolled in the course.");
          return { success: false, message: "Student is already enrolled." };
        }

        enrolledStudents.push(studentUid);
        await update(courseRef, { enrolledStudents });
        await fetchUnenrolledCourses(user.uid);
        await fetchEnrolledCourses(user.uid);
        alert("Student enrolled successfully.");
      } else {
        console.error("Course not found.");
        return { success: false, message: "Course not found." };
      }
    } catch (error) {
      console.error("Error enrolling student:", error.message);
      alert("Failed to enroll to the course, please try again");
    }
  };

  const availableCourseCard =
    availableCoursesToEnroll &&
    Object.values(availableCoursesToEnroll).map((course, index) => {
      return (
        <div className="student-unenrolledcourse-card">
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
          <ul><li><Link to="/studentdashboard">Home</Link></li></ul>
          <ul><li><Link to="/studentprofile">View Profile</Link></li></ul>
          <ul><li><Link to="/studentcourse">View Courses</Link></li></ul>
          <ul><li><Link to="/">Logout</Link></li></ul>
        </aside>
      </div>
      <div className="student-course-main">
        <div className="student-course-header">
          <h3 className="student-course-title">Courses</h3>
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
