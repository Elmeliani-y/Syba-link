import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../style/Message.css";

function ChatList({ recieverId, profilepic }) {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const userId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:3005/getChats", {
          params: {
            userId: userId,
            friendId: recieverId,
          },
          withCredentials: true,
        });

        console.log("Response from server:", response.data);

        const updatedChats = response.data.map((chat) => {
          console.log("Fetched chat:", chat);
          return {
            ...chat,
          };
        });

        setChats(updatedChats);
        console.log("Updated chats state:", updatedChats);

        markMessagesAsSeen(
          updatedChats
            .filter((chat) => chat.receiverId === userId && !chat.is_seen)
            .map((chat) => chat.id)
        );
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (userId && recieverId && recieverId !== "undefined") {
      fetchChats();
    } else {
      console.log("fetchChats not called due to missing userId or recieverId");
    }
  }, [userId, recieverId]);

  const markMessagesAsSeen = async (messageIds) => {
    try {
      await axios.post(
        "http://localhost:3005/markAsSeen",
        { messageIds },
        {
          withCredentials: true,
        }
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          messageIds.includes(chat.id) ? { ...chat, is_seen: true } : chat
        )
      );
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called");

    if (recieverId && recieverId !== "undefined") {
      const newMessage = {
        senderId: userId,
        receiverId: recieverId,
        content: message,
        dateSent: new Date().toISOString(),
      };

      try {
        await axios.post("http://localhost:3005/sendChat", newMessage, {
          withCredentials: true,
        });

        setChats([
          ...chats,
          {
            ...newMessage,
            isSentByUser: true,
            is_seen: false,
          },
        ]);
        setMessage("");
        console.log("Sent message:", newMessage);
      } catch (error) {
        console.error("Error sending chat:", error);
      }
    } else {
      console.log("Message not sent due to missing recieverId");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const dayName = date.toLocaleString("default", { weekday: "long" });
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${dayName}, ${day}-${month}-${year}`;
  };

  const renderStatus = (chat) => {
    if (chat.senderId === userId) {
      if (chat.is_seen) {
        return <span className="status">Seen</span>;
      } else {
        return <span className="status">Delivered</span>;
      }
    } else {
      return null;
    }
  };

  const shouldDisplayDateSeparator = (currentChat, previousChat) => {
    const currentDate = new Date(currentChat.dateSent).toDateString();
    const previousDate = previousChat
      ? new Date(previousChat.dateSent).toDateString()
      : null;
    return currentDate !== previousDate;
  };

  return (
    <div className="chat-container">
      {chats.map((chat, index) => (
        <React.Fragment key={index}>
          {shouldDisplayDateSeparator(chat, chats[index - 1]) && (
            <div className="date-separator">{formatDate(chat.dateSent)}</div>
          )}
          <div
            className={`${chat.senderId === userId ? "sender" : "receiver"}`}
          >
            <p>{chat.content}</p>
            <span className="timestamp">{formatTime(chat.dateSent)}</span>
            {renderStatus(chat)}
          </div>
        </React.Fragment>
      ))}
      <form onSubmit={handleSubmit} className="formsend">
        <input
          type="text"
          placeholder="Send message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="submit" value="Send" />
      </form>
    </div>
  );
}

export default ChatList;
