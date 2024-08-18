import React, { useState } from "react";
import phone from "/assets/phone.png";
import Login from "./Login";
import Signup from "./Signup";
import Typewriter from "typewriter-effect";
import "../style/Signpage.css";
import logo from "/assets/logo.png";

export default function Signpage() {
  const [showLogin, setShowLogin] = useState(true);

  const handleToggleForm = () => {
    setShowLogin((prev) => !prev);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleShowSignup = () => {
    setShowLogin(false);
  };

  return (
    <div className="signpage-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100vh",
          position: "relative",
          zIndex: "1",
        }}
      >
        <div className="title-img">
          <h1 className="title">
            Welcome to SybaLink <br />
            your gateway to{" "}
            <Typewriter
              className="title-effect"
                options={{
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  strings: ["Connections", "Conversations"],
                }}
              />
          </h1>
          <img
            className="image"
            src={phone}
            alt="Phone"
            style={{ maxWidth: "400px" }}
          />
        </div>
        <div className="form_signpage">
          <div className="image-logo">
            <img src={logo} alt="" width="50px" />
          </div>
          <div style={{ marginBottom: "10px" }} className="btn-form">
            <button
              className={showLogin ? "active" : ""}
              onClick={handleShowLogin}
              style={{ marginRight: "10px" }}
            >
              Login
            </button>
            <button
              className={!showLogin ? "active" : ""}
              onClick={handleShowSignup}
            >
              Sign Up
            </button>
          </div>
          {showLogin ? <Login /> : <Signup />}
          <p>
            {showLogin
              ? "Don't have an account? "
              : "Already have an account? "}
            <button onClick={handleToggleForm} className="btn-switch">
              {showLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
      <div className="circle-background"></div>
    </div>
  );
}
