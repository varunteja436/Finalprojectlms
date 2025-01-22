import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Login from "./Login"; 
import Dashboard from "./Dashboard"; 
import Educatorlist from "./Educatorlist"; 
import Educatorcreate from "./Educatorcreate"; 
import Registration from "./Registration"; 
import StudentDashboard from "./StudentDashboard";
import EducatorDashboard from "./Educatordashboard";
import Educatorprofile from "./Educatorprofile";
import EducatorCreateCourse from "./EducatorCreateCourse";
import EducatorEditCourse from "./EducatorEditCourse";
import EducatorCourseList from "./EducatorCourseList";
import Educatorchangepassword from "./Educatorchangepassword";
import ForgotPassword from "./forgotpassword";
import Studentprofile from "./Studentprofile";
import StudentCourse from "./StudentCourse";
import StudentEnrolledCourse from "./StudentEnrolledCourse";
import StudentUnenrolledCourse from "./StudentUnenrolledCourse";
import AdminViewStudents from "./Adminviewstudents";
import AdminEditEducator from "./Adminediteducator";
import Educatormyassignments from "./Educatormyassignments";
import Educatorcreateassignment from "./Educatorcreateassignment";
import AssignmentViewProgress from "./AssignmentViewProgress";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/educatorlist" element={<Educatorlist />} />
          <Route path="/educatorcreate" element={<Educatorcreate />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/studentprofile" element={<Studentprofile />} />
          <Route path="/studentcourse" element={<StudentCourse />} />
          <Route path="/studentenrolledcourse" element={<StudentEnrolledCourse />} />
          <Route path="/studentunenrolledcourse" element={<StudentUnenrolledCourse />} />
          <Route path="/educatordashboard" element={<EducatorDashboard />} />
          <Route path="/educatorprofile" element={<Educatorprofile />} />
          <Route path="/educatorcreatecourse" element={<EducatorCreateCourse />} />
          <Route path="/educatorEditCourse" element={<EducatorEditCourse />} />
          <Route path="/educatorCourseList" element={<EducatorCourseList />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/educatorchangepassword" element={<Educatorchangepassword />} />
          <Route path="/adminviewstudents" element={<AdminViewStudents />} />
          <Route path="/adminediteducator" element={<AdminEditEducator />} />
          <Route path="/educatormyassignments" element={<Educatormyassignments />} />
          <Route path="/educatorcreateassignment" element={<Educatorcreateassignment />} />
          <Route path="/assignmentviewprogress" element={<AssignmentViewProgress />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
