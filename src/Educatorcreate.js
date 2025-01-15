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
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={educatorData.fullname}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="text"
          name="age"
          placeholder="Age"
          value={educatorData.age}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="text"
          name="number"
          placeholder="Phone Number"
          value={educatorData.number}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={educatorData.email}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={educatorData.password}
          onChange={handleInputChange}
          className="input-field"
        />
        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={educatorData.qualification}
          onChange={handleInputChange}
          className="input-field"
        />
        <button onClick={registerEducator} className="submit-button">
          Register Educator
        </button>
      </main>
    </div>
  );
};

export default CreateEducator;