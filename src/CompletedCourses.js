import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { get, ref, update } from "firebase/database";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./CompletedCourse.css"; 

const CompletedCourses = () => {
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

  const reopenCourse = async (courseId) => {
    try {
      setLoader(true);
      const courseRef = ref(db, `courses/${courseId}`);
      await update(courseRef, { completed: false });
      alert("Course reopened successfully!");
      fetchCompletedCourses(); // Refresh the list
    } catch (error) {
      console.error("Error reopening course: ", error.message);
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
            <Link to="/completedcourses">Completed courses</Link>
          </li>
        </ul>
        <ul>
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
                <button
                  onClick={() => reopenCourse(course.id)}
                  className="reopen-course-button"
                >
                  Reopen Course
                </button>
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

export default CompletedCourses;
