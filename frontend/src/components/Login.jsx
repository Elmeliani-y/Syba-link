import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Validationform from "./Validationform"; 
import "../style/Login.css"


export default function Login() {
  const navigate = useNavigate();
  const [userId, setUserid] =useState("")
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    const formErrors = Validationform(values);
    setErrors(formErrors);
  };

  useEffect(() => {
    if (errors.email === "" && errors.password === "") {
      axios
        .post("http://localhost:3005/login", values, {
          withCredentials: true, // Include credentials for authentication
        })
        .then((res) => {
          console.log(res.data.message);
          if (res.data.message === "sucsses") {
            console.log(res.data.user);
            localStorage.setItem("userId", res.data.user);
            navigate("/home");
          } else {
            console.log("error");
          }
        })
        .catch((err) => console.log(err)); 
    }
  }, [errors]);

  return (
    <div>
      <form onSubmit={handlesubmit} className="form">
        <div>
          <label>E-mail:</label><br />
          <input type="text" name="email" onChange={handleChange} />
          <br />
          {errors.email && <span style={{color:"red"}}>{errors.email}</span>}
        </div>
        <div className="password-label">
          <label >Password:</label><br />
          <input type="password" name="password" onChange={handleChange} />
          {errors.password && <span style={{color:"red"}}>{errors.password}</span>}
        </div>
        <button type="submit" className="btn-login">Login</button>
      </form>
    </div>
  );
}
