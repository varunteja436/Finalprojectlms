import React, { useState } from "react";
import { db } from "./firebase";
import { get, update, ref } from "firebase/database";
import { Link, useLocation } from "react-router-dom";
import "./AssignmentAddGrade.css";
const AssignmentAddGrade = () => {
  const location = useLocation();
  console.log("location", location);

  const [addedGrade, setAddedGrade] = useState("");

  const addGradeToStudent = async (assignmentId, studentId, gradeValue) => {
    const assignmentRef = ref(db, `assignments/${assignmentId}`);

    try {
      // Fetch the assignment by ID
      const assignmentSnapshot = await get(assignmentRef);

      if (!assignmentSnapshot.exists()) {
        console.error("Assignment not found!");
        return;
      }

      const assignmentData = assignmentSnapshot.val();
      const studentResponses = assignmentData.studentResponse || [];

      // Find the index of the student in studentResponse
      const studentIndex = studentResponses.findIndex(
        (response) => response.studentId === studentId
      );

      if (studentIndex === -1) {
        console.error("Student not found in the assignment!");
        return;
      }

      // Add or update the grade for the student
      studentResponses[studentIndex].grade = gradeValue;

      // Update the assignment in the database
      await update(assignmentRef, { studentResponse: studentResponses });

      alert("Grade added/updated successfully!");
    } catch (error) {
      console.error("Error adding grade:", error);
    } finally {
      setAddedGrade("");
    }
  };

  return (
    <>
      <div className="add-grade-container">
        <div className="add-grade-sidebar">
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
        <div className="add-grade-main">
          <h1 className="add-grade-header1">Add Grade</h1>
          <div className="add-grade-main-wrapper">
            <div className="add-grade-details-row">
              <div>
                <span className="add-grade-title">Student Name - </span>
                <span className="add-grade-value">
                  {location?.state?.assignmentStudentRes?.userDetails?.name}
                </span>
              </div>
              <div>
                <span className="add-grade-title">Grade - </span>
                <span className="add-graded-value">
                  {location?.state?.assignmentStudentRes?.completeResponses
                    ?.grade || "No grade yet"}
                </span>
              </div>
            </div>

            <hr className="add-grade-divider" />
            <div>
              {" "}
              <span className="add-grade-title">Student Email - </span>
              <span className="add-grade-value">
                {location?.state?.assignmentStudentRes?.userDetails?.email}
              </span>
            </div>
            <hr className="add-grade-divider" />
            {/* <div><span>Student Name</span><span>{location?.state?.userDetails?.name}</span></div> */}
            <div>
              <div className="add-grade-response">Student Responses </div>
              <table className="add-grade-table">
                <thead>
                  <tr>
                    <th>Response</th>
                    <th>Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {location?.state?.assignmentStudentRes?.responsesArr?.map(
                    (res, index) => (
                      <tr>
                        <td>{res?.newValue || "No response"}</td>
                        <td>
                          {res?.submittedDate
                            ? new Date(res.submittedDate).toLocaleDateString()
                            : "No date available"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            <hr className="add-grade-divider" />
            <div className="submit-grade-wrapper">
              <div>
                <input
                  type="text"
                  placeholder="Add Grade"
                  className="add-grade-input"
                  value={addedGrade}
                  onChange={(e) => setAddedGrade(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="add-grade-btn"
                  onClick={() =>
                    addGradeToStudent(
                      location?.state?.assignmentId,
                      location?.state?.assignmentStudentRes?.userDetails?.uid,
                      addedGrade
                    )
                  }
                >
                  {location?.state?.assignmentStudentRes?.completeResponses
                    ?.grade
                    ? "Re-Submit Grade"
                    : "Submit grade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentAddGrade;
