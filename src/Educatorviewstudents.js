import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Educatorviewstudents.css";
import { get, getDatabase, ref } from "firebase/database";

const EducatorViewStudents = () => {
  const location = useLocation();

  const [studentList, setStudentList] = useState([]);

  const fetchCourseDetails = async (courseId) => {
    try {
      const db = getDatabase();
      const coursesRef = ref(db, `courses/${courseId}`);

      const snapshot = await get(coursesRef);

      if (snapshot.exists()) {
        const course = snapshot.val(); 
        console.log("Course Details:", course);

        const enrolledUsers = await Promise.all(
          course?.enrolledStudents?.map(async (studentId) => {
            const studentRef = ref(db, `users/${studentId}`); 
            const studentSnapshot = await get(studentRef);

            if (studentSnapshot.exists()) {
              return studentSnapshot.val();
            } else {
              console.log(`No data found for student with ID ${studentId}`);
              return null;
            }
          }) || []
        );

        console.log("Enrolled Users:", enrolledUsers);
        setStudentList({
          ...course,
          enrolledStudentDetails: enrolledUsers.filter((user) => user !== null), 
        });
      } else {
        console.log("No course found with the given courseId.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      return null;
    }
  };
  console.log("studentList", studentList);
  useEffect(() => {
    if (location) {
      if (location?.state) {
        if (location?.state?.courseId) {
          fetchCourseDetails(location?.state?.courseId);
        }
      }
    }
  }, [location]);

  return (
    <div className="educator-view-student-container">
      <div className="educator-view-student-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/educatordashboard">Home</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/educatorprofile">Profile</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/educatorCourseList">Course List</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/educatormyassignments">My Assignments</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/educatorPreviousCourses">Previous courses</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="educator-view-student-main">
        <div className="educator-view-student-header">
          <h3 className="educator-view-student-title">
            {" "}
            {`Enrolled Students for course  ${studentList?.title}`}
          </h3>

        </div>
        <div>
          <table className="student-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student Email</th>
              </tr>
            </thead>
            <tbody>
              {studentList?.enrolledStudentDetails?.length > 0 ? (
                studentList?.enrolledStudentDetails?.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EducatorViewStudents;