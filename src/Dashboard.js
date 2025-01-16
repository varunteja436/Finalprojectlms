import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
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
    <div className="dashboard-container">
      <aside>
        <ul>
          <li><Link to="/dashboard">Home</Link></li>
          </ul>
        <ul>
          <li><Link to="/educatorlist">Educatorlist</Link></li>
          </ul>
        <ul>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </aside>
      <main className="dashboard-main">
        <header>
          <h1>Admin Dashboard</h1>
          </header>   
            <section className="dashboard-section">
        <h1>Welcome Admin!</h1>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
