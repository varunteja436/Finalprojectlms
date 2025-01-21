import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import './EducatorEditCourse.css';

const EducatorEditCourse = ({ 
  showCourseDetails, 
  setShowCourseEditForm, 
  setShowCourseDetails, 
  fetchAllCourses 
}) => {
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
    if (showCourseDetails) {
      setCourseDetails({
        title: showCourseDetails.title,
        startDate: showCourseDetails.startDate,
        endDate: showCourseDetails.endDate,
        description: showCourseDetails.description,
        weeklySchedules: showCourseDetails.weeklySchedules.map(week => ({
          ...week,
          schedule: week.schedule || [],
        })) || [],
        selectedWeek: 1, 
      });
    }
  }, [showCourseDetails]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleDaySelection = (e, day, week) => {
    const isChecked = e.target.checked;
  
    setCourseDetails((prevDetails) => {
      const updatedWeeklySchedules = [...prevDetails.weeklySchedules];
      if (!updatedWeeklySchedules[week - 1]) {
        updatedWeeklySchedules[week - 1] = { startDate: "", endDate: "", schedule: [] };
      }
  

      if (isChecked) {
        updatedWeeklySchedules[week - 1].schedule.push({ day, startTime: "", endTime: "" });
      } else {
        updatedWeeklySchedules[week - 1].schedule = updatedWeeklySchedules[week - 1].schedule.filter(item => item.day !== day);
      }
  

      if (updatedWeeklySchedules[week - 1].schedule.length === 0) {
        updatedWeeklySchedules.splice(week - 1, 1);
      }
  
      return { ...prevDetails, weeklySchedules: updatedWeeklySchedules };
    });
  };
  
  const handleScheduleChange = (e, day, week) => {
    const { name, value } = e.target;
  
    setCourseDetails((prevDetails) => {
      const updatedWeeklySchedules = [...prevDetails.weeklySchedules];
      if (!updatedWeeklySchedules[week - 1]) {
        updatedWeeklySchedules[week - 1] = { startDate: "", endDate: "", schedule: [] };
      }
      const updatedSchedule = updatedWeeklySchedules[week - 1].schedule.map(item =>
        item.day === day ? { ...item, [name]: value } : item
      );
  
      updatedWeeklySchedules[week - 1].schedule = updatedSchedule;
      if (updatedWeeklySchedules[week - 1].schedule.length === 0) {
        updatedWeeklySchedules.splice(week - 1, 1);
      }
  
      return { ...prevDetails, weeklySchedules: updatedWeeklySchedules };
    });
  };
  
  

  const handleWeekChange = (e) => {
    const selectedWeek = parseInt(e.target.value);
    if (selectedWeek >= 1 && selectedWeek <= courseDetails.weeklySchedules.length) {
      setCourseDetails((prevDetails) => ({
        ...prevDetails,
        selectedWeek,
      }));
    } else {
      setCourseDetails((prevDetails) => ({
        ...prevDetails,
        selectedWeek: 1,
      }));
    }
  };
  

  const updateCourse = async () => {
    const { title, startDate, endDate, description, weeklySchedules } = courseDetails;

    if (!title || !startDate || !endDate || !description || weeklySchedules.length === 0) {
      alert("Please fill in all fields.");
      return;
    }
    const today = new Date().toISOString().split('T')[0]; 
    if (startDate < today) {
      alert("Start date must be today or in the future.");
      return;
    }


    if (endDate < startDate) {
      alert("End date cannot be before the start date.");
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

      const educatorDetails = showCourseDetails?.educatorDetails || {};

      const coursesRef = ref(db, `courses/${showCourseDetails.id}`);

      await set(coursesRef, {
        id: showCourseDetails.id,
        title,
        startDate,
        endDate,
        description,
        weeklySchedules, 
        educatorDetails, 
        createdAt: new Date().toISOString(),
      });

      alert("Course updated successfully!");
      fetchAllCourses();
      setShowCourseEditForm(false); 
      setShowCourseDetails(null); 
      navigate("/educatorCourseList");
    } catch (error) {
      console.error("Error updating course: ", error.message);
      alert("Error updating course: " + error.message);
    }
  };

  return (
    <div className="edit-course-containerr">
      <main className="edit-course-mainn">
        <div className="form-headerredit">Edit Course</div>
        <div className="form-contentt">
          <div className="input-groupp">
            <input
              type="text"
              name="title"
              placeholder="Course Name"
              value={courseDetails.title}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapperr">
            <label htmlFor="startDate" className="input-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={courseDetails.startDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapperr">
            <label htmlFor="endDate" className="input-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={courseDetails.endDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="input-wrapperr">
            <label htmlFor="selectedWeek" className="input-label">Select Week</label>
            <select name="selectedWeek" value={courseDetails.selectedWeek} onChange={handleWeekChange}>
              {courseDetails.weeklySchedules.map((week, index) => (
                <option key={index} value={index + 1}>
                  Week {index + 1} ({week.startDate} - {week.endDate})
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapperr">
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

          <div className="textarea-groupp">
            <textarea
              name="description"
              id="description"
              value={courseDetails.description}
              onChange={handleInputChange}
              className="textarea-fieldd"
            ></textarea>
          </div>

          <div className="button-containerr">
            <button className="cancel-buttonn" onClick={() => setShowCourseEditForm(false)}>
              Cancel
            </button>
            <button onClick={updateCourse} className="submit-buttonn">
              Update Course
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorEditCourse;
