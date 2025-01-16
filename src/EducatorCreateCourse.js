import React, { useState, useEffect } from "react";
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
    weeklySchedules: [], 
    selectedWeek: 1, 
  });


  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; 
    setCourseDetails((prevDetails) => ({
      ...prevDetails,
      startDate: today,
    }));
  }, []);

  useEffect(() => {
    if (courseDetails.startDate && courseDetails.endDate) {
      const start = new Date(courseDetails.startDate);
      const end = new Date(courseDetails.endDate);
      const weeks = [];

      let currentWeekStart = new Date(start);
      while (currentWeekStart <= end) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6); 

        if (currentWeekEnd > end) {
          currentWeekEnd.setDate(end.getDate()); 
        }

        weeks.push({
          startDate: currentWeekStart.toISOString().split("T")[0],
          endDate: currentWeekEnd.toISOString().split("T")[0],
          schedule: [], 
        });

        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      setCourseDetails((prevDetails) => ({
        ...prevDetails,
        weeklySchedules: weeks,
      }));
    }
  }, [courseDetails.startDate, courseDetails.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails({ ...courseDetails, [name]: value });
  };

  const handleScheduleChange = (e, day, week) => {
    const { name, value } = e.target;
    setCourseDetails((prevDetails) => {
      const updatedWeeklySchedules = prevDetails.weeklySchedules.map((weekSchedule, idx) => {
        if (idx === week - 1) {
          const updatedSchedule = weekSchedule.schedule.map((item) =>
            item.day === day ? { ...item, [name]: value } : item
          );
          return { ...weekSchedule, schedule: updatedSchedule };
        }
        return weekSchedule;
      });
      return { ...prevDetails, weeklySchedules: updatedWeeklySchedules };
    });
  };

  const handleDaySelection = (e, day, week) => {
    const isChecked = e.target.checked;

    setCourseDetails((prevDetails) => {
      const updatedWeeklySchedules = prevDetails.weeklySchedules.map((weekSchedule, idx) => {
        if (idx === week - 1) {
          if (isChecked) {
            return {
              ...weekSchedule,
              schedule: [...weekSchedule.schedule, { day, startTime: "", endTime: "" }],
            };
          } else {
            return {
              ...weekSchedule,
              schedule: weekSchedule.schedule.filter((item) => item.day !== day),
            };
          }
        }
        return weekSchedule;
      });
      return { ...prevDetails, weeklySchedules: updatedWeeklySchedules };
    });
  };

  const handleWeekChange = (e) => {
    const selectedWeek = parseInt(e.target.value);
    setCourseDetails((prevDetails) => ({
      ...prevDetails,
      selectedWeek,
    }));
  };

  const addCourse = async () => {
    const { title, startDate, endDate, description, weeklySchedules } = courseDetails;

    if (!title || !startDate || !endDate || !description || weeklySchedules.length === 0) {
      alert("Please fill in all fields.");
      return;
    }

    for (let week of weeklySchedules) {
      for (let { startTime, endTime } of week.schedule) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${startDate}T${endTime}`);

        if (endDateTime <= startDateTime) {
          alert(`End time for ${week.day} must be later than the start time.`);
          return;
        }
      }
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
        weeklySchedules, 
        educatorDetails,
        createdAt: new Date().toISOString(),
      });

      alert("Course added successfully!");
      setCourseDetails({
        title: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        description: "",
        weeklySchedules: [], 
        selectedWeek: 1, 
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
            <label htmlFor="startDate" className="input-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={courseDetails.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]} 
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
              min={courseDetails.startDate} 
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="selectedWeek" className="input-label">Select Week</label>
            <select name="selectedWeek" value={courseDetails.selectedWeek} onChange={handleWeekChange}>
              {courseDetails.weeklySchedules.map((week, index) => (
                <option key={index} value={index + 1}>
                  Week {index + 1} ({week.startDate} - {week.endDate})
                </option>
              ))}
            </select>
          </div>

          
          <div className="input-wrapper">
            <label className="input-label">Select Schedule Days for Week {courseDetails.selectedWeek}</label>
            <div className="days-of-week">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className="day-checkbox">
                  <input
                    type="checkbox"
                    name={day}
                    checked={courseDetails.weeklySchedules[courseDetails.selectedWeek - 1]?.schedule.some((item) => item.day === day)}
                    onChange={(e) => handleDaySelection(e, day, courseDetails.selectedWeek)}
                  />
                  <label>{day}</label>

                  
                  {courseDetails.weeklySchedules[courseDetails.selectedWeek - 1]?.schedule.some((item) => item.day === day) && (
                    <div className="time-inputs">
                      <label>Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={courseDetails.weeklySchedules[courseDetails.selectedWeek - 1]?.schedule.find((item) => item.day === day)?.startTime || ""}
                        onChange={(e) => handleScheduleChange(e, day, courseDetails.selectedWeek)}
                      />
                      <label>End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={courseDetails.weeklySchedules[courseDetails.selectedWeek - 1]?.schedule.find((item) => item.day === day)?.endTime || ""}
                        onChange={(e) => handleScheduleChange(e, day, courseDetails.selectedWeek)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
