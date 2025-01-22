import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, get, update, push,set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./Educatormyassignments.css";

const EducatorMyAssignments = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    user && fetchAssignmentsByEducator(user.uid);
  }, [user]);

  const fetchAssignmentsByEducator = async (educatorUid) => {
    const assignmentsRef = ref(db, "assignments");
    const commentsRef = ref(db, "comments");

    try {
      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) return;

      const assignments = assignmentsSnapshot.val();

      const filteredAssignments = Object.keys(assignments)
        .filter((id) => assignments[id].educatorUid === educatorUid)
        .map((id) => ({
          assignmentId: id,
          ...assignments[id],
        }));

      const commentsSnapshot = await get(commentsRef);
      const comments = commentsSnapshot.exists() ? commentsSnapshot.val() : {};

      const assignmentsWithComments = filteredAssignments.map((assignment) => {
        const commentDetails = Object.values(comments).find(
          (comment) => comment.assignmentId === assignment.assignmentId
        );
        return {
          ...assignment,
          commentDetails: commentDetails?.commentConversation || [],
        };
      });

      setAllAssignments(assignmentsWithComments);
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async (assignmentId, commentText) => {
    if (!commentText.trim()) return alert("Please enter a valid comment.");

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

        if (existingKey) {
          const existingRef = ref(db, `comments/${existingKey}`);
          const existingData = (await get(existingRef)).val();

          await update(existingRef, {
            commentConversation: [
              ...existingData.commentConversation,
              {
                userRole: "EDUCATOR",
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
                userRole: "EDUCATOR",
                userID: user.uid,
                userComment: commentText,
                createdAt: Date.now(),
              },
            ],
          });
        }
      } else {
        const newKey = push(commentsRef).key;
        await set(ref(db, `comments/${newKey}`), {
          assignmentId,
          commentConversation: [
            {
              userRole: "EDUCATOR",
              userID: user.uid,
              userComment: commentText,
              createdAt: Date.now(),
            },
          ],
        });
      }

      await fetchAssignmentsByEducator(user.uid);
      setNewComment("");
      alert("Comment added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const flagComment = async (assignmentId, commentIndex) => {
    const commentsRef = ref(db, "comments");
    const flaggedCommentsRef = ref(db, "flaggedComments");

    try {
      const snapshot = await get(commentsRef);
      if (!snapshot.exists()) return;

      let existingKey = null;
      let commentConversation = [];

      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().assignmentId === assignmentId) {
          existingKey = childSnapshot.key;
          commentConversation = childSnapshot.val().commentConversation || [];
        }
      });

      if (existingKey) {
        const flaggedComment = { ...commentConversation[commentIndex], flagged: true };


        commentConversation[commentIndex] = flaggedComment;
        const existingRef = ref(db, `comments/${existingKey}`);
        await update(existingRef, { commentConversation });


        await push(flaggedCommentsRef, {
          assignmentId,
          comment: flaggedComment,
          flaggedAt: Date.now(),
          flaggedBy: user.email,
        });

        alert("Comment flagged successfully!");
        await fetchAssignmentsByEducator(user.uid);
      }
    } catch (error) {
      console.error("Error flagging the comment:", error);
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
        <header>
          <h1>Educator Assignments</h1>
        </header>
        <div className="assignment-card-container">
          <button onClick={() => navigate("/educatorcreateassignment")}>Add New Assignment</button>
          {allAssignments.map((assignment) => (
            <div className="assignment-card" key={assignment.assignmentId}>
              <div className="assignment-info">
                <div className="assignment-title">{assignment.assignmentTitle || "No Title"}</div>
                <div>{`Class: ${assignment.courseDetails?.title || "N/A"}`}</div>
              </div>
              <div>{assignment.assignmentDescription || "No Description"}</div>
              <div>{`Submission Date: ${assignment.submissionDate || "N/A"}`}</div>
              <div>
                <strong>Submitted Assignments:</strong>
                <ul>
                  {assignment.studentResponse?.map((response, index) => (
                    <li key={index}>
                      Student ID: {response.studentId}, Response:{" "}
                      {response.value.join(", ")}
                    </li>
                  )) || "No submissions yet."}
                </ul>
              </div>
              <div>
                <strong>Comments:</strong>
                <ul>
                  {assignment.commentDetails.map((comment, index) => (
                    <li key={index}>
                      {comment.userRole === "STUDENT" ? `Student${index + 1}:` : "Educator"}{" "}
                      {comment.userComment}
                      {comment.userRole === "STUDENT" && (
                        <button
                          className="flag-btn"
                          onClick={() => flagComment(assignment.assignmentId, index)}
                        >
                          Flag
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="student-post-comment">
                <input
                  type="text"
                  value={newComment}
                  placeholder="Add a comment"
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={() => addComment(assignment.assignmentId, newComment)}
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducatorMyAssignments;