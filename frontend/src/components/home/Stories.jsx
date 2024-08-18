import React, { useState, useEffect } from "react";
import Userstory from "./Userstory";
import AddStory from "./AddStory";
import unknown from "/assets/unknown.png";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "../../style/Stories.css";

export default function Stories() {
  const [stories, setStories] = useState([]);
 useEffect(() => {
   fetchStories();
 }, []);
    const fetchStories = async () => {
      try {
        const response = await fetch("http://localhost:3005/stories", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          console.error("Failed to fetch stories");
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };


  return (
    <div className="stories">
      <AddStory />
      <Swiper style={{ width: "100%" }} slidesPerView={6} spaceBetween={0}>
        {stories.map((story) => (
          <SwiperSlide>
            <div className="story" key={story.storyId}>
              <div className="user">
                {story.profilePicture ? (
                  <img
                    src={story.profilePicture}
                    alt="Profile"
                    width="40"
                    style={{ borderRadius: "50%" }}
                  />
                ) : (
                  <img
                    src={unknown}
                    alt="Profile"
                    width="40px"
                    style={{ borderRadius: "50%" }}
                  />
                )}
              </div>
              <img src={story.contentimg} alt="story" width="100%" />
            </div>
            <div className="username-st">
              <h5>@{story.nickname}</h5>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
