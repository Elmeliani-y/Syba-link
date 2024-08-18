import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import Home from "./components/home/Home";
import Notification from "./components/Notification";

import Message from "./components/Message";
import Accounts from "./components/account/Accounts";
import Signpage from "./components/Signpage";
import Modifier from "./components/account/Modifier";
import Profile from "./components/account/Profile";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Route without sidebar */}
        <Route path="/" element={<Signpage />} />

        {/* Routes with sidebar */}
        <Route
          path="/*"
          element={
            <App>
              <Routes>
                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/home" element={<Home />} />
                <Route path="/messages" element={<Message />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/modifierch" element={<Modifier/>} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/profile/:userId" element={<Profile />} />
              </Routes>
            </App>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
