import {
    get,
    getDatabase,
    ref,
    update,
    push,
    set,
    child,
  } from "firebase/database";
  import React, { useEffect, useState } from "react";
  import { Link, useLocation } from "react-router-dom";
  import "./StudentAssignment.css";
  import { getAuth } from "firebase/auth";
  import { db } from "./firebase";
  
  const StudentAssignments = () => {
    const location = useLocation();
    console.log(location);
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);
  
    const [noAssignments, setNoAssignments] = useState(false);
    const [allAssignments, setAllAssignments] = useState([]);
    const [newComment, setNewComment] = useState();
    const [commentsHistory, setCommentsHistory] = useState();
    console.log("commentsHistory", commentsHistory);
  
    useEffect(() => {
      if (location && location?.state) {
        if (location?.state?.assignmentDetails) {
          fetchAssignmentsByCourseId(location?.state?.assignmentDetails);
          fetchComments();
        } else {
          setNoAssignments(true);
        }
      }
    }, [location]);
    const fetchAssignmentsByCourseId = async (courseId) => {
      const database = getDatabase();
      const assignmentsRef = ref(database, "assignments");
  
      try {
        const snapshot = await get(assignmentsRef);
  
        if (snapshot.exists()) {
          const assignments = snapshot.val();
          const filteredAssignments = [];
  
          for (const assignmentId in assignments) {
            const assignment = assignments[assignmentId];
            if (assignment.courseId === courseId) {
              filteredAssignments.push({ assignmentId, ...assignment });
            }
          }
          console.log("filteredAssignments", filteredAssignments);
          setAllAssignments(filteredAssignments); 
        } else {
          console.log("No assignments found.");
          setNoAssignments(true);
        }
      } catch (error) {
        console.error("Error fetching assignments by courseId:", error.message);
        return [];
      }
    };
  
    async function fetchComments(assignmentId) {
      const db = getDatabase();
      const commentsRef = ref(db, "comments");
  
      try {
        const snapshot = await get(commentsRef);
  
        if (snapshot.exists()) {
          let comments = null;
  
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            if (childData["assignmentId"] === assignmentId) {
              comments = childData.commentConversation || [];
            }
          });
  
          if (comments) {
            console.log("Comments retrieved successfully:", comments);
            setCommentsHistory(comments);
          } else {
            console.log("No comments found for the given assignmentId.");
            return [];
          }
        } else {
          console.log("No comments exist in the database.");
          return [];
        }
      } catch (error) {
        console.error("Error retrieving comments:", error);
        return [];
      }
    }
  
    async function handleComments(assignmentId, newComment) {
      const db = getDatabase();
      const commentsRef = ref(db, "comments");
  
      try {

        const snapshot = await get(commentsRef);
  
        if (snapshot.exists()) {
          let existingKey = null;

          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            if (childData["assignmentId"] === assignmentId) {
              existingKey = childSnapshot.key;
            }
          });
  
          if (existingKey) {

            const existingRef = ref(db, `comments/${existingKey}`);
            const existingData = (await get(existingRef)).val();
  
            const updatedComments = existingData.commentConversation
              ? [...existingData.commentConversation, newComment]
              : [newComment];
  
            await update(existingRef, {
              commentConversation: updatedComments,
            });
  
            console.log("Comment updated successfully in the existing object!");
          } else {

            const newKey = push(commentsRef).key;
            await set(ref(db, `comments/${newKey}`), {
              assignmentId: assignmentId,
              commentConversation: [newComment],
            });
  
            console.log(
              "New comment created successfully with auto-generated key!"
            );
          }
        } else {

          const newKey = push(commentsRef).key;
          await set(ref(db, `comments/${newKey}`), {
            assignmentId: assignmentId,
            commentConversation: [newComment],
          });
  
          console.log("First comment created successfully!");
        }
        await fetchComments(assignmentId);
      } catch (error) {
        console.error("Error handling comments:", error);
      } finally {
        setNewComment("");
      }
    }
  
    const GetCommentConversationHtml = () => {
      return (
        <div>
          {commentsHistory?.map((comment, index) => (
            <div>
              <span style={{ paddingRight: 10, fontSize: 14 }}>
                {comment.userRole === "STUDENT"
                  ? `Student${index + 1}: `
                  : "Educator"}
              </span>
              <span style={{ fontSize: 18 }}>{comment?.userComment}</span>
            </div>
          ))}
        </div>
      );
    };
  
    useEffect(() => {
      if (commentsHistory) {
        console.log("inside useEffect", commentsHistory);
        GetCommentConversationHtml();
      }
    }, [commentsHistory]);
  
    const submitAssignment = async (assignmentId, studentId, newValue) => {
      const db = getDatabase();
      const assignmentRef = ref(db, `assignments/${assignmentId}`);
  
      try {
        const snapshot = await get(assignmentRef);
        if (snapshot.exists()) {
          const assignment = snapshot.val();
  

          if (!assignment.studentResponse) {
            assignment.studentResponse = [];
          }
  

          const studentIndex = assignment.studentResponse.findIndex(
            (response) => response.studentId === studentId
          );
  
          if (studentIndex !== -1) {

            assignment.studentResponse[studentIndex].value.push(newValue);
          } else {

            assignment.studentResponse.push({
              studentId,
              value: [newValue],
            });
          }
  

          await update(assignmentRef, {
            studentResponse: assignment.studentResponse,
          });
          console.log("Assignment submitted successfully");
        } else {
          console.log("Assignment not found");
        }
      } catch (error) {
        console.error("Error submitting assignment:", error);
      }
    };
  
    const AssignmentCard = () => {
      return (
        <>
          {allAssignments &&
            allAssignments.map((assignment, index) => {
              return (
                <>
                  <div className="student-assignment-card">

                    <div className="student-assignment-divider">
                      <span className="student-assignment-title-heading">
                        Assignment Title:
                      </span>
                      <span className="student-assignment-value">
                        {assignment.assignmentTitle}
                      </span>
                    </div>
                    <hr className="assignment-divider-student-inline" />
                    <div className="student-assignment-divider">
                      <div className="student-assignment-title-heading">
                        Assignment Description:
                      </div>
                      <div className="student-assignment-value-description">
                        {assignment.assignmentDescription}
                      </div>
                    </div>
                    <hr className="assignment-divider-student-inline" />
                    <div className="student-assignment-divider">
                      <div className="student-assignment-title-heading">
                        Dead line for submission:
                      </div>
                      <div className="student-assignment-value-deadline">
                        {assignment.submissionDate}
                      </div>
                    </div>
  
                    <hr className="assignment-divider-student-inline" />
                    <div className="student-assignment-divider">
                      <div className="student-assignment-title-heading">
                        Assignment Response:
                      </div>
                      <div className="student-assignment-value-deadline">
                        <textarea className="student-assignment-textarea"></textarea>
                        <button
                          className="assignment-submit-btn-style"
                          onClick={() =>
                            submitAssignment(
                              assignment.assignmentId,
                              user.uid,
                              ""
                            )
                          }
                        >
                          Submit
                        </button>
                      </div>
                    </div>
  
                    <hr className="assignment-divider-student-inline" />
                    <div className="student-assignment-title-heading">
                      Comment
                    </div>
  
                    {assignment?.commentDetails &&
                      GetCommentConversationHtml(assignment?.commentDetails)}
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
                        onClick={() =>
                          handleComments(assignment?.assignmentId, {
                            userRole: "STUDENT",
                            userID: user.uid,
                            userComment: newComment,
                            userFlagged: false,
                          })
                        }
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              );
            })}
        </>
      );
    };
  
    const assignmentContainer = <>{<AssignmentCard />}</>;
  
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
                <Link to="/studentcourses">Courses</Link>
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
          <div className="student-courses-header">
            <h3 className="student-courses-title"> Assignment</h3>
  

          </div>
          <div className="assignment-view-wrapper">
            {" "}
            {allAssignments.length === 0 || noAssignments ? (
              <div>No Assignments found</div>
            ) : (
              assignmentContainer
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default StudentAssignments;
  