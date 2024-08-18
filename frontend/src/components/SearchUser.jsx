import React, { useState } from "react";
import axios from "axios";
import unknown from "/assets/unknown.png";
import "../style/SearchUser.css";

export default function SearchUser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() !== "") {
      axios
        .get(`http://localhost:3005/search/users?q=${value}`)
        .then((response) => {
          setSearchResults(response.data);
        })
        .catch((error) => {
          console.error("Error searching users:", error);
        });
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        className="input_search"
        placeholder="Search for friends"
        value={searchTerm}
        onChange={handleSearch}
      />
      <div>
        {searchResults.length > 0
          ? searchResults.map((user) => (
              <a
                key={user.userId}
                href={`/profile/${user.userId}`}
                className="search_info_user"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
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
                <div>
                  <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {user.nickname}
                  </p>
                  <p style={{ fontSize: "12px", color: " rgb(153, 153, 153)" }}>
                    {user.nom} {user.prenom}
                  </p>
                </div>
              </a>
            ))
          : searchTerm && <p>No users found</p>}
      </div>
    </div>
  );
}
