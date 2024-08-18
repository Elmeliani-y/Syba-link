import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/Accounts.css";
import unknown from "/assets/unknown.png";
import { BsArrowLeft } from "react-icons/bs";
import { Link } from "react-router-dom";

function Accounts() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:3005/Account`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("API response:", response.data);
        setUser(response.data.user);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching:", error);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  return (
    <div>
      <Link to="/Home">
        <BsArrowLeft />
      </Link>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="shapes"></div>
          <div className="infouser">
            <div className="infousersecond">
              {user.profilePicture ? (
                <img
                  className="circular-profile"
                  src={user.profilePicture}
                  width="80px"
                  style={{ borderRadius: "50%", height: "90px" }}
                  alt="Profile"
                />
              ) : (
                <img
                  src={unknown}
                  width="80px"
                  style={{ borderRadius: "50%" }}
                  alt="Unknown"
                />
              )}
              <p>
                <strong>
                  {user.prenom ? user.prenom.toUpperCase() : ""}{" "}
                  {user.nom ? user.nom.toUpperCase() : ""}
                </strong>
              </p>
              <p className="bio">{user.bio}</p>
              <button className="btn_update" >
                <a href="modifierch">Edite information</a>
              </button>
            </div>
          </div>
          <div className="main">
            <ul className="stateuser">
              <li>
                {user.postCount} <br />
                <span>
                  <strong>Post</strong>
                </span>
              </li>
              <li>
                {user.followingCount} <br />
                <span>
                  <strong>Following</strong>
                </span>
              </li>
              <li>
                {user.followerCount} <br />
                <span>
                  <strong>Followers</strong>
                </span>
              </li>
            </ul>
            {user.postImages && user.postImages.length > 0 ? (
              user.postImages.map((postImage, index) => (
                <div key={index} className="image-posts">
                  <img
                    src={postImage}
                    alt={`Post ${index}`}
                    style={{
                      width: "300px",
                      height: "150px",
                      borderRadius: "20px",
                      marginLeft: "5px",
                    }}
                  />
                </div>
              ))
            ) : (
              <p>No posts to display.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
