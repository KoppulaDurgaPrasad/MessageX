import { FaSearch, FaPlus } from "react-icons/fa";
import "./ChatList.css";

function ChatList({ chatRooms, selectedChat, setSelectedChat, onNewChat }) {
  return (
    <div className="chat-list">
      <div className="chat-header">
        <h3>Chats</h3>

        <button className="new-chat-btn" onClick={onNewChat}>
          <FaPlus />
        </button>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input type="text" placeholder="Search conversations..." />
      </div>

      <div className="chat-items">
        {chatRooms.length === 0 ? (
          <div className="no-chats">
            <p>No conversations yet</p>
          </div>
        ) : (
          chatRooms.map((chat) => (
            <div
              className={`chat-item ${
                selectedChat?.chatRoomId === chat.chatRoomId
                  ? "active-chat"
                  : ""
              }`}
              key={chat.chatRoomId}
              onClick={() => setSelectedChat(chat)}
            >
              <img
                src={chat.image || "/Logo.png"}
                alt={chat.name}
                className="avatar"
              />

              <div className="chat-info">
                <div className="chat-top">
                  <h5>{chat.name}</h5>

                  <span>
                    {chat.lastMessageTime
                      ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                <div className="chat-bottom">
                  <p>{chat.lastMessage || "No messages yet"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
