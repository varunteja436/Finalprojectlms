import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "./firebase"; 
import "./Educatorcreate.css";

const CreateEducator = () => {
  const [educatorData, setEducatorData] = useState({
    fullname: "",
    age: "",
    number: "",
    email: "",
    password: "",
    qualification: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEducatorData({ ...educatorData, [name]: value });
  };

  const registerEducator = async () => {
    const { fullname, age, number, email, password, qualification } = educatorData;

    if (!fullname || !age || !number || !email || !password || !qualification) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullname });

      const educatorUid = user.uid;

      const educatorRef = ref(db, `users/${educatorUid}`);
      await set(educatorRef, {
        name: fullname,
        age,
        number,
        email,
        qualification,
        role: "EDUCATOR",
        firstTimeLogin: true,
        uid: user.uid,
        createdAt: Date.now(),
      });

      alert("Educator registered successfully!");
      setEducatorData({
        fullname: "",
        age: "",
        number: "",
        email: "",
        password: "",
        qualification: "",
      });

      navigate("/educatorlist"); 
    } catch (error) {
      console.error("Error registering educator: ", error.message);
      alert("Error registering educator: " + error.message);
    }
  };

  return (
    <div className="educator-container">
      <aside>
        <ul>
          <li><Link to="/educatorlist">Educatorlist</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
        
      </aside>
      <main className="educator-list-main">
        <header>
          <h1>Create Educator</h1>
        </header>
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Enter Full Name"
              value={educatorData.fullname}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="text"
              id="age"
              name="age"
              placeholder="Enter Age"
              value={educatorData.age}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="number">Phone Number</label>
            <input
              type="text"
              id="number"
              name="number"
              placeholder="Enter Phone Number"
              value={educatorData.number}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              value={educatorData.email}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
              value={educatorData.password}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="qualification">Qualification</label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              placeholder="Enter Qualification"
              value={educatorData.qualification}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <button onClick={registerEducator} className="submit-button">
            Register Educator
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreateEducator;