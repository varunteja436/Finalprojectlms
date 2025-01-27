import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Adminviewcontent.css";
import { ref, get, update, getDatabase } from "firebase/database";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

const AdminViewContent = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [allAssignmentsAndComments, setAllAssignmentsAndComments] = useState(
    []
  );

  const [filteredFlaggedContent, setFilteredFlaggedContent] = useState([]);

  const [fetchingDetails, setFetchingDetails] = useState(null);

  useEffect(() => {
    fetchAssignmentsWithComments();
  }, []);

  const fetchAssignmentsWithComments = async () => {
    setFetchingDetails(true);
    const assignmentsRef = ref(db, "assignments");
    const commentsRef = ref(db, "comments");

    try {
      const assignmentsSnapshot = await get(assignmentsRef);
      if (!assignmentsSnapshot.exists()) {
        console.log("No assignments found");
        return [];
      }

      const assignments = assignmentsSnapshot.val();

      const commentsSnapshot = await get(commentsRef);
      const comments = commentsSnapshot.exists() ? commentsSnapshot.val() : {};

      const updatedAssignments = Object.keys(assignments).map(
        (assignmentId) => {
          const assignment = assignments[assignmentId];

          const assignmentComments = Object.keys(comments)
            .filter(
              (commentId) => comments[commentId].assignmentId === assignmentId
            )
            .map((commentId) => comments[commentId]);

          return {
            ...assignment,
            assignmentId,
            comments: assignmentComments.length > 0 ? assignmentComments : [],
          };
        }
      );

      setAllAssignmentsAndComments(updatedAssignments);
      setFilteredFlaggedContent(
        updatedAssignments

      );
      // );
    } catch (error) {
      console.error("Error fetching assignments and comments:", error);
      return [];
    } finally {
      setFetchingDetails(false);
    }
  };

  const deactivateUserById = async (userId) => {
    const userRef = ref(db, `users/${userId}`);

    try {
      await update(userRef, { isActive: false });

      await fetchAssignmentsWithComments();

      alert("User deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
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

            await fetchAssignmentsWithComments();
            alert(`Comment with has been deleted.`);
          }
        }

        console.log(`Comment with ID ${commentId} not found.`);
      } else {
        console.log("No comments found in the database.");
      }
    } catch (error) {
      console.error("Error deleting the comment:", error);
    }
  };

  console.log("filteredFlaggedContent", filteredFlaggedContent);

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
            await fetchAssignmentsWithComments();
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

  const CommentConversation = ({ comment }) => {
    const [editComment, setEditComment] = useState(false);

    const [editCommentValue, setEditCommentValue] = useState(
      comment?.commentValue
    );

    return (
      <div className="admin-view-content-comment-row">
        {editComment ? (
          <>
            <div className="admin-view-content-comment-user-title">
              {comment?.userDetails?.name}:
            </div>
            <div className="comment-user-comment">
              <input
                className="admin-view-content-comment-edit-input"
                value={editCommentValue}
                onChange={(e) => setEditCommentValue(e.target.value)}
              />
              <button
                className="admin-view-content-comment-edit-btn"
                onClick={() => {
                  saveEditedComment(comment?.id, editCommentValue, () =>
                    setEditComment(false)
                  );
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : comment?.flagged ? (
          <div className="admin-view-content-comment-details-section admin-view-content-comment-details-section-flagged">
            <span className="admin-view-content-comment-details-section-user-name">
              {comment?.userDetails?.name}
            </span>

            <span className="admin-view-content-comment-details-section-comment-value">
              {" "}
              - {comment?.commentValue}
            </span>
          </div>
        ) : (
          <div className="admin-view-content-comment-details-section">
            <span className="admin-view-content-comment-details-section-user-name">
              {comment?.userDetails?.name}
            </span>

            <span className="admin-view-content-comment-details-section-comment-value">
              {" "}
              - {comment?.commentValue}
            </span>
          </div>
        )}

        {comment?.userDetails?.role === "STUDENT" && (
          <>
            {comment?.flagged && (
              <>
                <div className="admin-view-content-flag-action">flagged</div>

                <div
                  className="admin-view-content-actions"
                  onClick={() => deactivateUserById(comment?.userDetails?.uid)}
                >
                  Suspend Account
                </div>
              </>
            )}
          </>
        )}

        {!editComment && (
          <div
            className="admin-view-content-actions"
            onClick={() => deleteComment(comment?.id)}
          >
            Delete comment
          </div>
        )}
        <div
          className="admin-view-content-actions"
          onClick={() => setEditComment(!editComment)}
        >
          {editComment ? "Cancel" : "Edit"}
        </div>
      </div>
    );
  };
  return (
    <div className="admin-view-content-container">
      <div className="admin-view-content-sidebar">
        <aside>
          <ul>
            <li>
              <Link to="/dashboard">Home</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/adminstudentslist">Student List</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/educatorlist">Educator List</Link>
            </li>
          </ul>

          <ul>
            <li>
              <Link to="/adminviewcontent"> View Content</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/adminprofile"> View Profile</Link>
            </li>
          </ul>
          <ul>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="admin-view-content-main">
        <div className="admin-view-content-header">
          <h3 className="admin-view-content-title"> Flagged content</h3>
        </div>
        <div className="admin-view-content-wrapper">
          {fetchingDetails ? (
            <div>Fetching Details...</div>
          ) : fetchingDetails !== null &&
            fetchingDetails === false &&
            filteredFlaggedContent?.length === 0 ? (
            <div>No Flagged Content found</div>
          ) : (
            <div>
              {filteredFlaggedContent &&
                filteredFlaggedContent?.map((item) => (
                  <div className="admin-view-content-card">
                    <div className="admin-view-content-titles">
                      <div className="admin-view-content-assignment-title">
                        <span className="admin-view-content-assignment-span-title">
                          Assignment Name -{" "}
                        </span>
                        <span className="admin-view-content-assignment-span-value">
                          {item?.assignmentTitle}
                        </span>
                      </div>
                    </div>
                    <hr className="admin-view-content-divider" />
                    <div className="admin-view-content-titles">
                      <div className="admin-view-content-class-title">
                        <span className="admin-view-content-assignment-span-title">
                          Class -{" "}
                        </span>
                        <span className="admin-view-content-assignment-span-value">
                          {item?.courseDetails?.title}
                        </span>
                      </div>
                    </div>

                    <hr className="admin-view-content-divider" />
                    <div className="admin-view-content-titles">
                      <div className="admin-view-content-assignment-title">
                        <span className="admin-view-content-assignment-span-title">
                          Submitted on -{" "}
                        </span>
                        <span className="admin-view-content-assignment-span-value">
                          {item?.submissionDate}
                        </span>
                      </div>
                      <div className="admin-view-content-class-title">
                        {/* progress bar */}
                        {/* <span className="admin-view-content-assignment-span-title">
                          Class -{" "}
                        </span>
                        <span className="admin-view-content-assignment-span-value">
                          {item?.courseDetails?.title}
                        </span> */}
                      </div>
                    </div>

                    <hr className="admin-view-content-divider" />
                    <div className="admin-view-content-titles">
                      <div className="admin-view-content-assignment-title">
                        <span className="admin-view-content-assignment-span-title">
                          Deadline for submission -{" "}
                        </span>
                        <span className="admin-view-content-assignment-span-value">
                          {item?.submissionDate}
                        </span>
                      </div>
                      <div className="admin-view-content-class-title">
                      </div>
                    </div>

                    <hr className="admin-view-content-divider" />
                    {item?.comments.length !== 0 &&
                      item?.comments?.map((i) => {
                        return (
                          i?.commentConversation &&
                          Object.values(i?.commentConversation)?.map(
                            (comment) => (
                              <>
                                <CommentConversation comment={comment} />
                              </>
                            )
                          )
                        );
                      })}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewContent;
