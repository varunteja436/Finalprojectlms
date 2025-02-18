import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "./firebase";
import { get, ref, set, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import "./Educatorcreateassignment.css";

const EducatorCreateAssignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [allCoursesOptions, setAllCoursesOptions] = useState([]);
  const [newAssignmentDetails, setNewAssignmentDetails] = useState({
    assignmentTitle: "",
    assignmentDescription: "",
    submissionDate: "",
    courseId: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setNewAssignmentDetails({
      ...newAssignmentDetails,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const coursesRef = ref(db, "courses");
        const data = await get(coursesRef);

        if (data.exists()) {
          const courses = [];
          data.forEach((childdata) => {
            const course = childdata.val();
            if (course.educatorDetails?.uid === user?.uid) {
              courses.push({ id: childdata.key, ...course });
            }
          });

          const options = courses.map((i) => {
            return {
              value: i.id,
              label: i.title,
            };
          });
          setAllCoursesOptions(options);
        } else {
          alert("No courses found. Add courses to see the courses list");
          setAllCoursesOptions([]);
        }
      } catch (error) {
        console.error("Error fetching courses: ", error.message);
      }
    };

    fetchAllCourses();
    
    if (location.state?.assignmentId) {
      const fetchAssignmentDetails = async () => {
        try {
          const assignmentRef = ref(db, `assignments/${location.state.assignmentId}`);
          const snapshot = await get(assignmentRef);
          if (snapshot.exists()) {
            const assignmentData = snapshot.val();
            setNewAssignmentDetails({
              assignmentTitle: assignmentData.assignmentTitle,
              assignmentDescription: assignmentData.assignmentDescription,
              submissionDate: assignmentData.submissionDate,
              courseId: assignmentData.courseDetails.id,
            });
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching assignment details: ", error);
        }
      };
      fetchAssignmentDetails();
    }
  }, [user, location.state?.assignmentId]);

  const submitAssignment = async () => {
    if (!newAssignmentDetails.assignmentTitle || !newAssignmentDetails.submissionDate || !newAssignmentDetails.courseId) {
      alert("Please fill in all required fields.");
      return;
    }
  
    if (!newAssignmentDetails.courseId) {
      alert("Course ID is missing.");
      return;
    }
  
    try {
      const assignmentsRef = ref(db, "assignments");
      const courseRef = ref(db, `courses/${newAssignmentDetails.courseId}`);
      const coursedata = await get(courseRef);
  
      if (!coursedata.exists()) {
        alert("Course not found!");
        return;
      }
  
      const courseDetails = coursedata.val();
  
      if (isEditing) {
        const assignmentRef = ref(db, `assignments/${location.state.assignmentId}`);
        await set(assignmentRef, {
          ...newAssignmentDetails,
          educatorUid: user?.uid,
          createdAt: Date.now(),
          courseDetails: courseDetails,
        });
        alert("Assignment updated successfully!");
      } else {
        const newAssignmentWithCourse = {
          ...newAssignmentDetails,
          uid: push(assignmentsRef).key,
          educatorUid: user?.uid,
          createdAt: Date.now(),
          courseDetails: courseDetails,
        };
  
        const newAssignmentRef = push(assignmentsRef);
        await set(newAssignmentRef, newAssignmentWithCourse);
        alert("Assignment submitted successfully!");
      }
  
      navigate("/educatormyassignments");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment. Please try again.");
    }
  };
  
  return (
    <>
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
      <div className="form-containerr1">
        <main className="form-mainn1">
          <header className="header2">{isEditing ? "Update Assignment" : "Add Assignment"}</header>
          <div className="form-headerr1">{isEditing ? "Edit Assignment" : "Add Assignment"}</div>
          <div className="form-contentt1">
            <div className="input-groupp1">
              <label className="input-label" htmlFor="assignmentTitle">
                Assignment Title:
              </label>
              <input
                type="text"
                id="assignmentTitle"
                name="assignmentTitle"
                placeholder="Assignment Title"
                value={newAssignmentDetails.assignmentTitle}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="textarea-groupp1">
              <label className="input-label" htmlFor="assignmentDescription">
                Assignment Description:
              </label>
              <textarea
                id="assignmentDescription"
                name="assignmentDescription"
                value={newAssignmentDetails.assignmentDescription}
                onChange={handleChange}
                className="textarea-field"
              />
            </div>

            <div className="input-wrappercourse">
              <label className="input-label" htmlFor="submissionDate">
                Submission Date:
              </label>
              <input
                type="date"
                id="submissionDate"
                name="submissionDate"
                value={newAssignmentDetails.submissionDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="courseId">Course:</label>
              <select
                id="courseId"
                name="courseId"
                value={newAssignmentDetails.courseId}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a course
                </option>
                {allCoursesOptions?.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="button-containerr1">
              <button onClick={submitAssignment} className="submit-buttonn1">
                {isEditing ? "Update Assignment" : "Submit Assignment"}
              </button>
              <button
                onClick={() => navigate("/educatormyassignments")}
                className="cancel-buttonn1"
              >
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EducatorCreateAssignment;
