import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ref, get, update, push, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./StudentAssignment.css";

const StudentAssignments = () => {
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [noAssignments, setNoAssignments] = useState(false);
  const [allAssignments, setAllAssignments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsHistory, setCommentsHistory] = useState([]);

  useEffect(() => {
    if (location?.state?.assignmentDetails) {
      fetchAssignmentsByCourseId(location.state.assignmentDetails);
    } else {
      setNoAssignments(true);
    }
  }, [location]);

  const fetchAssignmentsByCourseId = async (courseId) => {
    const assignmentsRef = ref(db, "assignments");

    try {
      const snapshot = await get(assignmentsRef);
      if (snapshot.exists()) {
        const assignments = snapshot.val();
        const filteredAssignments = Object.keys(assignments)
          .filter((assignmentId) => assignments[assignmentId].courseId === courseId)
          .map((assignmentId) => ({
            assignmentId,
            ...assignments[assignmentId],
          }));
        setAllAssignments(filteredAssignments);
      } else {
        setNoAssignments(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchComments = async (assignmentId) => {
    const commentsRef = ref(db, "comments");

    try {
      const snapshot = await get(commentsRef);
      if (snapshot.exists()) {
        const comments = Object.values(snapshot.val()).find(
          (comment) => comment.assignmentId === assignmentId
        )?.commentConversation || [];
        setCommentsHistory(comments);
      } else {
        setCommentsHistory([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComments = async (assignmentId, commentText) => {
    if (!commentText.trim()) {
      return alert("Please enter a valid comment.");
    }

    const commentsRef = ref(db, "comments");

    try {
      const snapshot = await get(commentsRef);
      let existingKey = null;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().assignmentId === assignmentId) {
            existingKey = childSnapshot.key;
          }
        });
      }

      if (existingKey) {
        const existingRef = ref(db, `comments/${existingKey}`);
        const existingData = (await get(existingRef)).val();

        await update(existingRef, {
          commentConversation: [
            ...existingData.commentConversation,
            {
              userRole: "STUDENT",
              userID: user.uid,
              userComment: commentText,
              createdAt: Date.now(),
            },
          ],
        });
      } else {
        const newKey = push(commentsRef).key;
        await set(ref(db, `comments/${newKey}`), {
          assignmentId,
          commentConversation: [
            {
              userRole: "STUDENT",
              userID: user.uid,
              userComment: commentText,
              createdAt: Date.now(),
            },
          ],
        });
      }

      await fetchComments(assignmentId);
      setNewComment("");
      alert("Comment added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const assignmentRef = ref(db, `assignments/${assignmentId}`);

    try {
      const snapshot = await get(assignmentRef);
      if (snapshot.exists()) {
        const assignment = snapshot.val();

        if (!assignment.submissions) {
          assignment.submissions = [];
        }

        assignment.submissions.push({
          studentId: user.uid,
          submittedAt: Date.now(),
        });

        await update(assignmentRef, { submissions: assignment.submissions });
        alert("Assignment submitted successfully!");
      } else {
        alert("Assignment not found.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  return (
    <div className="student-courses-container">
      <div className="student-courses-sidebar">
      <aside>
          <ul>
            <li>
              <Link to="/studentdashboard">Home</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentcourse">Courses</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentassignments">My Assignments</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/studentprofile"> View Profile</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="student-courses-main">
        <header>
          <h1>Assignments</h1>
        </header>
        <div className="assignment-view-wrapper">
          {noAssignments ? (
            <div>No Assignments Found</div>
          ) : (
            allAssignments.map((assignment) => (
              <div className="student-assignment-card" key={assignment.assignmentId}>
                <div className="student-assignment-divider">
                  <span className="student-assignment-title-heading">Assignment Title:</span>
                  <span className="student-assignment-value">{assignment.assignmentTitle || "N/A"}</span>
                </div>
                <hr />
                <div className="student-assignment-divider">
                  <span className="student-assignment-title-heading">Description:</span>
                  <span className="student-assignment-value">{assignment.assignmentDescription || "N/A"}</span>
                </div>
                <hr />
                <div className="student-assignment-divider">
                  <span className="student-assignment-title-heading">Submission Date:</span>
                  <span className="student-assignment-value">{assignment.submissionDate || "N/A"}</span>
                </div>
                <hr />
                <div>
                  <strong>Comments:</strong>
                  <ul>
                    {Array.isArray(commentsHistory) && commentsHistory.length > 0 ? (
                      commentsHistory.map((comment, index) => (
                        <li key={index}>
                          {comment.userRole === "EDUCATOR" ? "Educator:" : `Student${index + 1}:`}{" "}
                          {comment.userComment}
                        </li>
                      ))
                    ) : (
                      <li>No comments available.</li>
                    )}
                  </ul>
                </div>
                <div className="student-post-comment">
                  <input
                    type="text"
                    value={newComment}
                    placeholder="Add comments"
                    className="comment-input"
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    className="comment-btn"
                    onClick={() => handleComments(assignment.assignmentId, newComment)}
                  >
                    Comment
                  </button>
                  <button
                    className="submit-assignment-btn"
                    onClick={() => handleSubmitAssignment(assignment.assignmentId)}
                  >
                    Submit Assignment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;