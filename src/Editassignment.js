import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./Editassignment.css";
const EditAssignments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [assignmentData, setAssignmentData] = useState(
    location?.state?.assignmentData || {}
  );
  const [fetchingCourses, setAllFetchingCourses] = useState(false);
  const [allCoursesOptions, setAllCoursesOptions] = useState([]);
  const [allCoursesDetails, setAllCoursesDetails] = useState([]);
  // [
  //   assignmentDescription,
  //   assignmentTitle,
  //   courseDetails,
  //   courseId,
  //   createdAt,
  //   educatorUid,
  //   studentResponse,
  //   submissionDate,
  //   uid,
  // ];
  console.log("allCoursesDetails", allCoursesDetails);
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setAllFetchingCourses(true);

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

          const options = courses.map((i) => {
            return {
              value: i.id,
              label: i.title,
            };
          });
          setAllCoursesOptions(options);
          setAllCoursesDetails(courses);
        } else {
          alert("No courses found. Add courses to see the courses list");
          setAllCoursesOptions([]);
        }
      } catch (error) {
        console.error("Error fetching courses: ", error.message);
      } finally {
        setAllFetchingCourses(false);
      }
    };
    fetchAllCourses();
  }, [user]);

  const handleChange = (e) => {
    setAssignmentData({
      ...assignmentData,
      [e.target.name]: e.target.value,
    });
  };
  const updateAssignment = async () => {
    try {
      const db = getDatabase();
      const assignmentRef = ref(
        db,
        `assignments/${assignmentData?.assignmentId}`
      );

      // Check if the assignment exists
      const snapshot = await get(assignmentRef);

      if (snapshot.exists()) {
        const {
          assignmentDescription,
          assignmentTitle,

          submissionDate,
        } = assignmentData;

        const updatedData = {
          assignmentDescription,
          assignmentTitle,

          submissionDate,
        };
        await update(assignmentRef, updatedData);

        console.log(
          `Assignment with ID ${assignmentData?.assignmentId} has been updated.`
        );
        alert("Assignment updated successfully.");
        navigate("/educatormyassignments");
      } else {
        console.log(
          `Assignment with ID ${assignmentData?.assignmentId} not found.`
        );
        alert("Assignment not found.");
      }
    } catch (error) {
      console.error("Error updating the assignment:", error);
      alert("Failed to update the assignment.");
    }
  };

  console.log(location);
  return (
    <>
      <div className="assignment-container">
        <div className="assignment-sidebar">
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
        </div>
        <div className="assignment-main">
          <h1 className="form-header1">Edit Assignment</h1>
        </div>
      </div>
      <div className="form-contentt1">
        <div className="input-wrappercourse">
          <label className="input-label" htmlFor="assignmentTitle">
            Assignment Title:
          </label>
          <input
            type="text"
            id="assignmentTitle"
            name="assignmentTitle"
            placeholder="Assignment Title"
            value={assignmentData.assignmentTitle}
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
            value={assignmentData.assignmentDescription}
            onChange={handleChange}
            className="input-field"
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
            value={assignmentData.submissionDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="button-containerr1">
          <button
            onClick={() => updateAssignment()}
            className="submit-buttonn1"
          >
            Submit Assignment
          </button>
          <button
            onClick={() => navigate("/educatormyassignments")}
            className="cancel-buttonn1"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default EditAssignments;