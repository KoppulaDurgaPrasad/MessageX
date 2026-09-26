import { useEffect, useRef, useState } from "react";
import {
  FaPlus,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaEye,
  FaPlay,
} from "react-icons/fa";

import Sidebar from "../../components/Sidebar/Sidebar";

import "./Status.css";

const API_URL = import.meta.env.VITE_API_URL;

function Status() {
  const [currentUser, setCurrentUser] = useState(null);

  const [myStatuses, setMyStatuses] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [showUpload, setShowUpload] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [caption, setCaption] = useState("");

  const [uploading, setUploading] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);

  const [selectedUserStatuses, setSelectedUserStatuses] = useState([]);

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const [viewers, setViewers] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [statusToDelete, setStatusToDelete] = useState(null);

  const fileInputRef = useRef(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  const loadStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load statuses");
      }

      const data = await response.json();

      setStatuses(data);
    } catch (error) {
      console.error("Error loading statuses:", error);
    }
  };

  const loadMyStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load my statuses");
      }

      const data = await response.json();

      setMyStatuses(data);
    } catch (error) {
      console.error("Error loading my statuses:", error);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    loadStatuses();
    loadMyStatuses();
  }, [accessToken]);

  const groupedStatuses = statuses.reduce((groups, status) => {
    if (!groups[status.userId]) {
      groups[status.userId] = {
        userId: status.userId,
        username: status.username,
        profilePicture: status.profilePicture,
        statuses: [],
      };
    }

    groups[status.userId].statuses.push(status);

    return groups;
  }, {});

  const otherUsers = Object.values(groupedStatuses);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const images = files.filter((file) => file.type.startsWith("image/"));

    const videos = files.filter((file) => file.type.startsWith("video/"));

    const invalidFiles = files.filter(
      (file) =>
        !file.type.startsWith("image/") && !file.type.startsWith("video/"),
    );

    if (invalidFiles.length > 0) {
      alert("Only images and videos are allowed.");
      event.target.value = "";
      return;
    }

    for (const video of videos) {
      const isValid = await validateVideoDuration(video);

      if (!isValid) {
        alert(`Video "${video.name}" must be 1 minute or less.`);

        event.target.value = "";
        return;
      }
    }

    if (videos.length > 1) {
      alert("You can upload only one video at a time.");

      event.target.value = "";
      return;
    }

    if (videos.length > 0 && images.length > 0) {
      alert("Upload either images or a video, not both together.");

      event.target.value = "";
      return;
    }

    setSelectedFiles(files);
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");

      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);

        resolve(video.duration <= 60);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);

        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const handleUploadStatus = async () => {
    if (!selectedFiles.length) {
      alert("Please select an image or video.");
      return;
    }

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("folder", "status");

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Media upload failed");
        }

        const mediaUrl = await uploadResponse.text();

        const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

        const statusResponse = await fetch(`${API_URL}/api/status`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mediaUrl: mediaUrl,
            caption: caption.trim() || null,
            type: type,
          }),
        });

        if (!statusResponse.ok) {
          throw new Error("Status creation failed");
        }
      }

      setSelectedFiles([]);
      setCaption("");
      setShowUpload(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadMyStatuses();
      await loadStatuses();
    } catch (error) {
      console.error("Status upload error:", error);

      alert("Failed to upload status.");
    } finally {
      setUploading(false);
    }
  };

  const openStatus = async (userStatuses) => {
    if (!userStatuses.length) return;

    setSelectedUserStatuses(userStatuses);
    setCurrentStatusIndex(0);
    setViewerOpen(true);

    await markStatusViewed(userStatuses[0]);
  };

  const markStatusViewed = async (status) => {
    if (!status) return;

    try {
      await fetch(`${API_URL}/api/status/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId: status.statusId,
        }),
      });

      setStatuses((prev) =>
        prev.map((item) =>
          item.statusId === status.statusId ? { ...item, viewed: true } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark status viewed:", error);
    }
  };

  const nextStatus = async () => {
    if (currentStatusIndex >= selectedUserStatuses.length - 1) {
      closeViewer();
      return;
    }

    const nextIndex = currentStatusIndex + 1;

    setCurrentStatusIndex(nextIndex);

    await markStatusViewed(selectedUserStatuses[nextIndex]);
  };

  const previousStatus = async () => {
    if (currentStatusIndex <= 0) {
      return;
    }

    const previousIndex = currentStatusIndex - 1;

    setCurrentStatusIndex(previousIndex);

    await markStatusViewed(selectedUserStatuses[previousIndex]);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedUserStatuses([]);
    setCurrentStatusIndex(0);
  };

  const loadViewers = async (statusId) => {
    try {
      const response = await fetch(`${API_URL}/api/status/${statusId}/views`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load viewers");
      }

      const data = await response.json();

      setViewers(data);
    } catch (error) {
      console.error("Error loading viewers:", error);
    }
  };

  const deleteStatus = (statusId) => {
    setStatusToDelete(statusId);
    setShowDeleteModal(true);
  };

  const confirmDeleteStatus = async () => {
    if (!statusToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/status/${statusToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete status");
      }

      setShowDeleteModal(false);
      setStatusToDelete(null);

      await loadMyStatuses();
      await loadStatuses();

      setViewers([]);
    } catch (error) {
      console.error("Delete status error:", error);
    }
  };

  const currentStatus = selectedUserStatuses[currentStatusIndex];

  return (
    <div className="status-page">
      <Sidebar currentUser={currentUser} />

      <div className="status-content">
        <div className="status-header">
          <div>
            <h1>Status</h1>
            <p>Share photos and videos that disappear after 24 hours.</p>
          </div>

          <button
            className="add-status-header-btn"
            onClick={() => setShowUpload(true)}
          >
            <FaPlus />
            Add Status
          </button>
        </div>

        <section className="status-section">
          <div className="section-title">
            <h2>My Status</h2>
          </div>

          <div className="my-status-card">
            <div className="my-status-avatar-wrapper">
              <img
                src={currentUser?.profilePicture || "/default-avatar.png"}
                alt={currentUser?.username || "Profile"}
                className="status-avatar"
              />

              <button
                className="status-add-circle"
                onClick={() => setShowUpload(true)}
              >
                <FaPlus />
              </button>
            </div>

            <div className="my-status-info">
              <h3>My Status</h3>

              {myStatuses.length === 0 ? (
                <p>Click + to add a status</p>
              ) : (
                <p>
                  {myStatuses.length} status
                  {myStatuses.length !== 1 ? "es" : ""} • Tap to view
                </p>
              )}
            </div>
          </div>

          {myStatuses.length > 0 && (
            <div className="my-status-list">
              {myStatuses.map((status) => (
                <div
                  className="my-status-item"
                  key={status.statusId}
                  onClick={() => {
                    setSelectedUserStatuses(myStatuses);
                    setCurrentStatusIndex(
                      myStatuses.findIndex(
                        (item) => item.statusId === status.statusId,
                      ),
                    );
                    setViewerOpen(true);
                  }}
                >
                  {status.type === "VIDEO" ? (
                    <div className="status-video-thumb">
                      <video src={status.mediaUrl} />
                      <FaPlay />
                    </div>
                  ) : (
                    <img src={status.mediaUrl} alt="" />
                  )}

                  <button
                    className="status-delete-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteStatus(status.statusId);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="status-section">
          <div className="section-title">
            <h2>Recent Updates</h2>
          </div>

          {otherUsers.length === 0 ? (
            <div className="empty-status">
              <div>○</div>
              <h3>No recent updates</h3>
              <p>When your contacts post a status, you'll see it here.</p>
            </div>
          ) : (
            <div className="other-status-list">
              {otherUsers.map((user) => {
                const allViewed = user.statuses.every(
                  (status) => status.viewed,
                );

                const latestStatus = user.statuses[0];

                return (
                  <div
                    className={`other-status-card ${
                      allViewed ? "status-viewed" : "status-unviewed"
                    }`}
                    key={user.userId}
                    onClick={() => openStatus(user.statuses)}
                  >
                    <div className="status-ring">
                      <img
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.username}
                      />
                    </div>

                    <div className="other-status-info">
                      <h3>{user.username}</h3>

                      <p>
                        {user.statuses.length} status
                        {user.statuses.length !== 1 ? "es" : ""} •{" "}
                        {new Date(latestStatus.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showUpload && (
        <div
          className="status-modal-overlay"
          onClick={() => {
            if (!uploading) {
              setShowUpload(false);
            }
          }}
        >
          <div
            className="status-upload-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="status-modal-header">
              <h2>Add Status</h2>

              <button
                onClick={() => {
                  if (!uploading) {
                    setShowUpload(false);
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="status-upload-body">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={handleFileSelect}
              />

              <button
                className="choose-status-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FaPlus />
                Choose Photos / Video
              </button>

              <p className="upload-help">
                You can select multiple images. Videos must be 60 seconds or
                less.
              </p>

              {selectedFiles.length > 0 && (
                <div className="selected-status-files">
                  {selectedFiles.map((file, index) => (
                    <div
                      className="selected-status-file"
                      key={`${file.name}-${index}`}
                    >
                      {file.type.startsWith("video/") ? (
                        <video src={URL.createObjectURL(file)} />
                      ) : (
                        <img src={URL.createObjectURL(file)} alt={file.name} />
                      )}

                      <button onClick={() => removeSelectedFile(index)}>
                        <FaTimes />
                      </button>

                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={500}
                  placeholder="Add a caption..."
                />
              )}
            </div>

            <div className="status-modal-footer">
              <button
                className="cancel-status-btn"
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFiles([]);
                  setCaption("");
                }}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                className="post-status-btn"
                onClick={handleUploadStatus}
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? "Uploading..." : "Post Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerOpen && currentStatus && (
        <div className="status-viewer">
          <div className="status-viewer-top">
            <div className="viewer-user">
              <img
                src={currentStatus.profilePicture || "/default-avatar.png"}
                alt={currentStatus.username}
              />

              <div>
                <h3>{currentStatus.username}</h3>

                <span>
                  {new Date(currentStatus.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <button className="viewer-close-btn" onClick={closeViewer}>
              <FaTimes />
            </button>
          </div>

          <div className="status-viewer-media">
            {currentStatus.type === "VIDEO" ? (
              <video
                src={currentStatus.mediaUrl}
                controls
                autoPlay
                className="viewer-video"
              />
            ) : (
              <img
                src={currentStatus.mediaUrl}
                alt=""
                className="viewer-image"
              />
            )}

            {currentStatus.caption && (
              <div className="viewer-caption">{currentStatus.caption}</div>
            )}
          </div>

          {currentStatusIndex > 0 && (
            <button className="viewer-nav viewer-prev" onClick={previousStatus}>
              <FaChevronLeft />
            </button>
          )}

          {currentStatusIndex < selectedUserStatuses.length - 1 && (
            <button className="viewer-nav viewer-next" onClick={nextStatus}>
              <FaChevronRight />
            </button>
          )}

          <div className="viewer-progress">
            {selectedUserStatuses.map((_, index) => (
              <div
                key={index}
                className={
                  index === currentStatusIndex
                    ? "progress-item active"
                    : index < currentStatusIndex
                      ? "progress-item completed"
                      : "progress-item"
                }
              />
            ))}
          </div>

          {currentStatus.userId === currentUser?.id && (
            <div className="viewer-owner-actions">
              <button onClick={() => loadViewers(currentStatus.statusId)}>
                <FaEye />
                Viewers
              </button>

              <button onClick={() => deleteStatus(currentStatus.statusId)}>
                <FaTrash />
                Delete
              </button>
            </div>
          )}

          {viewers.length > 0 && (
            <div className="viewers-panel">
              <div className="viewers-header">
                <h3>Viewed by {viewers.length}</h3>

                <button onClick={() => setViewers([])}>
                  <FaTimes />
                </button>
              </div>

              {viewers.map((viewer) => (
                <div className="viewer-user-item" key={viewer.viewerId}>
                  <img
                    src={viewer.profilePicture || "/default-avatar.png"}
                    alt={viewer.username}
                  />

                  <div>
                    <strong>{viewer.username}</strong>

                    <span>
                      {new Date(viewer.viewedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => {
            setShowDeleteModal(false);
            setStatusToDelete(null);
          }}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <FaTrash />
            </div>

            <h3>Delete status?</h3>

            <p>This status will be permanently deleted.</p>

            <div className="delete-modal-actions">
              <button
                className="delete-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStatusToDelete(null);
                }}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={confirmDeleteStatus}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Status;
