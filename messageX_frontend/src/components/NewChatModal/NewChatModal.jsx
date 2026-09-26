import { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { searchUsers } from "../../api/userApi";
import "./NewChatModal.css";

function NewChatModal({ onClose, onSelectUser }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await searchUsers(keyword.trim());

        setUsers(data);
      } catch (error) {
        console.error("User search failed:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  return (
    <div className="new-chat-overlay" onClick={onClose}>
      <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-chat-header">
          <h3>New Chat</h3>

          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="new-chat-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search by username or phone..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />
        </div>

        <div className="new-chat-results">
          {loading && <p className="search-message">Searching...</p>}

          {!loading && keyword.trim() && users.length === 0 && (
            <p className="search-message">No users found</p>
          )}

          {!keyword.trim() && (
            <p className="search-message">Search for a user to start a chat</p>
          )}

          {!loading &&
            users.map((user) => (
              <div
                key={user.id}
                className="user-result"
                onClick={() => onSelectUser(user)}
              >
                <img
                  src={user.profilePicture || "/default-avatar.png"}
                  alt={user.username}
                />

                <div className="user-result-info">
                  <h5>{user.username}</h5>
                  <span>{user.phoneNumber}</span>
                </div>

                <span
                  className={`online-status ${user.online ? "online" : ""}`}
                >
                  {user.online ? "Online" : "Offline"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
