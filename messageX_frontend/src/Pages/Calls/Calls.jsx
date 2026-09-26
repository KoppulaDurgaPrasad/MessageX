import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getMyCalls } from "../../api/callApi";
import "./Calls.css";

function Calls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true);

        const data = await getMyCalls(token);

        setCalls(data || []);
      } catch (err) {
        console.error("Failed to load calls:", err);
        setError("Failed to load call history.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadCalls();
    } else {
      setLoading(false);
      setError("You are not logged in.");
    }
  }, [token]);

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCallDate = (call) => {
    return call.startedAt || call.endedAt;
  };

  const getCallIcon = (call) => {
    if (call.type === "VIDEO") {
      return "📹";
    }

    return "📞";
  };

  const getDirection = (call) => {
    if (!currentUser) return "";

    return call.initiatorId === currentUser.id ? "Outgoing" : "Incoming";
  };

  return (
    <div className="calls-page">
      <Sidebar currentUser={currentUser} />

      <main className="calls-content">
        <div className="calls-header">
          <div>
            <h1>Calls</h1>
            <p>Your call history</p>
          </div>
        </div>

        {loading && (
          <div className="calls-message">Loading call history...</div>
        )}

        {!loading && error && (
          <div className="calls-message error">{error}</div>
        )}

        {!loading && !error && calls.length === 0 && (
          <div className="calls-empty">
            <div className="calls-empty-icon">📞</div>
            <h3>No calls yet</h3>
            <p>Your call history will appear here.</p>
          </div>
        )}

        {!loading && !error && calls.length > 0 && (
          <div className="calls-list">
            {calls.map((call) => {
              const callDate = getCallDate(call);
              const direction = getDirection(call);

              return (
                <div className="call-card" key={call.callId}>
                  <img
                    src={
                      call.participantProfilePicture || "/default-avatar.png"
                    }
                    alt={call.participantName || "User"}
                    className="call-avatar"
                  />

                  <div className="call-info">
                    <div className="call-name-row">
                      <h3>{call.participantName || "Unknown User"}</h3>

                      <span className="call-type">
                        {getCallIcon(call)}
                        {call.type}
                      </span>
                    </div>

                    <div className="call-details">
                      <span
                        className={
                          direction === "Outgoing"
                            ? "call-direction outgoing"
                            : "call-direction incoming"
                        }
                      >
                        {direction}
                      </span>

                      <span>•</span>

                      <span>{call.status}</span>

                      <span>•</span>

                      <span>{formatDate(callDate)}</span>

                      <span>•</span>

                      <span>{formatTime(callDate)}</span>
                    </div>
                  </div>

                  <div className="call-duration">
                    <span>Duration</span>
                    <strong>{formatDuration(call.durationSeconds)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Calls;
