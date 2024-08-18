import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/Message.css";
import unknown from "/assets/unknown.png";

function ListeAmis({ onUserSelect }) {
  const [contacts, setContacts] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [statumsg, setStatumsg] = useState();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("http://localhost:3005/friends", {
          withCredentials: true,
        });
        setContacts(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    const statusmsgfunctio = async() => {
       try {
         const response = await axios.get("http://localhost:3005/messageStatus", {
           withCredentials: true
         });

         
           setStatumsg(response.data[0].isseen);
       } catch (error) {
         console.error("Error fetching unread counts:", error);
       }
    }
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get("http://localhost:3005/unreadCounts", {
          params: { userId: userId },
        });

        if (Array.isArray(response.data)) {
          const counts = response.data.reduce((acc, item) => {
            acc[item.senderId] = item.count;
            return acc;
          }, {});
          setUnreadCounts(counts);
          console.log(response.data);
        } else {
          console.error("Invalid response data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };
    statusmsgfunctio();
    fetchContacts();
    fetchUnreadCounts();
  }, [userId]);

  const handleContactClick = async (contact) => {
    try {
      await axios.post(
        "http://localhost:3005/markAsSeen",
        { userId: contact.userId },
        {
          withCredentials: true,
        }
      );

      const updatedContacts = contacts.map((c) => {
        if (c.userId === contact.userId) {
          return { ...c, unreadMessages: 0 };
        }
        return c;
      });
      setContacts(updatedContacts);

      onUserSelect(contact.userId);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  return (
    <div className="liste-amis-container">
      <h2>Liste des contacts</h2>
      <ul>
        {contacts.map((contact) => (
          <div
            className={`lstfreind ${contact.lastMessageStatus ? "" : "online"}`}
            key={contact.id}
            onClick={() => handleContactClick(contact)}
          >
            {contact.profilePicture ? (
              <img src={contact.profilePicture} alt="Profile" width="40px" />
            ) : (
              <img src={unknown} alt="Profile" width="40px" />
            )}
            <p>{contact.nickname}</p>

          </div>
        ))}
      </ul>
    </div>
  );
}

export default ListeAmis;
