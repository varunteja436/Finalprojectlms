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
    const [showCourseDetails, setShowCourseDetails] = useState({
      description: "",
      schedule: "",
      title: "",
      id: "",
    });

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

    const courseCards = allCourses.map((course, index) => {
      const courseTitle = (
        <div className="course-title" key={index}>
          {course?.title}
        </div>
      );

      const editButton = (
        <button
          onClick={() => {
            setShowCourseDetails({
              title: course?.title,
              description: course?.description,
              schedule: course?.schedule,
              id: course?.id,
            });
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

    return (
      <>
        <aside>
          <ul>
            <li><Link to="/educatorprofile">Profile</Link></li>
          </ul>
          <ul>
            <li><Link to="/educatorCourseList">Course List</Link></li>
          </ul>
          <ul>
            <li><Link to="/">logout</Link></li>
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
