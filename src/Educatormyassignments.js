import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./Educatormyassignments.css";

const EducatorMyAssignments = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchAssignmentsByEducator = async (educatorUid) => {
    const assignmentsRef = ref(db, "assignments");

    try {

      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        return;
      }

      const assignments = assignmentsSnapshot.val();


      const filteredAssignments = Object.keys(assignments)
        .filter(
          (assignmentId) =>
            assignments[assignmentId].educatorUid === educatorUid
        )
        .map((assignmentId) => ({
          assignmentId,
          ...assignments[assignmentId],
        }));
      
      console.log("assignments", filteredAssignments);

      if (filteredAssignments.length === 0) {
        console.log("No assignments found for this educator");
        return;
      }


      setAllAssignments(filteredAssignments);
    } catch (error) {
      console.log("Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssignmentsByEducator(user.uid);
    }
  }, [user]);


  const addNewCourseButton = (
    <button
      className="add-assignment-button"
      onClick={() => navigate("/educatorcreateassignment")}
    >
      Add New Assignment
    </button>
  );

  return (
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
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="assignment-main">
        <>
          <h1 className="form-header1">Educator Assignments</h1>
          <div className="assignment-card-container">
            {addNewCourseButton}
            {allAssignments &&
              allAssignments.map((assignment, index) => (
                <div key={index} className="assignment-card">
                  <div className="assignment-info">
                    <div className="assignment-title">
                      {assignment.assignmentTitle}
                    </div>
                    <div className="assignment-class">
                      Class: {assignment.courseDetails?.title}
                    </div>
                  </div>
                  <div className="view-progress-row">
                    <div className="assignment-deadline">
                      <span className="assignment-deadline-title">
                        Deadline for submission:{" "}
                      </span>
                      <span>{assignment.submissionDate}</span>
                    </div>
                    <button
                      className="view-progress-btn"
                      onClick={() =>
                        navigate("/dummy", {
                          
                        })
                      }
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      </div>
    </div>
  );
};

export default EducatorMyAssignments;