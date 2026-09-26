import { useState, useRef, useEffect } from "react";

import {
  FaPhoneAlt,
  FaVideo,
  FaEllipsisV,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "./ChatWindow.css";
import EmojiPicker from "emoji-picker-react";
import { uploadDocument } from "../../api/messageApi";
import {
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  deleteGroup,
  getChatParticipants,
} from "../../api/chatApi";
import { searchUsers } from "../../api/userApi";

function ChatWindow({
  currentUser,
  selectedChat,
  messages,
  stompClientRef,
  onDeleteForMe,
  onStartCall,
  groupParticipants,
}) {
  const [content, setContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const fileInputRef = useRef(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);

  const handleSendMessage = () => {
    if (!selectedChat) return;

    if (!content.trim()) return;

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    const message = {
      chatRoomId: selectedChat.chatRoomId,
      content: content.trim(),
      mediaUrl: null,
      type: "TEXT",
    };

    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
    });

    setContent("");
  };

  const handleEditStart = (message) => {
    setEditingMessageId(message.messageId);
    setEditingContent(message.content);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditSave = () => {
    if (!selectedChat) return;

    if (!editingContent.trim()) return;

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    const request = {
      messageId: editingMessageId,
      chatRoomId: selectedChat.chatRoomId,
      content: editingContent.trim(),
    };

    client.publish({
      destination: "/app/chat.editMessage",
      body: JSON.stringify(request),
    });

    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleMessageClick = (messageId) => {
    if (editingMessageId) return;

    setActiveMenuMessageId((prev) => (prev === messageId ? null : messageId));
  };

  const handleDeleteForMe = (message) => {
    if (!selectedChat) return;

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    const request = {
      messageId: message.messageId,
    };

    client.publish({
      destination: "/app/chat.deleteForMe",
      body: JSON.stringify(request),
    });
    if (onDeleteForMe) {
      onDeleteForMe(message.messageId);
    }
  };

  const handleDeleteForEveryone = (message) => {
    if (!selectedChat) return;

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    const request = {
      messageId: message.messageId,
    };

    client.publish({
      destination: "/app/chat.deleteForEveryone",
      body: JSON.stringify(request),
    });
  };

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDocumentChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !selectedChat) return;

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    try {
      console.log("Uploading:", file.name);

      const mediaUrl = await uploadDocument(file);

      const message = {
        chatRoomId: selectedChat.chatRoomId,
        content: file.name,
        mediaUrl: mediaUrl,
        fileName: file.name,
        type: "DOCUMENT",
      };

      client.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
      });

      console.log("Document sent:", file.name);
    } catch (error) {
      console.error("Document upload failed:", error);
    } finally {
      event.target.value = "";
    }
  };

  const isGroup = selectedChat?.chatType === "GROUP";

  const currentGroupParticipant = groupParticipants?.find(
    (participant) => participant.userId === currentUser?.id,
  );

  const isGroupAdmin =
    currentGroupParticipant?.admin === true ||
    currentGroupParticipant?.isAdmin === true ||
    currentGroupParticipant?.role === "ADMIN";

  const handleLeaveGroup = () => {
    if (!selectedChat?.chatRoomId) return;

    setShowLeaveGroupModal(true);
  };

  const confirmLeaveGroup = async () => {
    if (!selectedChat?.chatRoomId) return;

    try {
      await leaveGroup(selectedChat.chatRoomId);

      setShowLeaveGroupModal(false);
      setShowChatMenu(false);

      window.location.reload();
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  useEffect(() => {
    if (!showAddMember || !memberSearch.trim()) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(memberSearch.trim());
        const existingIds = new Set(
          (groupParticipants || []).map((member) => member.userId),
        );

        const filtered = results.filter((user) => !existingIds.has(user.id));

        setUserResults(filtered);
        setAddMemberError("");
      } catch (error) {
        console.error("Failed to search users:", error);
        setUserResults([]);
        setAddMemberError("Failed to search users");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [showAddMember, memberSearch, groupParticipants]);

  const handleAddMember = async (userId) => {
    if (!selectedChat?.chatRoomId) return;

    try {
      setAddingMember(true);
      setAddMemberError("");

      await addGroupMember(selectedChat.chatRoomId, userId);

      const updatedParticipants = await getChatParticipants(
        selectedChat.chatRoomId,
      );

      setMemberSearch("");
      setUserResults([]);
      setShowAddMember(false);

      alert("Member added successfully.");
    } catch (error) {
      console.error("Failed to add member:", error);
      setAddMemberError(error.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (userId, username) => {
    if (!selectedChat?.chatRoomId) return;

    setMemberToRemove({
      userId,
      username,
    });

    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !selectedChat?.chatRoomId) return;

    try {
      await removeGroupMember(selectedChat.chatRoomId, memberToRemove.userId);

      setShowRemoveModal(false);
      setMemberToRemove(null);
      setShowGroupMembers(false);
      setShowChatMenu(false);

      window.location.reload();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleDeleteGroup = () => {
    if (!selectedChat?.chatRoomId) return;

    setShowDeleteGroupModal(true);
  };

  const confirmDeleteGroup = async () => {
    if (!selectedChat?.chatRoomId) return;

    try {
      await deleteGroup(selectedChat.chatRoomId);

      setShowDeleteGroupModal(false);
      setShowChatMenu(false);

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-user">
          <img
            src={selectedChat?.image || "/Logo.png"}
            alt={selectedChat?.name}
          />

          <div>
            <h5>{selectedChat?.name || "Select a Chat"}</h5>
          </div>
        </div>

        <div className="chat-actions">
          {!isGroup && (
            <>
              <FaPhoneAlt
                onClick={() => onStartCall?.("VOICE")}
                title="Voice call"
              />

              <FaVideo
                onClick={() => onStartCall?.("VIDEO")}
                title="Video call"
              />
            </>
          )}

          {isGroup && (
            <div className="chat-menu-container">
              <FaEllipsisV
                onClick={() => setShowChatMenu((prev) => !prev)}
                title="More options"
              />

              {showChatMenu && (
                <div className="chat-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupMembers(true);
                      setShowChatMenu(false);
                    }}
                  >
                    Group Members
                  </button>

                  {isGroupAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMember(true);
                          setShowChatMenu(false);
                          setMemberSearch("");
                          setUserResults([]);
                          setAddMemberError("");
                        }}
                      >
                        Add Member
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowChatMenu(false);
                          setShowGroupMembers(true);
                        }}
                      >
                        Remove Member
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={handleDeleteGroup}
                      >
                        Delete Group
                      </button>
                    </>
                  )}

                  <button type="button" onClick={handleLeaveGroup}>
                    Leave Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showGroupMembers && isGroup && (
        <div
          className="group-members-overlay"
          onClick={() => setShowGroupMembers(false)}
        >
          <div
            className="group-members-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="group-members-modal-header">
              <div>
                <h3>Group Members</h3>
                <span>{groupParticipants?.length || 0} members</span>
              </div>

              <button type="button" onClick={() => setShowGroupMembers(false)}>
                ×
              </button>
            </div>

            <div className="group-members-list">
              {groupParticipants?.map((participant) => (
                <div
                  className="group-member-item"
                  key={participant.userId}
                  onClick={() => {
                    if (participant.userId !== currentUser?.id) {
                      handleRemoveMember(
                        participant.userId,
                        participant.username,
                      );
                    }
                  }}
                  style={{
                    cursor:
                      participant.userId === currentUser?.id
                        ? "default"
                        : "pointer",
                  }}
                >
                  <img
                    src={participant.profilePicture || "/default-avatar.png"}
                    alt={participant.username}
                  />

                  <div className="group-member-info">
                    <strong>
                      {participant.username}
                      {participant.userId === currentUser?.id ? " (You)" : ""}
                    </strong>

                    {(participant.admin === true ||
                      participant.isAdmin === true ||
                      participant.role === "ADMIN") && <span>Admin</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddMember && isGroup && (
        <div
          className="group-members-overlay"
          onClick={() => setShowAddMember(false)}
        >
          <div
            className="group-members-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="group-members-modal-header">
              <div>
                <h3>Add Member</h3>
                <span>Search for a user to add</span>
              </div>

              <button type="button" onClick={() => setShowAddMember(false)}>
                ×
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              <input
                type="text"
                placeholder="Search users..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />

              {addMemberError && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "13px",
                    marginTop: "10px",
                  }}
                >
                  {addMemberError}
                </p>
              )}

              <div className="group-members-list">
                {userResults.length === 0 && memberSearch.trim() && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      padding: "20px 0",
                    }}
                  >
                    No users found
                  </p>
                )}

                {userResults.map((user) => (
                  <div
                    className="group-member-item"
                    key={user.id}
                    onClick={() => !addingMember && handleAddMember(user.id)}
                    style={{
                      cursor: addingMember ? "not-allowed" : "pointer",
                    }}
                  >
                    <img
                      src={user.profilePicture || "/default-avatar.png"}
                      alt={user.username}
                    />

                    <div className="group-member-info">
                      <strong>{user.username}</strong>
                      {user.email && <span>{user.email}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {addingMember && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6a38ff",
                    fontSize: "13px",
                    marginTop: "10px",
                  }}
                >
                  Adding member...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.messageId}
              className={`message ${
                message.senderId === currentUser?.id ? "sent" : "received"
              }`}
            >
              <div
                className={`bubble ${
                  message.deletedForEveryone ? "deleted-bubble" : ""
                }`}
                onClick={() => handleMessageClick(message.messageId)}
              >
                {message.deletedForEveryone ? (
                  <p className="deleted-message-text">
                    This message was deleted.
                  </p>
                ) : (
                  <>
                    {message.type === "TEXT" && (
                      <>
                        {editingMessageId === message.messageId ? (
                          <div className="edit-message">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleEditSave();
                                }

                                if (e.key === "Escape") {
                                  handleEditCancel();
                                }
                              }}
                              autoFocus
                            />

                            <div className="edit-actions">
                              <button type="button" onClick={handleEditSave}>
                                Save
                              </button>

                              <button type="button" onClick={handleEditCancel}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p>
                            {message.content}

                            {message.edited && (
                              <small className="edited-label"> (edited)</small>
                            )}
                          </p>
                        )}
                      </>
                    )}
                    {message.type === "IMAGE" && (
                      <img
                        src={message.mediaUrl}
                        alt=""
                        className="message-image"
                      />
                    )}
                    {message.type === "VIDEO" && (
                      <video controls className="message-video">
                        <source src={message.mediaUrl} />
                      </video>
                    )}

                    {message.type === "DOCUMENT" && (
                      <a
                        href={message.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="document-link"
                      >
                        📄 {message.fileName}
                      </a>
                    )}
                  </>
                )}

                {activeMenuMessageId === message.messageId && (
                  <div
                    className="message-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {message.senderId === currentUser?.id &&
                      !message.deletedForEveryone && (
                        <button
                          type="button"
                          className="menu-item"
                          onClick={() => {
                            handleEditStart(message);
                            setActiveMenuMessageId(null);
                          }}
                        >
                          <FaEdit className="menu-icon" />
                          <span>Edit</span>
                        </button>
                      )}
                    <button
                      type="button"
                      className="menu-item delete-item"
                      onClick={() => {
                        handleDeleteForMe(message);
                        setActiveMenuMessageId(null);
                      }}
                    >
                      <FaTrash className="menu-icon" />
                      <span>Delete for me</span>
                    </button>

                    {message.senderId === currentUser?.id &&
                      !message.deletedForEveryone && (
                        <button
                          type="button"
                          className="menu-item delete-item"
                          onClick={() => {
                            handleDeleteForEveryone(message);
                            setActiveMenuMessageId(null);
                          }}
                        >
                          <FaTrash className="menu-icon" />
                          <span>Delete for everyone</span>
                        </button>
                      )}
                  </div>
                )}

                <span>
                  {new Date(message.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <div className="emoji-container">
          <FaSmile
            className="input-icon"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />

          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={420}
                height={500}
                emojiStyle="native"
                searchPlaceHolder="Search emojis..."
                previewConfig={{
                  showPreview: true,
                }}
              />
            </div>
          )}
        </div>

        <FaPaperclip className="input-icon" onClick={handleFileClick} />

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleDocumentChange}
        />

        <input
          type="text"
          placeholder={
            selectedChat ? "Type a message..." : "Select a chat first"
          }
          value={content}
          disabled={!selectedChat}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!selectedChat || !content.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
      {showRemoveModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            setShowRemoveModal(false);
            setMemberToRemove(null);
          }}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>

            <h3>Remove member?</h3>

            <p>{memberToRemove?.username} will be removed from this group.</p>

            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={confirmRemoveMember}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteGroupModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteGroupModal(false)}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>

            <h3>Delete group?</h3>

            <p>This group will be permanently deleted.</p>

            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => setShowDeleteGroupModal(false)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={confirmDeleteGroup}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showLeaveGroupModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowLeaveGroupModal(false)}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>

            <h3>Leave group?</h3>

            <p>You will no longer be a member of this group.</p>

            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => setShowLeaveGroupModal(false)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={confirmLeaveGroup}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
