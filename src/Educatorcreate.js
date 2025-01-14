import React, { useState } from "react";
import './CreateEducator.css';

const CreateEducator = () => {
  const [educatorData, setEducatorData] = useState({
    fullname: "",
    age: "",
    number: "",
    email: "",
    password: "",
    qualification: "",
  });



  const registerEducator = async () => {
    const { fullname, age, number, email, password, qualification } =
      educatorData;

    if (!fullname || !age || !number || !email || !password || !qualification) {
      alert("Please fill in all fields.");
      return;
    }

  };

  return (
    <div className="educator-form-container">
      <h2>Create Educator</h2>

      <input
        type="text"
        name="fullname"
        placeholder="Full Name"
        className="educator-input"
      />

      <input
        type="text"
        name="age"
        placeholder="Age"
        className="educator-input"
      />

      <input
        type="text"
        name="number"
        placeholder="Phone Number"
        className="educator-input"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="educator-input"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="educator-input"
      />

      <input
        type="text"
        name="qualification"
        placeholder="Qualification"
        className="educator-input"
      />

      <button onClick={registerEducator} className="educator-button">
        Register Educator
      </button>
    </div>
  );
};

export default CreateEducator;
