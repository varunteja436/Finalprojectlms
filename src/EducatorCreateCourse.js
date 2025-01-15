import React, { useState } from "react";
import { Link } from "react-router-dom";
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

      // Reset form
      setCourseDetails({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      navigate("/course-list-educator");
    } catch (error) {
      console.error("Error adding course: ", error.message);
      alert("Error adding course: " + error.message);
    }
  };

  return (
    <div className="educator-create-course-menu">
      <aside>
        <ul>
          <li><Link to="/educatorprofile">Profile</Link></li>
        </ul>
        <ul>
          <li><Link to="/educatorCreateCourse">Create Course</Link></li>
        </ul>
        <ul>
          <li><Link to="/educatorEditCourse">Manage Courses</Link></li>
        </ul>
      </aside>

      <main className="container">
        <div className="heading">Add Course</div>
        <div className="form-container">
          <div className="input-group">
            <input
              type="text"
              name="title"
              placeholder="Course Name"
              value={courseDetails.title}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          <div className="schedule-input">
            <div className="input-wrapper">
              <label htmlFor="startDate" className="input-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={courseDetails.startDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="endDate" className="input-label">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={courseDetails.endDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <div className="textarea-group">
            <label htmlFor="description" className="textarea-label">Description</label>
            <textarea
              name="description"
              id="description"
              value={courseDetails.description}
              onChange={handleInputChange}
              className="textarea"
            ></textarea>
          </div>

          <div className="button-container">
            <button onClick={addCourse} className="button">
              Add Course
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorCreateCourse;
