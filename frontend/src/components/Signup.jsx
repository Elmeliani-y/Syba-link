import React, { useState, useEffect } from "react";
import Signupvalidation from "./Signupvalidation";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/Signup.css"


export default function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    const formErrors = Signupvalidation(values);
    setErrors(formErrors); 
  };

  useEffect(() => {
    if (
      errors.first_name === "" &&
      errors.last_name === "" &&
      errors.nickname === "" &&
      errors.email === "" &&
      errors.password === ""
    ) {
      axios
        .post("http://localhost:3005/signup", values)
        .then((res) => navigate("/"))
        .catch((err) => console.log(err));
    }
  }, [errors]); 

  return (
    <div>
      <form onSubmit={handlesubmit} className="form">
        <div>
          <label>First Name:</label>
          <br />
          <input
            type="text"
            name="first_name"
            onChange={handleChange}
            className="input"
          />
          {errors.first_name && <span>{errors.first_name}</span>}
        </div>
        <div>
          <label>Last Name:</label>
          <br />
          <input
            type="text"
            name="last_name"
            onChange={handleChange}
            className="input"
          />
          {errors.last_name && <span>{errors.last_name}</span>}
        </div>
        <div>
          <label>Nickname:</label>
          <br />
          <input
            type="text"
            name="nickname"
            onChange={handleChange}
            className="input"
          />
          {errors.nickname && <span>{errors.nickname}</span>}
        </div>
        <div>
          <label>E-mail:</label>
          <br />
          <input
            type="text"
            name="email"
            onChange={handleChange}
            className="input"
          />
          {errors.email && <span>{errors.email}</span>}
        </div>
        <div>
          <label>Password:</label>
          <br />
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="input"
          />
          {errors.password && <span>{errors.password}</span>}
        </div>
        <button type="submit" className="btn-login">
          Sign up
        </button>
      </form>
    </div>
  );
}
