import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { getAuth } from "firebase/auth"; 
import { Link } from "react-router-dom";
import "./Studentdashboard.css";

const StudentDashboard = () => {
    const [name, setName] = useState(""); 
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth(); 
        const user = auth.currentUser;

        if (!user) {
        navigate("/"); 
        } else {
        setName(user.displayName || user.email || "User"); 
        }
    }, [navigate]); 
    
    return (
        <div className="student-dashboard-container">
        <aside>
          <ul>
            <li><Link to="/studentprofile"> View Profile</Link></li>
          </ul>
        </aside>
        <main className="student-dashboard-main">
          <header>
            <h1>Student Dashboard</h1>
          </header>
            <div className="student-details">
              {name ? `Welcome, ${name}` : "Loading..."}
            </div>

        </main>
      </div>
    );
};

export default StudentDashboard;