import React, { useState, useEffect } from "react";
import axios from "axios";
import unknown from "/assets/unknown.png";
import "../../style/Comment.css";


const Comment = ({ postId, post_userid, onClose }) => {
  const [commentsData, setCommentsData] = useState({
    postImage: "",
    comments: [],
  });
  const [newComment, setNewComment] = useState("");
console.log("ossma", post_userid);
  useEffect(() => {
    axios
      .get(`http://localhost:3005/comments/${postId}`, {
        withCredentials: true,
      })
      .then((response) => {
        setCommentsData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  }, [postId]);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    axios
      .post(
        `http://localhost:3005/addComment`,
        {
          postId,
          content: newComment,
        },
        { withCredentials: true }
      )
      .then((response) => {
        setCommentsData((prevData) => ({
          ...prevData,
          comments: [...prevData.comments, response.data],
        }));
        setNewComment("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
    axios.post(
      `http://localhost:3005/sendnotificationcomment`,
      {
        postId,
        content: newComment,
        post_userid,
      },
      { withCredentials: true }
    );
    console.log(post_userid);
  };

  return (
    <div className="comment-overlay">
      <div className="close-btn">
        <button onClick={onClose}><img src="/assets/close.png" alt="fdsf" width="25px"/></button>
      </div>
      <h1
        style={{
          textAlign: "center",
          marginLeft: "300px",
        }}
      >
        Comments
      </h1>
      <div className="comment-content">
        {commentsData.postImage && (
          <img
            src={commentsData.postImage}
            className="comment-img"
            alt="Post"
          />
        )}
        <div className="comment-container">
          {commentsData.comments.map((comment) => (
            <div key={comment.commentId} className="comment">
              {comment.profilePicture ? (
                <img
                  src={comment.profilePicture}
                  alt="Profile"
                  width="30px"
                  style={{ borderRadius: "50%" }}
                />
              ) : (
                <img
                  src={unknown}
                  alt="Profile"
                  width="30px"
                  style={{ borderRadius: "50%" }}
                />
              )}
              <p>
                <strong>{comment.nickname}:</strong> {comment.content}
              </p>
            </div>
          ))}
          <div className="add-comment">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              onClick={() => handleAddComment(commentsData.userId)}
              className="btn-add-comment"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
