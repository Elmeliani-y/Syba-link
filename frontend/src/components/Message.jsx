import React, { useState } from "react";
import ListeAmis from "./Messages/listeAmis";
import ChatList from "./Messages/chatlist";

function App() {
  const [selectedUser, setSelectedUser] = useState();
  const [userpic, setUserpic] = useState();

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
  };
  const handleUserpic = (userpic) => {
    setUserpic(userpic);
  };

  return (
    <div className="app-container">
      <ListeAmis onUserSelect={handleUserSelect} onpicSelect={handleUserpic} />
      {selectedUser && (
        <ChatList recieverId={selectedUser} profilepic={userpic} />
      )}
    </div>
  );
}

export default App;
