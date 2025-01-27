import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AssignmentViewProgress.css";
import { get, ref } from "firebase/database";
import { db } from "./firebase";
const AssignmentViewProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentResponses, setStudentResponses] = useState({});
  const [studentDetails, setStudentDetails] = useState([]);

  useEffect(() => {
    location?.state?.assignmentId &&
      fetchAssignmentById(location?.state?.assignmentId);
  }, [location?.state?.assignmentId]);

  const fetchUserById = async (userId) => {
    const assignmentsRef = ref(db, `users/${userId}`);

    try {
      const assignmentSnapshot = await get(assignmentsRef);

      if (!assignmentSnapshot.exists()) {
        console.log(`No assignment found with ID: ${userId}`);
        return null;
      }

      const assignment = assignmentSnapshot.val();
      console.log(`Assignment fetched successfully:`, assignment);
      return assignment;
    } catch (error) {
      console.error("Error fetching assignment:", error);
      throw error;
    }
  };

  const fetchAssignmentById = async (assignmentId) => {
    const assignmentsRef = ref(db, `assignments/${assignmentId}`);

    try {
      const assignmentSnapshot = await get(assignmentsRef);

      if (!assignmentSnapshot.exists()) {
        console.log(`No assignment found with ID: ${assignmentId}`);
        return null;
      }

      const assignment = assignmentSnapshot.val();
      console.log(`Assignment fetched successfully:`, assignment);
      setStudentResponses(assignment);
      const studentResponsesValueArr = await Promise.all(
        assignment?.studentResponse?.map(async (i) => {
          const userDetails = await fetchUserById(i.studentId);
          return {
            userDetails,
            responsesArr: i?.value ? i?.value : [],
            completeResponses: i,
          };
        })
      );
      setStudentDetails(studentResponsesValueArr);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  };
  console.log("studentDetails", studentDetails);
  return (
    <div className="view-progress-container">
      <div className="view-progress-sidebar">
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
      <div className="view-progress-main">
        <h1 className="view-progress-header1">Assignment Progress</h1>
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Student Submissions</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {studentDetails?.length > 0 ? (
              studentDetails?.map((student, index) => (
                <tr key={index}>
                  <td>{student.userDetails.name}</td>
                  {/* <td>
                    {student.responsesArr.map((i) => (
                      <span>{`Submitted on - ${i.newValue}`}</span>
                    ))}
                  </td> */}
                  <td
                    className="add-grade"
                    onClick={() => {
                      navigate("/assignmentaddgrade", {
                        state: {
                          assignmentStudentRes: student,
                          assignmentId: location?.state?.assignmentId,
                        },
                      });
                    }}
                  >
                    {student?.completeResponses?.grade
                      ? "Submission History"
                      : "View Progress"}
                  </td>
                  <td>{student?.completeResponses?.grade || "-"}</td>
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
  );
};

export default AssignmentViewProgress;