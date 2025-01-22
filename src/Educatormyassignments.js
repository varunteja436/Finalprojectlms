import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  equalTo,
  getDatabase,
  orderByChild,
  query,
  ref,
  get,
  update,
  set,
  push,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import "./Educatormyassignments.css";

const EducatorMyAssignments = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);
  const [newCommentValue, setNewCommentValue] = useState("");

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
        const newCommentObj = {
          userDetails: userDetails,
          commentValue: commentText,
          createdAt: new Date().toISOString(),
        };

        const currentComments = (await get(existingCommentRef)).val()
          .commentConversation;

        await update(existingCommentRef, {
          commentConversation: [...currentComments, newCommentObj],
        });

        console.log("New reply added to the existing comment.");
      } else {
        const newCommentObj = {
          assignmentId: assignmentId,
          courseDetails: courseDetails,
          educatorDetails: courseDetails.educatorDetails,
          assignmentDetails: assignmentDetails,
          commentConversation: [
            {
              userDetails: userDetails,
              commentValue: commentText,
              createdAt: new Date().toISOString(),
              flagged: false,
            },
          ],
        };

        const newCommentRef = push(commentsRef);
        await set(newCommentRef, newCommentObj);

        console.log("New comment added for the assignment.");
      }
      await fetchAssignmentsByEducator(user.uid);
      alert("comment added");
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
      // Fetch all assignments
      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        return [];
      }

      const assignments = assignmentsSnapshot.val();

      // Filter assignments based on educatorUid
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

      // Map assignments to their comments
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

  const flagUserComment = async (assignmentId, studentUid) => {
    const commentsRef = ref(db, "comments");

    try {
      const commentsSnapshot = await get(commentsRef);

      if (!commentsSnapshot.exists()) {
        console.log("No comments found.");
        return;
      }

      const comments = commentsSnapshot.val();

      // Find the specific comments object matching the assignmentId
      const matchingComments = Object.values(comments).find(
        (comment) => comment.assignmentId === assignmentId
      );

      if (!matchingComments) {
        console.log(`No comments found for assignmentId: ${assignmentId}`);
        return;
      }


      const updatedCommentConversation =
        matchingComments.commentConversation?.map((conversation) => {
          if (conversation.userDetails?.uid === studentUid) {
            // Update flagged to true
            return { ...conversation, flagged: true };
          }
          return conversation;
        });


      const updatedComments = {
        ...matchingComments,
        commentConversation: updatedCommentConversation,
      };

      // Save the updated comments object back to the database
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
              <Link to="/">logout</Link>
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
                    <div className="assignment-title">{`Class: ${assignment.courseDetails?.title}`}</div>
                  </div>
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
                      return comments?.commentConversation?.map(
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
                                !conversation?.flagged && (
                                  <span
                                    className="educator-flag"
                                    onClick={() =>
                                      flagUserComment(
                                        assignment.assignmentId,
                                        conversation?.userDetails?.uid
                                      )
                                    }
                                  >
                                    Flag
                                  </span>
                                )}
                              <span
                                className="educator-reply"
                                // onClick={() =>
                                //   // flagUserComment(
                                //   //   assignment.assignmentId,
                                //   //   conversation?.userDetails?.uid
                                //   // )
                                //   educatorReply(assignment.assignmentId,)
                                // }
                              >
                                Reply
                              </span>
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
    // {showCourseEditForm && showCourseDetails && (
    //   <EducatorEditCourse
    //     showCourseDetails={showCourseDetails}
    //     setShowCourseEditForm={setShowCourseEditForm}
    //     setShowCourseDetails={setShowCourseDetails}
    //     fetchAllCourses={fetchAllCourses}
    //   />
    // )}
  );
};

export default EducatorMyAssignments;
