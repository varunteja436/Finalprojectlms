import React, { useEffect, useState } from "react";
import "./Educatormyassignments.css";
import { Link, useNavigate } from "react-router-dom";
import { get, ref, push, set } from "firebase/database";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

const EducatorMyAssignments = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);
  const [newCommentValue, setNewCommentValue] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchAssignmentsByEducator(user.uid);
    }
  }, [user]);

  const addComment = async (courseId, assignmentId, userId, commentText, userRole) => {
    const commentsRef = ref(db, "comments");

    try {
      if (!commentText.trim()) {
        alert("Comment cannot be empty.");
        return;
      }

      const newCommentRef = push(commentsRef);
      const commentData = {
        assignmentId,
        courseId,
        userId,
        userRole,
        commentValue: commentText,
        createdAt: new Date().toISOString(),
      };

      await set(newCommentRef, commentData);
      alert("Comment added successfully!");
      setNewCommentValue("");
      fetchAssignmentsByEducator(user.uid); 
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchAssignmentsByEducator = async (educatorUid) => {
    const assignmentsRef = ref(db, "assignments");
    const commentsRef = ref(db, "comments");

    try {
      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        setAllAssignments([]);
        return;
      }

      const assignments = assignmentsSnapshot.val();
      const filteredAssignments = Object.keys(assignments)
        .filter(
          (assignmentId) => assignments[assignmentId]?.educatorUid === educatorUid
        )
        .map((assignmentId) => ({
          assignmentId,
          ...assignments[assignmentId],
        }));

      if (filteredAssignments.length === 0) {
        console.log("No assignments found for this educator");
        setAllAssignments([]);
        return;
      }

      const commentsSnapshot = await get(commentsRef);
      const comments = commentsSnapshot.exists() ? commentsSnapshot.val() : {};

      const assignmentsWithComments = filteredAssignments.map((assignment) => {
        const commentDetails = comments
          ? Object.values(comments).filter(
              (comment) => comment.assignmentId === assignment.assignmentId
            )
          : [];

        return {
          ...assignment,
          commentDetails: commentDetails.length > 0 ? commentDetails : [],
        };
      });

      setAllAssignments(assignmentsWithComments);
    } catch (error) {
      console.error("Error fetching assignments or comments:", error);
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/educatordashboard">Home</Link>
            </li>
            <li>
              <Link to="/educatorprofile">Profile</Link>
            </li>
            <li>
              <Link to="/educatorCourseList">Course List</Link>
            </li>
            <li>
              <Link to="/educatormyassignments">My Assignments</Link>
            </li>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="assignment-main">
        <h1 className="form-header1">Educator Assignments</h1>
        <button
          className="add-assignment-button"
          onClick={() => navigate("/educatorcreateassignment")}
        >
          Add New Assignment
        </button>
        <div className="assignment-card-container">
          {allAssignments.length > 0 ? (
            allAssignments.map((assignment) => (
              <div key={assignment.assignmentId} className="assignment-card">
                <div className="assignment-title">
                  <strong>Assignment:</strong> {assignment.assignmentTitle}
                </div>
                <div className="assignment-title">
                  <strong>Course Name:</strong> {assignment.courseDetails?.title || "N/A"}
                </div>
                <div className="view-progress-row">
                  <div className="assignment-deadline">
                    <strong>Deadline:</strong> {assignment.submissionDate || "N/A"}
                  </div>
                  <button
                    className="view-progress-btn"
                    onClick={() =>
                      navigate("/assignmentviewprogress", {
                        state: { assignmentId: assignment.assignmentId },
                      })
                    }
                  >
                    View Progress
                  </button>
                </div>
                <hr />
                <div>
                  {assignment.commentDetails &&
                    assignment.commentDetails.map((comment) => (
                      <div key={comment.createdAt} className="comments-line-block">
                        <span className="comment-user-title">
                          {comment.userRole === "EDUCATOR"
                            ? "Educator"
                            : `Student ${comment.userId}`}:
                        </span>
                        <span>{comment.commentValue}</span>
                      </div>
                    ))}
                </div>
                <div className="student-post-comment">
                  <input
                    type="text"
                    placeholder="Add a comment"
                    className="comment-input"
                    value={newCommentValue}
                    onChange={(e) => setNewCommentValue(e.target.value)}
                  />
                  <button
                    className="comment-btn"
                    onClick={() =>
                      addComment(
                        assignment.courseDetails?.id,
                        assignment.assignmentId,
                        user.uid,
                        newCommentValue,
                        "EDUCATOR"
                      )
                    }
                  >
                    Send
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>No assignments found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducatorMyAssignments;