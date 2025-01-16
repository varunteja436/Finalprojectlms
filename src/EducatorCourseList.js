import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { get, ref, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import EducatorEditCourse from "./EducatorEditCourse";
import './EducatorCourseList.css';

const EducatorCourseList = () => {
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(null); 
  const [showCourseEditForm, setShowCourseEditForm] = useState(false);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    setLoader(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const coursesRef = ref(db, "courses");
      const snapshot = await get(coursesRef);

      if (snapshot.exists()) {
        const courses = [];
        snapshot.forEach((childSnapshot) => {
          const course = childSnapshot.val();
          if (course.educatorDetails?.uid === user?.uid) {
            courses.push({ id: childSnapshot.key, ...course });
          }
        });

        setAllCourses(courses);
      } else {
        alert("No courses found. Add courses to see the courses list");
        setAllCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses: ", error.message);
    } finally {
      setLoader(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      setLoader(true);
      const courseRef = ref(db, `courses/${courseId}`);
      await remove(courseRef);
      await fetchAllCourses();
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course: ", error.message);
    } finally {
      setLoader(false);
    }
  };

  const addNewCourseButton = (
    <button
      className="add-course-button"
      onClick={() => navigate("/educatorcreatecourse")}
    >
      Add New Course
    </button>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const courseCards = allCourses.map((course, index) => {
    const courseTitle = (
      <div className="course-title" key={index}>
        <strong>{course?.title}</strong>
      </div>
    );

    const courseDescription = (
      <div className="course-description">
        <strong>Description:</strong> {course?.description}
      </div>
    );

    const courseSchedule = (
      <div className="course-schedule">
        <strong>Schedule:</strong>
        <ul>
          {course?.weeklySchedules?.map((week, weekIndex) => (
            <li key={weekIndex}>
              <div>Week {weekIndex + 1}:</div>
              {week.schedule?.map((daySchedule, dayIndex) => (
                <div key={dayIndex}>
                  {daySchedule.day}: {daySchedule.startTime} - {daySchedule.endTime}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    );

    const courseDates = (
      <div className="course-dates">
        <strong>Start Date:</strong> {formatDate(course?.startDate)} <br />
        <strong>End Date:</strong> {formatDate(course?.endDate)}
      </div>
    );

    const editButton = (
      <button
        onClick={() => {
          setShowCourseDetails(course);
          setShowCourseEditForm(true);  

        }}
        className="edit-course-button"
      >
        Edit Course
      </button>
    );

    const deleteButton = (
      <button
        onClick={() => deleteCourse(course.id)}
        className="delete-course-button"
      >
        Delete Course
      </button>
    );

    return (
      <div className="course-card" key={index}>
        {courseTitle}
        {courseDescription}
        {courseSchedule}
        {courseDates} 
        {editButton}
        {deleteButton}
      </div>
    );
  });

  const courseWrapper = <div className="courses-wrapper">{courseCards}</div>;

  const courseContainer = (
    <div className="course-container1">
      <div>
        <h1 className="form-header1">Educator Courses</h1>
        {addNewCourseButton}
      </div>
      {courseWrapper}
    </div>
  );

  console.log("Show Course Details:", showCourseDetails);  

  return (
    <>
      <aside>
        <ul>
          <li><Link to="/educatorprofile">Profile</Link></li>
        </ul>
        <ul>
          <li><Link to="/educatorCourseList">Course List</Link></li>
        </ul>
      </aside>
      {courseContainer}
      {showCourseEditForm && showCourseDetails && (
        <EducatorEditCourse
          showCourseDetails={showCourseDetails}  
          setShowCourseEditForm={setShowCourseEditForm}
          setShowCourseDetails={setShowCourseDetails}
          fetchAllCourses={fetchAllCourses}
        />
      )}
    </>
  );
};

export default EducatorCourseList;
