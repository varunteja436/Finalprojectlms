import React, { useEffect, useState } from "react";
import "./Educatormyassignments.css";
import { Link, useNavigate } from "react-router-dom";
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  push,
  remove,
  child,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

const EducatorMyAssignments = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);
  const [newCommentValue, setNewCommentValue] = useState("");
  console.log("allAssignments", allAssignments);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    user && fetchAssignmentsByEducator(user.uid);
  }, [user]);

  const addComment = async (courseId, assignmentId, userId, commentText) => {
    const db = getDatabase();

    const courseRef = ref(db, `courses/${courseId}`);
    const assignmentRef = ref(db, `assignments/${assignmentId}`);
    const userRef = ref(db, `users/${userId}`);
    const commentsRef = ref(db, "comments");

    try {
      const courseSnapshot = await get(courseRef);
      const assignmentSnapshot = await get(assignmentRef);
      const userSnapshot = await get(userRef);

      if (
        !courseSnapshot.exists() ||
        !assignmentSnapshot.exists() ||
        !userSnapshot.exists()
      ) {
        console.log("Required data (course, assignment, or user) not found.");
        return;
      }

      const courseDetails = courseSnapshot.val();
      const assignmentDetails = assignmentSnapshot.val();
      const userDetails = userSnapshot.val();

      const commentsSnapshot = await get(commentsRef);
      let commentExists = false;
      let existingCommentRef = null;

      if (commentsSnapshot.exists()) {
        commentsSnapshot.forEach((commentSnapshot) => {
          if (commentSnapshot.val().assignmentId === assignmentId) {
            commentExists = true;
            existingCommentRef = commentSnapshot.ref;
          }
        });
      }

      if (commentExists) {
        const newCommentRef = push(
          child(existingCommentRef, "commentConversation")
        );
        const newCommentObj = {
          id: newCommentRef.key, 
          userDetails: userDetails,
          commentValue: commentText,
          createdAt: new Date().toISOString(),
        };

        await update(existingCommentRef, {
          [`commentConversation/${newCommentRef.key}`]: newCommentObj,
        });

        console.log("New reply added to the existing comment.");
      } else {
        const newCommentObj = {
          assignmentId: assignmentId,
          courseDetails: courseDetails,
          educatorDetails: courseDetails.educatorDetails,
          assignmentDetails: assignmentDetails,
          commentConversation: {},
        };

        const newCommentRef = push(commentsRef);
        const commentConversationRef = push(
          child(newCommentRef, "commentConversation")
        );

        const firstComment = {
          id: commentConversationRef.key, 
          userDetails: userDetails,
          commentValue: commentText,
          createdAt: new Date().toISOString(),
          flagged: false,
        };

        await set(newCommentRef, {
          ...newCommentObj,
          commentConversation: {
            [commentConversationRef.key]: firstComment,
          },
        });

        console.log("New comment added for the assignment.");
      }
      await fetchAssignmentsByEducator(user.uid);
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error checking or adding comment:", error);
    } finally {
      setNewCommentValue("");
    }
  };
  const fetchAssignmentsByEducator = async (educatorUid) => {
    const assignmentsRef = ref(db, "assignments");
    const commentsRef = ref(db, "comments");
    console.log("commentsRef", commentsRef);
    try {
      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        setAllAssignments([]);
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
        return [];
      }

      const commentsSnapshot = await get(commentsRef);
      const comments = commentsSnapshot.exists() ? commentsSnapshot.val() : {};

      const assignmentsWithComments = filteredAssignments.map((assignment) => {
        const commentDetails = Object.values(comments).filter(
          (comment) => comment.assignmentId === assignment.assignmentId
        );

        return {
          ...assignment,
          commentDetails: commentDetails ? commentDetails : [], 
        };
      });

      console.log(assignmentsWithComments);
      setAllAssignments(assignmentsWithComments);
    } catch (error) {
      console.error("Error fetching assignments or comments:", error);
      return [];
    }
  };

  const flagUserComment = async (assignmentId, studentUid, flag) => {
    const commentsRef = ref(db, "comments");

    try {
      const commentsSnapshot = await get(commentsRef);

      if (!commentsSnapshot.exists()) {
        console.log("No comments found.");
        return;
      }

      const comments = commentsSnapshot.val();

      const matchingComments = Object.values(comments).find(
        (comment) => comment.assignmentId === assignmentId
      );

      if (!matchingComments) {
        console.log(`No comments found for assignmentId: ${assignmentId}`);
        return;
      }
      console.log("matchingComments", matchingComments);
      const updatedCommentConversation = Object.values(
        matchingComments.commentConversation
      )?.map((conversation) => {
        if (conversation.id === studentUid) {
          return { ...conversation, flagged: flag };
        }
        return conversation;
      });

      const updatedComments = {
        ...matchingComments,
        commentConversation: updatedCommentConversation,
      };

      const matchingCommentsKey = Object.keys(comments).find(
        (key) => comments[key].assignmentId === assignmentId
      );

      if (matchingCommentsKey) {
        const matchingCommentsRef = ref(db, `comments/${matchingCommentsKey}`);
        await set(matchingCommentsRef, updatedComments);
        await fetchAssignmentsByEducator(user.uid);
        alert(`Flag updated for user .`);
      }
    } catch (error) {
      console.error("Error updating flag:", error);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      const db = getDatabase();

      const assignmentRef = ref(db, `assignments/${assignmentId}`);

      await remove(assignmentRef);
      await fetchAssignmentsByEducator(user.uid);
      alert("Assignment successfully deleted.");
    } catch (error) {
      console.error("Error deleting the assignment:", error);
    }
  };

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
      <div className="assignment-main">
        <>
          <h1 className="form-header1">Educator Assignments</h1>
          <div className="assignment-card-container">
            {addNewCourseButton}
            {allAssignments &&
              allAssignments.map((assignment, index) => (
                <div className="assignment-card">
                  <div className="assignment-info">
                    <div className="assignment-title">
                      {assignment.assignmentTitle}
                    </div>
                    <div className="assignment-action-btns">
                      <button
                        className="assignment-edit-btn"
                        onClick={() =>
                          navigate("/editassignment", {
                            state: { assignmentData: assignment },
                          })
                        }
                      >
                        Edit Assignment
                      </button>
                      <button
                        className="assignment-delete-btn"
                        onClick={() =>
                          deleteAssignment(assignment?.assignmentId)
                        }
                      >
                        Delete Assignment
                      </button>
                    </div>
                  </div>
                  <div className="assignment-title">{`Class: ${assignment.courseDetails?.title}`}</div>
                  <div className="view-progress-row">
                    <div className="assignment-deadline">
                      <span className="assignment-deadline-title">
                        Dead line for submission:{" "}
                      </span>
                      <span>{assignment.submissionDate}</span>
                    </div>
                    <button
                      className="view-progress-btn"
                      onClick={() =>
                        navigate("/assignmentviewprogress", {
                          state: { assignmentId: assignment?.assignmentId },
                        })
                      }
                    >
                      View Progress
                    </button>
                  </div>
                  <hr />
                  <div>
                    {assignment?.commentDetails?.map((comments) => {
                      return Object.values(comments?.commentConversation)?.map(
                        (conversation) => {
                          return (
                            <div className="comments-line-block">
                              <span className="comment-user-title">
                                {conversation?.userDetails?.name}:
                              </span>
                              <span className="comment-user-comment-edu">
                                {conversation?.commentValue}
                              </span>
                              {conversation?.userDetails?.role === "STUDENT" &&
                                (!conversation?.flagged ? (
                                  <span
                                    className="educator-flag"
                                    onClick={() =>
                                      flagUserComment(
                                        assignment.assignmentId,
                                        conversation?.id,
                                        true
                                      )
                                    }
                                  >
                                    Flag
                                  </span>
                                ) : (
                                  <span
                                    className="educator-flag"
                                    onClick={() =>
                                      flagUserComment(
                                        assignment.assignmentId,
                                        conversation?.id,
                                        false
                                      )
                                    }
                                  >
                                    un-flag
                                  </span>
                                ))}
                            </div>
                          );
                        }
                      );
                    })}
                  </div>
                  <div className="student-post-comment">
                    <input
                      type="text"
                      placeholder="Add comments"
                      className="comment-input"
                      value={newCommentValue}
                      onChange={(e) => setNewCommentValue(e.target.value)}
                    />
                    <button
                      className="comment-btn"
                      onClick={() =>
                        addComment(
                          assignment?.courseDetails?.id,
                          assignment?.assignmentId,
                          user?.uid,
                          newCommentValue
                        )
                      }
                    >
                      Send
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