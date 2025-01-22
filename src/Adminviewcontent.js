import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import  { Link } from "react-router-dom";
import "./Adminviewcontent.css";

const AdminViewContent = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignmentsWithComments();
  }, []);

  const fetchAssignmentsWithComments = async () => {
    setLoading(true);
    const assignmentsRef = ref(db, "assignments");
    const commentsRef = ref(db, "comments");

    try {
      const assignmentsSnapshot = await get(assignmentsRef);
      const commentsSnapshot = await get(commentsRef);

      if (!assignmentsSnapshot.exists()) {
        setAssignments([]);
        setFilteredContent([]);
        setLoading(false);
        return;
      }

      const assignmentsData = assignmentsSnapshot.val();
      const commentsData = commentsSnapshot.exists() ? commentsSnapshot.val() : {};

      const assignmentsWithComments = Object.keys(assignmentsData).map((id) => {
        const assignment = assignmentsData[id];
        const relatedComments = Object.keys(commentsData)
          .filter((commentId) => commentsData[commentId].assignmentId === id)
          .map((commentId) => commentsData[commentId]);

        return { ...assignment, comments: relatedComments, assignmentId: id };
      });

      const flaggedContent = assignmentsWithComments.filter((assignment) =>
        assignment.comments.some((comment) =>
          comment.commentConversation.some((c) => c.flagged)
        )
      );

      setAssignments(assignmentsWithComments);
      setFilteredContent(flaggedContent);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
          <h3 className="admin-view-content-title">Flagged Content</h3>
        </div>
        <div className="admin-view-content-wrapper">
          {loading ? (
            <div>Loading...</div>
          ) : filteredContent.length === 0 ? (
            <div>No flagged content found</div>
          ) : (
            filteredContent.map((assignment) => (
              <div key={assignment.assignmentId}>
                <h4>{assignment.assignmentTitle}</h4>
                <p>{assignment.courseDetails?.title}</p>
                <p>{assignment.submissionDate}</p>
                {assignment.comments.map((comment) =>
                  comment.commentConversation.map((c) => (
                    <p key={c.id}>
                      {c.userDetails?.name}: {c.commentValue}{" "}
                      {c.flagged && <span>(Flagged)</span>}
                    </p>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewContent;