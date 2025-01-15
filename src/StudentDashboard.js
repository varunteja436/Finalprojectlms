import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { getAuth } from "firebase/auth"; 

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
        <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            textAlign: "center",
            margin: "auto",
            fontSize: 40,
            fontWeight: 600,
        }}
        >
        {name ? `Welcome ${name}` : "Loading..."}
        </div>
    );
};

export default StudentDashboard;