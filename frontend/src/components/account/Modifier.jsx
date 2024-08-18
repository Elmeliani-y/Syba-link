import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/modifier.css";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const Modifier = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    email: "",
    password: "",
    profilePicture: null,
    profilePicturePreview: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3005/getUserData", {
          withCredentials: true,
        });
        if (response.data) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            first_name: response.data.prenom || "",
            last_name: response.data.nom || "",
            nickname: response.data.nickname || "",
            email: response.data.email || "",
            password: response.data.password || "",
            profilePicturePreview: response.data.profilePicture || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e) => {
    try {
      const compressedFile = await compressImage(e.target.files[0]);
      setFormData({
        ...formData,
        profilePicture: compressedFile,
        profilePicturePreview: URL.createObjectURL(compressedFile),
      });
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("nickname", formData.nickname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);

    if (formData.profilePicture) {
      formDataToSend.append("profilePicture", formData.profilePicture);
    }

    try {
      const response = await axios.post(
        "http://localhost:3005/updateUser",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message) {
        navigate("/accounts");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user data");
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

  return (
    <form className="modifier-form" onSubmit={handleSubmit}>
      <label className="form-label">
        First Name:
        <input
          className="form-input"
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
        />
      </label>
      <label className="form-label">
        Last Name:
        <input
          className="form-input"
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
      </label>
      <label className="form-label">
        Nickname:
        <input
          className="form-input"
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
        />
      </label>
      <label className="form-label">
        Email:
        <input
          className="form-input"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <label className="form-label">
        Password:
        <input
          className="form-input"
          type="text"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {console.log(formData.password)}
      </label>
      <label className="form-label">
        Profile Picture:
        <input
          className="form-input"
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
      {formData.profilePicturePreview && (
        <img
          className="profile-picture-preview"
          src={formData.profilePicturePreview}
          alt="Profile Preview"
        />
      )}
      <button className="submit-button" type="submit">
        Update
      </button>
    </form>
  );
};

export default Modifier;
