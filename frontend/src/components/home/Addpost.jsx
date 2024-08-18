import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "../../style/Addpost.css";


const Addpost = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);

  const handleContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setCompressedImage(compressedFile);
        setSelectedImage(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.064,
      maxWidthOrHeight: 500,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("content", postContent);
    if (compressedImage) {
      formData.append("image", compressedImage);
    }

    try {
      const response = await axios.post(
        "http://localhost:3005/addposts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log("Post added:", response.data);
      setPostContent("");
      setSelectedImage(null);
      setCompressedImage(null);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  return (
    <div className="post-input">
      <div className="profile-pic"></div>
      <input
        type="text"
        placeholder="What's on your mind ?"
        className="inputaddpost"
        value={postContent}
        onChange={handleContentChange}
      />
      {selectedImage && (
        <img
          src={selectedImage}
          alt="Selected"
          className="selected-image"
          width="200px"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="imageUpload"
      />
      <div className="post-actions">
        <label
          htmlFor="imageUpload"
          className="btn_addpost"
          style={{
            fontWeight: "bold",
            fontSize: "16px",
           
          }}
        >
          Photo
        </label>
        <button
          className="feeling-activity"
          style={{
            fontWeight: "bold",
            fontSize: "16px",
          }}
          onClick={handleSubmit}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default Addpost;
