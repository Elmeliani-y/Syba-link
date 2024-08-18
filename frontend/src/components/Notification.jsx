import React, { useState, useEffect } from "react";
import axios from "axios";
import unknown from "/assets/unknown.png";
import "../style/Notification.css"
import SearchUser from "./SearchUser";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    axios
      .get("http://localhost:3005/notifications", { withCredentials: true })
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  };

  const parseContent = (content) => {
    return content.replace(/\b\d+\b/g, "").trim();
  };

  const markAllAsViewed = () => {
    axios
      .post(
        "http://localhost:3005/notifications/markAllAsViewed",
        { userId: loggedInUserId },
        { withCredentials: true }
      )
      .then(() => {
        fetchNotifications();
      })
      .catch((error) => {
        console.error("Error marking notifications as viewed:", error);
      });
  };

  const deleteSelectedNotifications = () => {
    axios
      .post(
        "http://localhost:3005/notifications/deleteSelected",
        { notificationIds: selectedNotifications },
        { withCredentials: true }
      )
      .then(() => {
        fetchNotifications();
        setSelectedNotifications([]);
      })
      .catch((error) => {
        console.error("Error deleting notifications:", error);
      });
  };

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prevSelected) =>
      prevSelected.includes(notificationId)
        ? prevSelected.filter((id) => id !== notificationId)
        : [...prevSelected, notificationId]
    );
  };

  return (
    <div className="notification">
      <div
        className="notification_parent"
        style={{ borderRight: "1px solid #00000073" }}
      >
        <div className="buttons">
          <button onClick={markAllAsViewed}>Mark All as Viewed</button>
          <button onClick={deleteSelectedNotifications}>
            Delete Selected Notifications
          </button>
        </div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.notificationId}
              style={
                notification.vuenotification
                  ? { background: "transparent" }
                  : { background: "rgb(235, 232, 232)" }
              }
              className="notification_container"
            >
              <input
                type="checkbox"
                checked={selectedNotifications.includes(
                  notification.notificationId
                )}
                onChange={() =>
                  toggleSelectNotification(notification.notificationId)
                }
                style={{ marginRight: "10px" }}
              />
              {notification.profilePicture ? (
                <img
                  src={notification.profilePicture}
                  alt="Profile"
                  width="40px"
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
              <div className="child_notification">
                <p style={{ margin: "0", fontWeight: "bold" }}>
                  {notification.nickname}
                </p>
                <p style={{ margin: "0" }}>
                  {parseContent(notification.content)}
                </p>
                {notification.postImage && (
                  <img
                    src={notification.postImage}
                    alt="Post"
                    width="50"
                    height="50"
                    style={{ borderRadius: "5px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No notifications</p>
        )}
      </div>
      <div className="search_bar">
        <SearchUser />
      </div>
    </div>
  );
}
