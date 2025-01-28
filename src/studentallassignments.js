import {getDatabase,ref,get,update,set,push,child,} from "firebase/database";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import "./studentallassignments.css";

const StudentAllAssignments = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [allAssignments, setAllAssignments] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [fetchAssignment, setFetchAssignments] = useState(null);
  const [assignmentSubmissionValue, setAssignmentSubmissionValue] =
    useState("");

  const [newCommentValue, setNewCommentValue] = useState("");

  useEffect(() => {
    if (user.uid) {
      fetchAllAssignmentsForStudent(user.uid);
    }
  }, [user]);

  const fetchCommentsByAssignmentId = async (assignmentId) => {
    const db = getDatabase();
    const commentsRef = ref(db, "comments"); 

    try {
      const commentsSnapshot = await get(commentsRef);

      if (!commentsSnapshot.exists()) {
        console.log("No comments found.");
        return [];
      }

      let commentsForAssignment = [];

      commentsSnapshot.forEach((commentSnapshot) => {
        const commentData = commentSnapshot.val();

        if (commentData.assignmentId === assignmentId) {
          commentsForAssignment.push(commentData);
        }
      });

      if (commentsForAssignment.length === 0) {
        console.log("No comments found for this assignment.");
      }

      return commentsForAssignment;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const fetchAllAssignmentsForStudent = async (studentUid) => {
    const coursesRef = ref(db, "courses");
    const assignmentsRef = ref(db, "assignments");

    try {
      setFetchAssignments(true);
      const coursesSnapshot = await get(coursesRef);
      if (!coursesSnapshot.exists()) {
        console.log("No courses found");
        return [];
      }

      const courses = coursesSnapshot.val();

      const filteredCourses = Object.keys(courses)
        .filter((courseId) => {
          const course = courses[courseId];
          return course.enrolledStudents?.includes(studentUid);
        })
        .map((courseId) => {
          const course = courses[courseId];
          return { ...course, id: courseId };
        });

      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        return filteredCourses;
      }

      const assignments = assignmentsSnapshot.val();

      const updatedCourses = filteredCourses.map((course) => {
        const assignmentDetails = Object.keys(assignments)
          .filter(
            (assignmentId) => assignments[assignmentId].courseId === course.id
          )
          .map((assignmentId) => ({
            id: assignmentId,
            ...assignments[assignmentId],
          }));

        return { ...course, assignmentDetails };
      });

      const updatedCoursesWithComments = await Promise.all(
        updatedCourses
          .filter((course) => course.assignmentDetails.length !== 0)
          .map(async (course) => {
            const assignmentDetailsWithComments = await Promise.all(
              course.assignmentDetails.map(async (assignment) => {
                const commentDetails = await fetchCommentsByAssignmentId(
                  assignment?.id
                );
                return {
                  ...assignment,
                  commentDetails: commentDetails || [],
                };
              })
            );

            return {
              ...course,
              assignmentDetails: assignmentDetailsWithComments,
            };
          })
      );
      console.log("updatedCoursesWithComments", updatedCoursesWithComments);
      setAllAssignments(updatedCoursesWithComments);
      setCourseDetails(
        updatedCourses.filter((i) => {
          return i.assignmentDetails.length !== 0;
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      setFetchAssignments(false);
    }
  };

  console.log("allAssignments", allAssignments);

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
          assignment.studentResponse[studentIndex].value.push({
            newValue,
            submittedDate: new Date().toISOString(),
          });
        } else {
          assignment.studentResponse.push({
            studentId,
            value: [{ newValue, submittedDate: new Date().toISOString() }],
          });
        }

        await update(assignmentRef, {
          studentResponse: assignment.studentResponse,
        });
        alert("Assignment submitted successfully");
      } else {
        console.log("Assignment not found");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setAssignmentSubmissionValue("");
    }
  };

  const textAreaChnage = (e) => {
    setAssignmentSubmissionValue(e.target.value);
  };

  function isSubmissionDateOver(submissionDate) {
    const currentDate = new Date();
    const submission = new Date(submissionDate);

    return submission < currentDate;
  }

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
      await fetchAllAssignmentsForStudent(user.uid);
      alert("Comment added successfully!");
    } catch (error) {
      console.error("Error checking or adding comment:", error);
    } finally {
      setNewCommentValue("");
    }
  };

  const handleCourseChange = (event) => {
    const selectedCourseTitle = event.target.value;
    console.log("Selected course:", selectedCourseTitle);
    setSelectedCourseName(selectedCourseTitle);
  };

  const courseDropdown = (
    <>
      <select
        className="select-course-assignment"
        onChange={handleCourseChange}
        defaultValue=""
        value={selectedCourseName}
      >
        <option value="" disabled>
          Select a course
        </option>
        {courseDetails.map((course) => (
          <option value={course.title}>{course.title}</option>
        ))}
      </select>
    </>
  );

  const getGrade = (arr) => {
    const gradeObj = arr?.find((i) => {
      return i?.studentId === user.uid;
    });
    console.log("gradeObj", gradeObj);
    return gradeObj;
  };

  const deleteComment = async (commentId) => {
    try {
      const db = getDatabase();
      const commentsRef = ref(db, "comments");

      const snapshot = await get(commentsRef);

      if (snapshot.exists()) {
        const comments = snapshot.val();

        for (const [key, commentData] of Object.entries(comments)) {
          const commentConversationArray = Object.values(
            commentData.commentConversation || {}
          );

          const commentIndex = commentConversationArray.findIndex(
            (comment) => comment.id === commentId
          );

          if (commentIndex !== -1) {
            const updatedCommentConversation = commentConversationArray.filter(
              (comment) => comment.id !== commentId
            );

            const updatedCommentConversationObject =
              updatedCommentConversation.reduce((acc, item, index) => {
                acc[index] = item;
                return acc;
              }, {});

            await update(ref(db, `comments/${key}`), {
              commentConversation: updatedCommentConversationObject,
            });

            await fetchAllAssignmentsForStudent(user.uid);
            alert(`Comment  has been deleted.`);
          }
        }

        console.log(`Comment  not found.`);
      } else {
        console.log("No comments found in the database.");
      }
    } catch (error) {
      console.error("Error deleting the comment:", error);
    }
  };

  const saveEditedComment = async (commentId, editedValue, clearEditFn) => {
    try {
      const db = getDatabase();
      const commentsRef = ref(db, "comments");

      const snapshot = await get(commentsRef);

      if (snapshot.exists()) {
        const comments = snapshot.val();

        for (const [key, commentData] of Object.entries(comments)) {
          const commentConversationArray = Object.values(
            commentData.commentConversation || {}
          );

          const commentIndex = commentConversationArray.findIndex(
            (comment) => comment.id === commentId
          );

          if (commentIndex !== -1) {
            commentConversationArray[commentIndex].commentValue = editedValue;

            const updatedCommentConversationObject =
              commentConversationArray.reduce((acc, item, index) => {
                acc[index] = item;
                return acc;
              }, {});

            await update(ref(db, `comments/${key}`), {
              commentConversation: updatedCommentConversationObject,
            });
            await fetchAllAssignmentsForStudent(user.uid);
            alert(`Comment has been edited successfully.`);
          }
        }

        console.log(`Comment  not found.`);
      } else {
        console.log("No comments found in the database.");
      }
    } catch (error) {
      console.error("Error editing the comment:", error);
    } finally {
      clearEditFn();
    }
  };

  

  const CommentConversation = ({ conversation }) => {
    const [editComment, setEditComment] = useState(false);

    const [editCommentValue, setEditCommentValue] = useState(
      conversation?.commentValue
    );
    return (
      <>
        {editComment ? (
          <>
            <div className="comment-user-title">
              {conversation?.userDetails?.name}:
            </div>
            <div className="comment-user-comment">
              <input
                className="edit-comment-input"
                value={editCommentValue}
                onChange={(e) => setEditCommentValue(e.target.value)}
              />
              <button
                className="edit-comment-btn"
                onClick={() => {
                  saveEditedComment(conversation?.id, editCommentValue, () =>
                    setEditComment(false)
                  );
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="comment-user-title">
              {conversation?.userDetails?.name}:
            </div>
            <div className="comment-user-comment">
              {conversation?.commentValue}
            </div>
          </>
        )}

        {user.uid === conversation?.userDetails?.uid && (
          <>
            <div
              className="student-view-actions"
              onClick={() => setEditComment(!editComment)}
            >
              Edit
            </div>
            <div
              className="student-view-actions"
              onClick={() => deleteComment(conversation?.id)}
            >
              Delete
            </div>
          </>
        )}
      </>
    );
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
              <Link to="/studentallassignments">My Assignments</Link>
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
          <h3 className="student-courses-title"> My Assignments</h3>

        </div>
        <div className="assignment-view-wrapper">
          {fetchAssignment === true ? (
            <div>Fetching Assignments...</div>
          ) : fetchAssignment !== null &&
            fetchAssignment === false &&
            allAssignments.length === 0 ? (
            <div>No Assigments found</div>
          ) : (
            <>
              {courseDropdown}
              {allAssignments &&
                allAssignments
                  .filter((i) => {
                    return selectedCourseName === ""
                      ? i
                      : i.title === selectedCourseName;
                  })
                  .map((course) =>
                    course.assignmentDetails.map((assignment) => (
                      <div className="student-assignment-card">

                        <div className="student-assignment-divider">
                          <span className="student-assignment-title-heading">
                            Course Name:
                          </span>
                          <span className="student-assignment-value">
                            {course.title}
                          </span>
                        </div>
                        <hr className="assignment-divider-student-inline" />
                        <div className="student-assignment-educator-name">
                          <div className="student-assignment-divider">
                            <span className="student-assignment-title-heading">
                              Assignment Title:
                            </span>
                            <span className="student-assignment-value">
                              {assignment.assignmentTitle}
                            </span>
                          </div>
                          <div className="student-assignment-divider">
                            <span className="student-assignment-title-heading">
                              Educator:
                            </span>
                            <span className="student-assignment-value">
                              {course.educatorDetails.name}
                            </span>
                          </div>
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

                        {!isSubmissionDateOver(assignment.submissionDate) &&
                        !getGrade(assignment.studentResponse)?.grade ? (
                          <>
                            <div className="student-assignment-divider">
                              <div className="student-assignment-title-heading">
                                Assignment Response:
                              </div>
                              <div className="student-assignment-value-deadline">
                                <textarea
                                  className="student-assignment-textarea"
                                  value={assignmentSubmissionValue}
                                  onChange={textAreaChnage}
                                ></textarea>
                                <button
                                  className="assignment-submit-btn-style"
                                  onClick={() =>
                                    submitAssignment(
                                      assignment.id,
                                      user.uid,
                                      assignmentSubmissionValue
                                    )
                                  }
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                            <hr className="assignment-divider-student-inline" />
                          </>
                        ) : isSubmissionDateOver(assignment.submissionDate) &&
                          !getGrade(assignment.studentResponse)?.grade ? (
                          <>
                            <hr className="assignment-divider-student-inline" />
                            <div className="student-assignment-divider">
                              <div className="student-assignment-title-heading">
                                Graded Point:{" "}
                                <span className="student-assignment-value-graded-value">
                                  {"Failed"}
                                </span>
                              </div>
                            </div>
                            <hr className="assignment-divider-student-inline" />
                          </>
                        ) : (
                          getGrade(assignment.studentResponse)?.grade && (
                            <>
                              <hr className="assignment-divider-student-inline" />
                              <div className="student-assignment-divider">
                                <div className="student-assignment-title-heading">
                                  Graded Point:{" "}
                                  <span className="student-assignment-value-graded-value">
                                    {
                                      getGrade(assignment.studentResponse)
                                        ?.grade
                                    }
                                  </span>
                                </div>
                              </div>
                              <hr className="assignment-divider-student-inline" />
                            </>
                          )
                        )}

                        <div className="student-assignment-title-heading">
                          Comment
                        </div>
                        <div>
                          {assignment?.commentDetails?.map((comments) => {
                            return (
                              comments?.commentConversation &&
                              Object.values(comments?.commentConversation)?.map(
                                (conversation) => {
                                  return (
                                    <div className="comments-line-block">
                                      <CommentConversation
                                        conversation={conversation}
                                      />
                                    </div>
                                  );
                                }
                              )
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
                                course?.id,
                                assignment?.id,
                                user?.uid,
                                newCommentValue
                              )
                            }
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ))
                  )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAllAssignments;
