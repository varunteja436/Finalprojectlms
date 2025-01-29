import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { get, ref, update } from "firebase/database";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./CompletedCourse.css"; 

const StudentcomletionCourses = () => {
  const navigate = useNavigate();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    fetchCompletedCourses();
  }, []);

  const fetchCompletedCourses = async () => {
    setLoader(true);
    try {
      const coursesRef = ref(db, "courses");
      const snapshot = await get(coursesRef);
      if (snapshot.exists()) {
        const courses = [];
        snapshot.forEach((childSnapshot) => {
          const course = childSnapshot.val();
          if (course?.completed) {
            courses.push({ id: childSnapshot.key, ...course });
          }
        });
        setCompletedCourses(courses);
      } else {
        alert("No completed courses found.");
      }
    } catch (error) {
      console.error("Error fetching completed courses: ", error.message);
    } finally {
      setLoader(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="completed-courses-container">
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
            <ul>
            <li>
              <Link to="/studentcomletionCourses">Completed Courses</Link>
            </li>
            </ul>

            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>

      <div>
        <h1 className="form-header1">Completed Courses</h1>
        <div className="courses-wrapper">
          {completedCourses.length > 0 ? (
            completedCourses.map((course, index) => (
              <div className="course-card" key={index}>
                <div className="course-title">
                  <strong>{course.title}</strong>
                </div>
                <div className="course-description">
                  <strong>Description:</strong> {course.description}
                </div>
                <div className="course-dates">
                  <strong>Start Date:</strong> {formatDate(course.startDate)} <br />
                  <strong>End Date:</strong> {formatDate(course.endDate)}
                </div>
                
              </div>
            ))
          ) : (
            <p>No completed courses available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentcomletionCourses
