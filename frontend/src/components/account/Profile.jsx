// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import unknown from "/assets/unknown.png";
// import { BsArrowLeft } from "react-icons/bs";

// function Profile() {
//   const [user, setUser] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [followStatus, setFollowStatus] = useState("");
//   const loggedInUserId = localStorage.getItem("userId");
//   const { userId } = useParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!loggedInUserId) {
//       navigate("/");
//       return;
//     }

//     axios
//       .get(`http://localhost:3005/profile/${userId}`, {
//         withCredentials: true,
//       })
//       .then((response) => {
//         console.log("API response:", response.data);
//         setUser(response.data);
//         setFollowStatus(response.data.followStatus); // Set follow status from backend
//         setIsLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching:", error);
//         setIsLoading(false);
//       });
//   }, [loggedInUserId, userId, navigate]);

//   const handleFollow = () => {
//     const followUrl =
//       followStatus === "Follow" || followStatus === "Follow Back"
//         ? `http://localhost:3005/follow/${userId}`
//         : `http://localhost:3005/unfollow/${userId}`;

//     axios
//       .post(followUrl, {}, { withCredentials: true })
//       .then((response) => {
//         console.log(response.data.message);
//         setFollowStatus(response.data.followStatus); // Update follow status from backend
//       })
//       .catch((error) => {
//         console.error("Error following/unfollowing:", error);
//       });
//   };

//   return (
//     <div>
//       <BsArrowLeft onClick={() => navigate("/Home")} />
//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <div>
//           <div className="shapes"></div>
//           <div className="infouser">
//             <div className="infousersecond">
//               {user.profilePicture ? (
//                 <img
//                   className="circular-profile"
//                   src={user.profilePicture}
//                   width="80px"
//                   style={{ borderRadius: "50%", height: "90px" }}
//                   alt="Profile"
//                 />
//               ) : (
//                 <img
//                   src={unknown}
//                   width="80px"
//                   style={{ borderRadius: "50%" }}
//                   alt="Unknown"
//                 />
//               )}
//               <p>
//                 <strong>
//                   {user.prenom ? user.prenom.toUpperCase() : ""}{" "}
//                   {user.nom ? user.nom.toUpperCase() : ""}
//                 </strong>
//               </p>
//               <p className="bio">{user.bio}</p>
//               <button
//                 onClick={handleFollow}
//                 className="button_follow"
//                 style={
//                   followStatus == "Followed"
//                     ? { background: "#fff" }
//                     : { background: "#B968C7" }
//                 }
//               >
//                 {followStatus}
//               </button>
//             </div>
//           </div>
//           <div className="main">
//             <ul className="stateuser">
//               <li>
//                 {user.postCount} <br />
//                 <span>
//                   <strong>Post</strong>
//                 </span>
//               </li>
//               <li>
//                 {user.followingCount} <br />
//                 <span>
//                   <strong>Following</strong>
//                 </span>
//               </li>
//               <li>
//                 {user.followerCount} <br />
//                 <span>
//                   <strong>Followers</strong>
//                 </span>
//               </li>
//             </ul>
//             {user.postImages && user.postImages.length > 0 ? (
//               user.postImages.map((postImage, index) => (
//                 <div key={index} className="image-posts">
//                   <img
//                     src={postImage}
//                     alt={`Post ${index}`}
//                     style={{
//                       width: "300px",
//                       height: "150px",
//                       borderRadius: "20px",
//                       marginLeft: "5px",
//                     }}
//                   />
//                 </div>
//               ))
//             ) : (
//               <p>No posts to display.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Profile;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import unknown from "/assets/unknown.png";
import { BsArrowLeft } from "react-icons/bs";

function Profile() {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState("");
  const loggedInUserId = localStorage.getItem("userId");
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUserId) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:3005/profile/${userId}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("API response:", response.data);
        setUser(response.data);
        setFollowStatus(response.data.followStatus); // Set follow status from backend
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching:", error);
        setIsLoading(false);
      });
  }, [loggedInUserId, userId, navigate]);

  const handleFollow = () => {
    const followUrl = `http://localhost:3005/follow/${userId}`;

    axios
      .post(followUrl, {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data.message);
        setFollowStatus(response.data.followStatus); // Update follow status from backend
      })
      .catch((error) => {
        console.error("Error following/unfollowing:", error);
      });
  };

  return (
    <div>
      <BsArrowLeft onClick={() => navigate("/Home")} />
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
              <button
                onClick={handleFollow}
                className="button_follow"
                style={
                  followStatus === "Followed"
                    ? { background: "#fff" }
                    : { background: "#B968C7" }
                }
              >
                {followStatus}
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

export default Profile;
