import React, { useState } from "react";
import axios from "axios";
import "../../style/Stories.css";
import imageCompression from "browser-image-compression";



const AddStory = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setImage(compressedImage);
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
   formData.append("content", content);
   formData.append("image", image);
   console.log(image)

   try {
     const response = await axios.post(
       "http://localhost:3005/addstory",
       formData,
       {
         withCredentials: true, 
         headers: {
           "Content-Type": "multipart/form-data", 
         },
       }
     );
     console.log(response.data);
   } catch (error) {
     console.error("Error adding story:", error);
   }
 };

  return (
    <div>
      <div class="file-upload-form">
        <label for="file" class="file-upload-label">
          <div class="file-upload-design">
            <svg viewBox="0 0 640 512" height="1em">
              <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
            </svg>
            <p>Drag and Drop</p>
            <p>or</p>
            <button onClick={handleSubmit} class="browse-button">
              addstory
            </button>
          </div>
          <input id="file" type="file" onChange={handleImageChange} />
        </label>
      </div>
    </div>
  );
};

export default AddStory;
