import React, { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import "./Adminviewcontent.css";

const AdminViewContent = () => {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlaggedComments();
  }, []);

  const fetchFlaggedComments = async () => {
    setLoading(true);
    const flaggedCommentsRef = ref(db, "flaggedComments");

    try {
      const snapshot = await get(flaggedCommentsRef);
      if (!snapshot.exists()) {
        setFlaggedContent([]);
      } else {
        const flaggedData = Object.values(snapshot.val());
        setFlaggedContent(flaggedData);
      }
    } catch (error) {
      console.error("Error fetching flagged content:", error);
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
            <li>
              <Link to="/adminstudentslist">Student List</Link>
            </li>
            <li>
              <Link to="/educatorlist">Educator List</Link>
            </li>
            <li>
              <Link to="/adminviewcontent">View Content</Link>
            </li>
            <li>
              <Link to="/adminprofile">View Profile</Link>
            </li>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </aside>
      </div>
      <div className="admin-view-content-main">
        <header>
          <h1>Flagged Comments</h1>
        </header>
        <div>
          {loading ? (
            <p>Loading flagged comments...</p>
          ) : flaggedContent.length === 0 ? (
            <p>No flagged comments found.</p>
          ) : (
            flaggedContent.map((item, index) => (
              <div key={index} className="flagged-comment-card">
                <h4>Assignment: {item.assignmentId}</h4>
                <p>Flagged By: {item.flaggedBy}</p>
                <p>Flagged Comment: {item.comment.commentValue}</p>
                <p>Flagged At: {new Date(item.flaggedAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewContent;