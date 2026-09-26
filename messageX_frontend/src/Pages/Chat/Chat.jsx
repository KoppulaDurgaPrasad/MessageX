import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import { getCurrentUser } from "../../api/userApi";
import {
  getMyChats,
  createPrivateChat,
  getChatParticipants,
} from "../../api/chatApi";
import { getMessages } from "../../api/messageApi";
import NewChatModal from "../../components/NewChatModal/NewChatModal";
import { createWebSocketClient } from "../../api/webSocket";
import { CallManager } from "../../api/callManager";
import { toast } from "sonner";

import "./Chat.css";

function Chat() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const callManagerRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [callTarget, setCallTarget] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    const client = createWebSocketClient(token);

    client.onConnect = () => {
      console.log("WebSocket connected");

      stompClientRef.current = client;
      setWsConnected(true);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
    };

    client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };

    client.activate();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (callManagerRef.current) {
        callManagerRef.current.destroy();
        callManagerRef.current = null;
      }

      client.deactivate();

      stompClientRef.current = null;
      setWsConnected(false);
    };
  }, []);

  useEffect(() => {
    const loadGroupParticipants = async () => {
      if (!selectedChat || selectedChat.chatType !== "GROUP") {
        setGroupParticipants([]);
        return;
      }

      try {
        const participants = await getChatParticipants(selectedChat.chatRoomId);

        setGroupParticipants(participants);
      } catch (error) {
        console.error("Failed to load group participants:", error);
        setGroupParticipants([]);
      }
    };

    loadGroupParticipants();
  }, [selectedChat]);

  useEffect(() => {
    if (!wsConnected) {
      return;
    }

    if (!currentUser) {
      return;
    }

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      return;
    }

    const manager = new CallManager({
      stompClient: client,
      currentUserId: currentUser.id,

      onIncomingCall: (call) => {
        console.log("Incoming call:", call);

        setIncomingCall(call);

        setCallTarget({
          userId: call.callerId,
          username: call.callerName || "User",
          profilePicture: call.profilePicture || "/Logo.png",
          type: call.callType,
        });

        setCallState("incoming");
      },

      onLocalStream: (stream) => {
        setLocalStream(stream);
      },

      onRemoteStream: (stream) => {
        setRemoteStream(stream);
      },

      onCallStateChange: (state) => {
        console.log("Call state:", state);

        setCallState(state);

        if (state === "rejected") {
          setIncomingCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          setCallDuration(0);

          setTimeout(() => {
            setCallState("idle");
            setCallTarget(null);
          }, 2000);

          return;
        }

        if (state === "cancelled") {
          setIncomingCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          setCallDuration(0);

          setTimeout(() => {
            setCallState("idle");
            setCallTarget(null);
          }, 1500);

          return;
        }

        if (state === "ended") {
          setIncomingCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          setCallDuration(0);

          setTimeout(() => {
            setCallState("idle");
            setCallTarget(null);
          }, 1000);
        }
      },
    });

    callManagerRef.current = manager;

    manager.subscribeToCalls();

    return () => {
      manager.destroy();
      callManagerRef.current = null;
    };
  }, [wsConnected, currentUser]);

  useEffect(() => {
    if (!wsConnected) {
      return;
    }

    if (!selectedChat) {
      return;
    }

    const client = stompClientRef.current;

    if (!client || !client.connected) {
      return;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const destination = `/topic/chat/${selectedChat.chatRoomId}`;

    subscriptionRef.current = client.subscribe(destination, (message) => {
      const newMessage = JSON.parse(message.body);

      console.log("Received WebSocket message:", newMessage);

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (msg) => msg.messageId === newMessage.messageId,
        );

        if (existingIndex === -1) {
          return [...prev, newMessage];
        }
        const updatedMessages = [...prev];
        updatedMessages[existingIndex] = newMessage;

        return updatedMessages;
      });
    });

    console.log("Subscribed to:", destination);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [selectedChat, wsConnected]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        const chats = await getMyChats();
        setChatRooms(chats);

        if (location.state?.selectedChat) {
          setSelectedChat(location.state.selectedChat);
        } else if (chats.length > 0) {
          setSelectedChat(chats[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [location.state]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedChat.chatRoomId);
        setMessages(data);
      } catch (error) {
        console.error(error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (callState !== "ongoing") {
      return;
    }

    setCallDuration(0);

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [callState]);

  useEffect(() => {
    if (callState === "ongoing" && localVideoRef.current && localStream) {
      const video = localVideoRef.current;

      console.log("[VIDEO] Attaching LOCAL stream");

      video.srcObject = localStream;

      video.play().catch((error) => {
        console.error("[VIDEO] Local video play failed:", error);
      });
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (callState !== "ongoing") return;
    if (!remoteStream) return;

    console.log("========== ATTACHING REMOTE MEDIA ==========");
    console.log("[MEDIA] Remote stream:", remoteStream);
    console.log("[MEDIA] Active:", remoteStream.active);
    console.log("[MEDIA] Audio tracks:", remoteStream.getAudioTracks());
    console.log("[MEDIA] Video tracks:", remoteStream.getVideoTracks());

    if (remoteVideoRef.current) {
      const video = remoteVideoRef.current;

      video.srcObject = remoteStream;
      video.muted = false;
      video.volume = 1;

      console.log("[MEDIA] Video srcObject assigned");

      video.onloadedmetadata = () => {
        console.log(
          "[MEDIA] Video metadata:",
          video.videoWidth,
          "x",
          video.videoHeight,
        );

        video
          .play()
          .then(() => {
            console.log("[MEDIA] Remote video PLAYING");
          })
          .catch((error) => {
            console.error("[MEDIA] Remote video play failed:", error);
          });
      };

      video.play().catch(() => {});
    }

    if (remoteAudioRef.current) {
      const audio = remoteAudioRef.current;

      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.muted = false;
      audio.volume = 1;

      console.log("[MEDIA] Audio srcObject assigned");

      audio
        .play()
        .then(() => {
          console.log("[MEDIA] Remote audio PLAYING");
        })
        .catch((error) => {
          console.error("[MEDIA] Remote audio play failed:", error);
        });
    }
  }, [remoteStream, callState]);

  const handleSelectUser = async (user) => {
    try {
      const chat = await createPrivateChat(user.id);

      setChatRooms((prev) => {
        const exists = prev.some((item) => item.chatRoomId === chat.chatRoomId);

        if (exists) {
          return prev;
        }

        return [chat, ...prev];
      });

      setSelectedChat(chat);
      setShowNewChat(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error(error.message || "Failed to create chat");
    }
  };

  const handleDeleteMessageForMe = (messageId) => {
    setMessages((prev) =>
      prev.filter((message) => message.messageId !== messageId),
    );
  };

  const handleStartCall = async (type) => {
    if (!selectedChat) {
      toast.error("Please select a chat");
      return;
    }

    if (!currentUser) {
      toast.error("User information is not loaded");
      return;
    }

    if (!callManagerRef.current) {
      toast.error("Call service is not ready");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      const participants = await getChatParticipants(selectedChat.chatRoomId);

      console.log("Chat participants:", participants);

      const otherParticipant = participants.find(
        (participant) => participant.userId !== currentUser.id,
      );

      if (!otherParticipant) {
        toast.error("Other user not found");
        return;
      }

      setCallTarget({
        ...otherParticipant,
        type,
      });
      setCallState("calling");

      console.log("Starting call:", {
        chatRoomId: selectedChat.chatRoomId,
        receiverId: otherParticipant.userId,
        type,
      });

      await callManagerRef.current.startOutgoingCall({
        chatRoomId: selectedChat.chatRoomId,
        receiverId: otherParticipant.userId,
        type,
        token,
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallState("idle");
      setCallTarget(null);
      setLocalStream(null);
      setRemoteStream(null);
      setCallDuration(0);
      toast.error(error.message || "Failed to start call");
    }
  };

  const handleEndCall = async () => {
    if (!callManagerRef.current) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      if (callState === "ringing" || callState === "calling") {
        await callManagerRef.current.cancelOutgoingCall(token);
      } else {
        await callManagerRef.current.endCurrentCall(token);
      }

      setCallState("idle");
      setCallTarget(null);
      setLocalStream(null);
      setRemoteStream(null);
      setCallDuration(0);
    } catch (error) {
      console.error("Failed to end call:", error);
      toast.error(error.message || "Failed to end call");
    }
  };

  const handleAcceptCall = async () => {
    if (!callManagerRef.current) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      await callManagerRef.current.acceptIncomingCall(token);
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error(error.message || "Failed to accept call");
    }
  };

  const handleRejectCall = async () => {
    if (!callManagerRef.current) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Please login again");
        return;
      }

      await callManagerRef.current.rejectIncomingCall(token);

      setIncomingCall(null);
      setCallTarget(null);
      setCallState("idle");
      setCallDuration(0);
    } catch (error) {
      console.error("Failed to reject call:", error);
      toast.error(error.message || "Failed to reject call");
    }
  };

  const formatCallDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  return (
    <div className="chat-page">
      <Sidebar currentUser={currentUser} />

      <ChatList
        chatRooms={chatRooms}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onNewChat={() => setShowNewChat(true)}
      />

      <ChatWindow
        currentUser={currentUser}
        selectedChat={selectedChat}
        messages={messages}
        stompClientRef={stompClientRef}
        onDeleteForMe={handleDeleteMessageForMe}
        onStartCall={handleStartCall}
        groupParticipants={groupParticipants}
      />
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectUser}
        />
      )}

      {callState === "incoming" && incomingCall && (
        <div className="call-overlay">
          <div className="call-box">
            <div className="call-profile">
              <img
                src={incomingCall.profilePicture || "/Logo.png"}
                alt={incomingCall.callerName || "User"}
              />
            </div>

            <h3>{incomingCall.callerName || "Incoming call"}</h3>

            <p className="call-status">
              Incoming {incomingCall.callType === "VIDEO" ? "video" : "voice"}{" "}
              call
            </p>

            <div className="incoming-call-actions">
              <button
                type="button"
                className="reject-call-button"
                onClick={handleRejectCall}
              >
                ✕ Reject
              </button>

              <button
                type="button"
                className="accept-call-button"
                onClick={handleAcceptCall}
              >
                ✓ Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {(callState === "calling" ||
        callState === "starting" ||
        callState === "ringing") &&
        callTarget && (
          <div className="call-overlay">
            <div className="call-box">
              <div className="call-profile">
                <img
                  src={callTarget.profilePicture || "/Logo.png"}
                  alt={callTarget.username || "User"}
                />
              </div>

              <h3>{callTarget.username || "User"}</h3>

              <p className="call-status">
                {callState === "calling" || callState === "starting"
                  ? "Calling..."
                  : "Ringing..."}
              </p>

              <div className="calling-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <button
                type="button"
                className="cancel-call-button"
                onClick={handleEndCall}
              >
                <span>✕</span>
                Cancel Call
              </button>
            </div>
          </div>
        )}
      {callState === "rejected" && callTarget && (
        <div className="call-overlay">
          <audio ref={remoteAudioRef} autoPlay playsInline controls={false} />
          <div className="call-box">
            <div className="call-profile rejected-profile">
              <img
                src={callTarget.profilePicture || "/Logo.png"}
                alt={callTarget.username || "User"}
              />
            </div>

            <h3>{callTarget.username || "User"}</h3>

            <p className="call-status rejected-status">Call rejected</p>
          </div>
        </div>
      )}

      {callState === "ongoing" && callTarget && (
        <div className="call-overlay">
          {callTarget.type === "VIDEO" ? (
            <div className="video-call-container">
              <video
                ref={remoteVideoRef}
                className="remote-video"
                autoPlay
                playsInline
              />
              <video
                ref={localVideoRef}
                className="local-video"
                autoPlay
                muted
                playsInline
              />
              <div className="video-call-controls">
                <div className="call-duration">
                  {formatCallDuration(callDuration)}
                </div>

                <button
                  type="button"
                  className="end-call-button"
                  onClick={handleEndCall}
                >
                  <span>✕</span>
                  End Call
                </button>
              </div>
            </div>
          ) : (
            <div className="call-box">
              <div className="call-profile">
                <img
                  src={callTarget.profilePicture || "/Logo.png"}
                  alt={callTarget.username || "User"}
                />
              </div>

              <h3>{callTarget.username || "User"}</h3>

              <p className="call-status">Voice call</p>

              <div className="call-duration">
                {formatCallDuration(callDuration)}
              </div>

              <button
                type="button"
                className="end-call-button"
                onClick={handleEndCall}
              >
                <span>✕</span>
                End Call
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;
