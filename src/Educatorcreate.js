import React, { useState } from "react";


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
    <div className="educator-container">
      <h2>Create Educator</h2>

      <input
        type="text"
        name="fullname"
        placeholder="Full Name"
        className="input-field"
      />

      <input
        type="text"
        name="age"
        placeholder="Age"
        className="input-field"
      />

      <input
        type="text"
        name="number"
        placeholder="Phone Number"
        className="input-field"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="input-field"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="input-field"
      />

      <input
        type="text"
        name="qualification"
        placeholder="Qualification"
        className="input-field"
      />

      <button
        onClick={registerEducator}
        className="submit-button"
      >
        Register Educator
      </button>
    </div>
  );
};

export default CreateEducator;
