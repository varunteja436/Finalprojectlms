import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get, getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
import "./StudentEnrolledCourse.css";

const StudentEnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser; 

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses(user.uid); 
    }
  }, [user]);

  const fetchEnrolledCourses = async (studentUid) => {
    const database = getDatabase();
    const studentRef = ref(database, `users/${studentUid}`);

    try {
      const snapshot = await get(studentRef);
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        const enrolledCourses = studentData.enrolledCourses || [];

        const coursesData = await Promise.all(
          enrolledCourses.map(async (courseId) => {
            const courseRef = ref(database, `courses/${courseId}`);
            const courseSnapshot = await get(courseRef);
            if (courseSnapshot.exists()) {
              return courseSnapshot.val();
            } else {
              return null;
            }
          })
        );

        setEnrolledCourses(coursesData.filter(Boolean)); 
        setLoading(false);
      } else {
        console.log("Student not found.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading enrolled courses...</div>;
  }

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
          <h3 className="student-courses-title">My Enrolled Courses</h3>
        </div>
        {enrolledCourses.length > 0 ? (
          <div className="courses-list">
            {enrolledCourses.map((course, index) => (
              <div key={index} className="course-card">
                <div className="course-title">{course.title}</div>
                <div className="course-description">{course.description}</div>
                <div className="course-educator">
                  <strong>Educator:</strong> {course.educatorDetails?.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No enrolled courses found.</div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrolledCourses;
