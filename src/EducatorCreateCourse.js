import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { push, ref, set, get, getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import "./EducatorCreateCourse.css";

const EducatorCreateCourse = () => {
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails({ ...courseDetails, [name]: value });
  };

  const addCourse = async () => {
    const { title, startDate, endDate, description } = courseDetails;

    if (!title || !startDate || !endDate || !description) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const db = getDatabase();
      const auth = getAuth();

      const user = auth.currentUser;
      const userRef = ref(db, `users/${user?.uid}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        alert("Educator details not found.");
        return;
      }

      const educatorDetails = userSnapshot.val();
      const coursesRef = ref(db, "courses");
      const newCourseRef = push(coursesRef);
      await set(newCourseRef, {
        id: newCourseRef.key,
        title,
        startDate,
        endDate,
        description,
        educatorDetails,
        createdAt: new Date().toISOString(),
      });

      alert("Course added successfully!");


      setCourseDetails({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      navigate("/educatorCourseList");
    } catch (error) {
      console.error("Error adding course: ", error.message);
      alert("Error adding course: " + error.message);
    }
  };

  return (
    <div className="form-container">
      <main className="form-main">
        <div className="form-header">Add Course</div>
        <div className="form-content">
          <div className="input-group">
            <input
              type="text"
              name="title"
              placeholder="Course Name"
              value={courseDetails.title}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              name="schedule"
              placeholder="Course Schedule"
              value={courseDetails.schedule || ''}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="startDate" className="input-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={courseDetails.startDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="endDate" className="input-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={courseDetails.endDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="textarea-group">
            <textarea
              name="description"
              id="description"
              value={courseDetails.description}
              onChange={handleInputChange}
              className="textarea-field"
            ></textarea>
          </div>

          <div className="button-container">
            <button className="cancel-button" onClick={() => navigate("/educatorCourseList")}>Cancel</button>
            <button onClick={addCourse} className="submit-button">
              Add Course
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorCreateCourse;
