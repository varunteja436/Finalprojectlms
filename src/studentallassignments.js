import { getDatabase, ref, get, update, set, push } from "firebase/database";
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
      await fetchAllAssignmentsForStudent(user.uid);
      alert("comment");
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
      >
        <option value="" disabled>
          Select a course
        </option>
        {courseDetails.map((course) => (
          <option value={course.title}>{course.title}</option>
        ))}
      </select>
      {/* <span onClick={() => setSelectedCourseName("")}>clear</span> */}
    </>
  );

  const getGrade = (arr) => {
    const gradeObj = arr?.find((i) => {
      return i?.studentId === user.uid;
    });
    return gradeObj;
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
                        {getGrade(assignment.studentResponse)?.grade !== "" ? (
                          <>
                            <hr className="assignment-divider-student-inline" />
                            <div className="student-assignment-divider">
                              <div className="student-assignment-title-heading">
                                Graded Point:{" "}
                                <span className="student-assignment-value-graded-value">
                                  {getGrade(assignment.studentResponse)?.grade}
                                </span>
                              </div>
                            </div>
                            <hr className="assignment-divider-student-inline" />
                          </>
                        ) : (
                          <>
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
                            {!isSubmissionDateOver(
                              assignment.submissionDate
                            ) && (
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
                            )}
                          </>
                        )}

                        <div className="student-assignment-title-heading">
                          Comment
                        </div>

                        <div>
                          {assignment?.commentDetails?.map((comments) => {
                            return comments?.commentConversation?.map(
                              (conversation) => {
                                return (
                                  <div className="comments-line-block">
                                    <span className="comment-user-title">
                                      {conversation?.userDetails?.name}:
                                    </span>
                                    <span className="comment-user-comment">
                                      {conversation?.commentValue}
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
