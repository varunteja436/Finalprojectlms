import React from "react";
import { ref, update } from "firebase/database";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./EducatorEditCourse.css"; 

const EducatorEditCourse = ({
  showCourseDetails = { title: '', schedule: '', description: '', startDate: '', endDate: '' }, 
  setShowCourseDetails,
  setShowCourseEditForm,
  fetchAllCourses,
}) => {
  if (!showCourseDetails) {
    return <div>Loading...</div>; 
  }

  const handleInputChange = (e) => {
    setShowCourseDetails({
      ...showCourseDetails,
      [e.target.name]: e.target.value,
    });
  };

  const editCourse = async () => {
    try {
      const courseRef = ref(db, `courses/${showCourseDetails.id}`);
      await update(courseRef, showCourseDetails);

      console.log("Course updated successfully!");
      setShowCourseDetails({});
      setShowCourseEditForm(false);
      await fetchAllCourses();
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Error updating course: ", error.message);
      alert("Error updating course: " + error.message);
    }
  };

  return (
    <main className="form-container">
        <div className="form-header">Edit Course</div>

        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              name="title"
              placeholder="Course Name"
              value={showCourseDetails.title || ''} 
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          
          <div className="input-wrapper">
            <input
              type="text"
              name="schedule"
              placeholder="Course Schedule"
              value={showCourseDetails.schedule || ''} 
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="startDate" className="input-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={showCourseDetails.startDate || ''} 
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="endDate" className="input-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={showCourseDetails.endDate || ''}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="textarea-group">
          <textarea
            name="description"
            value={showCourseDetails.description || ''} 
            onChange={handleInputChange}
            className="textarea-field"
          ></textarea>
        </div>

        <button onClick={editCourse} className="submit-button">
          Edit Course
        </button>
      </main>
  );
};

export default EducatorEditCourse;
