import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/Home.css";
import unknown from "/assets/unknown.png";
import { useNavigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa";
import { HiMiniHeart } from "react-icons/hi2";
import { HiOutlineHeart } from "react-icons/hi2";

import AddStory from "./AddStory";
import Stories from "./Stories";
import Comment from "./Comment";
import SearchUser from "../SearchUser";
import SuggestedUsers from "../SuggestedUsers";
import Addpost from "./Addpost";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostuserId, setSelectedPostuserId] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`http://localhost:3005/posts`, { withCredentials: true })
      .then((response) => {
        if (userId) {
          setPosts(response.data);
          setIsLoading(false);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const handleCommentClick = (postId, post_userid) => {
    setSelectedPostId(postId);
    setSelectedPostuserId(post_userid);

    setShowComments(true);
  };

  const handleLikeClick = (postId, post_userid) => {
    axios
      .post(
        `http://localhost:3005/togglelike`,
        { postId },
        { withCredentials: true }
      )
      .then((response) => {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.postId === postId) {
              const isLiked = response.data.message.includes("removed");
              return {
                ...post,
                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
                isLikedByCurrentUser: !isLiked,
              };
            }
            return post;
          })
        );
      })
      .catch((error) => {
        console.error("Error toggling like:", error);
      });
    if (userId !== post_userid) {
      axios
        .post(
          `http://localhost:3005/sendNotification`,
          { postId, post_userid },
          { withCredentials: true }
        )
        .then(() => console.log("Sent notification"))
        .catch(() => console.log("error Sent notification"));
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const calculateDateDifference = (datePosted) => {
    const postDate = new Date(datePosted);
    const currentDate = new Date();
    const timeDifference = currentDate - postDate;

    const millisecondsInAMinute = 1000 * 60;
    const millisecondsInAnHour = millisecondsInAMinute * 60;
    const millisecondsInADay = millisecondsInAnHour * 24;
    const millisecondsInAWeek = millisecondsInADay * 7;

    if (timeDifference < millisecondsInAMinute) {
      return "just now";
    } else if (timeDifference < millisecondsInAnHour) {
      const minutesPassed = Math.floor(timeDifference / millisecondsInAMinute);
      return `${minutesPassed} minute${minutesPassed !== 1 ? "s" : ""} ago`;
    } else if (timeDifference < millisecondsInADay) {
      const hoursPassed = Math.floor(timeDifference / millisecondsInAnHour);
      return `${hoursPassed} hour${hoursPassed !== 1 ? "s" : ""} ago`;
    } else if (timeDifference < millisecondsInAWeek) {
      const daysPassed = Math.floor(timeDifference / millisecondsInADay);
      return `${daysPassed} day${daysPassed !== 1 ? "s" : ""} ago`;
    } else {
      const weeksPassed = Math.floor(timeDifference / millisecondsInAWeek);
      return `${weeksPassed} week${weeksPassed !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="home_search">
      <div1
        className={`mainhome ${showComments ? "blur" : ""}`}
        style={{ borderRight: "1px solid #00000073" }}
      >
        <div className="add-st">
          <Stories />
        </div>
        <div style={{ marginRight: "20px", marginBottom: "25px" }}>
          <Addpost />
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="posts_container">
            {posts.map((post) => (
              <div key={post.postId}>
                <a className="info_post" href={`/profile/${post.userId}`}>
                  {post.profilePicture ? (
                    <img src={post.profilePicture} alt="Profile" width="40px" />
                  ) : (
                    <img src={unknown} alt="Profile" width="40px" />
                  )}
                  <h2>
                    <strong>{post.nickname}</strong>
                  </h2>
                  <p style={{ marginLeft: "90px" }}>
                    {calculateDateDifference(post.datePosted)}
                  </p>
                </a>
                {post.contentimg && (
                  <img
                    src={`data:image/png;base64,${post.contentimg}`}
                    alt="Post"
                    width="270px"
                    style={{ borderRadius: "5%" }}
                    className="post_content"
                  />
                )}
                <p className="content-name">
                  <strong>{post.nickname}</strong> {post.content}
                </p>
                <div className="icons-p">
                  <div
                    className="likediv"
                    onClick={() => handleLikeClick(post.postId, post.userId)}
                  >
                    <p>
                      {post.isLikedByCurrentUser ? (
                        <HiMiniHeart
                          className="likeicon"
                          style={{ color: "red" }}
                        />
                      ) : (
                        <HiOutlineHeart className="likeicon" />
                      )}
                    </p>
                    <p>{post.likeCount}</p>
                  </div>
                  <div
                    className="likediv"
                    onClick={() => handleCommentClick(post.postId, post.userId)}
                  >
                    <p>
                      <FaRegComment className="commenticon" />
                    </p>
                    <p>{post.commentCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div1>
      <div style={{ marginLeft: "10px" }}>
        <SearchUser />
      </div>
        {showComments && (
          <Comment
            postId={selectedPostId}
            post_userid={selectedPostuserId}
            onClose={handleCloseComments}
          />
        )}
    </div>
  );
};

export default Home;
