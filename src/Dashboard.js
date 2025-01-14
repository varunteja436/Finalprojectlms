import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

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



  // const logoutUser = async () => {
  //   const auth = getAuth();
  //   try {
  //     await signOut(auth); 
  //     navigate("/"); 
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //     alert("Error logging out. Please try again.");
  //   }
  // };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {name}!</h1>
      <aside>
        <ul>
          <li><Link to="/educatorlist">Educatorlist</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </aside>
    </div>
  );
};

export default Dashboard;
