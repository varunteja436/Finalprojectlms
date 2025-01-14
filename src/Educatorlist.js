import React from "react";
import { useNavigate } from "react-router-dom";

const EducatorList = () => {
  const navigate = useNavigate();

  return (
    <div className="educator-list-container">
        <div className="header-container">
          <p className="header-text">Admin Educator List</p>
          <button
            className="create-educator-button"
            onClick={() => navigate("/create-educator")}
          >
            Create Educator
          </button>
        </div>
      </div>
  );
};

export default EducatorList;
