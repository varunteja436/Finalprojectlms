import React, { useState } from "react";
import { Link } from "react-router-dom";
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
      </main>
    </div>
  );
};

export default CreateEducator;
