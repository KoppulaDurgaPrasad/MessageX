import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaUsers, FaSearch, FaTimes, FaCheck } from "react-icons/fa";

import Sidebar from "../../components/Sidebar/Sidebar";
import { getMyChats, createGroup } from "../../api/chatApi";
import { searchUsers } from "../../api/userApi";
import "./Groups.css";

function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const chats = await getMyChats(token);

      const groupChats = (chats || []).filter(
        (chat) => chat.chatType === "GROUP",
      );

      setGroups(groupChats);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showCreateModal) return;

    const keyword = userSearch.trim();

    if (!keyword) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setUsersLoading(true);

        const data = await searchUsers(keyword);

        const availableUsers = (data || []).filter(
          (user) => user.id !== currentUser?.id,
        );

        setUsers(availableUsers);
      } catch (err) {
        console.error("Failed to search users:", err);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, showCreateModal]);

  const openCreateModal = () => {
    setGroupName("");
    setDescription("");
    setGroupImage("");
    setSelectedUsers([]);
    setUserSearch("");
    setError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);
    setError("");
  };

  const toggleUser = (userId) => {
    setSelectedUsers((previous) => {
      if (previous.includes(userId)) {
        return previous.filter((id) => id !== userId);
      }

      return [...previous, userId];
    });
  };

  const createGroupHandler = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one member.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const newGroup = await createGroup({
        name: groupName.trim(),
        image: groupImage.trim() || null,
        description: description.trim() || null,
        memberIds: selectedUsers,
      });

      setGroups((previous) => [newGroup, ...previous]);

      setShowCreateModal(false);

      setGroupName("");
      setDescription("");
      setGroupImage("");
      setSelectedUsers([]);
      setUserSearch("");
      setUsers([]);
    } catch (err) {
      console.error("Create group failed:", err);
      setError(err.message || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <div className="groups-page">
      <Sidebar currentUser={currentUser} />

      <main className="groups-content">
        <div className="groups-header">
          <div>
            <h1>Groups</h1>
            <p>Manage your group conversations</p>
          </div>

          <button className="create-group-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>New Group</span>
          </button>
        </div>
        <div className="groups-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="groups-message">Loading groups...</div>}

        {!loading && error && !showCreateModal && (
          <div className="groups-message error">{error}</div>
        )}

        {!loading && !error && filteredGroups.length === 0 && (
          <div className="groups-empty">
            <div className="groups-empty-icon">
              <FaUsers />
            </div>

            <h3>No groups found</h3>

            <p>Create a group to start chatting with multiple people.</p>
          </div>
        )}

        {!loading && !error && filteredGroups.length > 0 && (
          <div className="groups-list">
            {filteredGroups.map((group) => (
              <div
                className="group-card"
                key={group.chatRoomId}
                onClick={() =>
                  navigate("/chat", {
                    state: { selectedChat: group },
                  })
                }
              >
                <img
                  src={group.image || "/default-group.png"}
                  alt={group.name}
                  className="group-avatar"
                />

                <div className="group-info">
                  <h3>{group.name}</h3>

                  <p>{group.participantCount || 0} members</p>

                  {group.description && <span>{group.description}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="group-modal-overlay" onClick={closeCreateModal}>
          <div className="group-modal" onClick={(e) => e.stopPropagation()}>
            <div className="group-modal-header">
              <div>
                <h2>Create Group</h2>
                <p>Add people and create a new group</p>
              </div>

              <button className="group-modal-close" onClick={closeCreateModal}>
                <FaTimes />
              </button>
            </div>

            <div className="group-form-group">
              <label>Group Name</label>

              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="group-form-group">
              <label>Description</label>

              <textarea
                placeholder="Enter group description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>

            <div className="group-form-group">
              <label>Group Image URL</label>

              <input
                type="text"
                placeholder="Paste image URL"
                value={groupImage}
                onChange={(e) => setGroupImage(e.target.value)}
              />
            </div>

            <div className="group-members-section">
              <div className="group-members-header">
                <label>Select Members</label>

                <span>{selectedUsers.length} selected</span>
              </div>

              <div className="member-search">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="members-list">
                {usersLoading && (
                  <div className="member-message">Loading users...</div>
                )}

                {!usersLoading && !userSearch.trim() && (
                  <div className="member-message">
                    Search for users to add them.
                  </div>
                )}

                {!usersLoading &&
                  userSearch.trim() &&
                  filteredUsers.length === 0 && (
                    <div className="member-message">No users found.</div>
                  )}

                {!usersLoading &&
                  filteredUsers.map((user) => {
                    const selected = selectedUsers.includes(user.id);

                    return (
                      <div
                        key={user.id}
                        className={
                          selected ? "member-item selected" : "member-item"
                        }
                        onClick={() => toggleUser(user.id)}
                      >
                        <img
                          src={user.profilePicture || "/default-avatar.png"}
                          alt={user.username}
                        />

                        <div className="member-info">
                          <strong>{user.username}</strong>

                          {user.email && <span>{user.email}</span>}
                        </div>

                        <div
                          className={
                            selected ? "member-check selected" : "member-check"
                          }
                        >
                          {selected && <FaCheck />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {error && <div className="group-modal-error">{error}</div>}

            <div className="group-modal-footer">
              <button
                className="cancel-group-btn"
                onClick={closeCreateModal}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                className="confirm-group-btn"
                onClick={createGroupHandler}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
