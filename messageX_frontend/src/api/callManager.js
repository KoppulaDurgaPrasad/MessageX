import {
  createPeerConnection,
  getLocalStream,
  addLocalTracks,
  createOffer,
  handleOffer,
  handleAnswer,
  addIceCandidate,
  closePeerConnection,
} from "./webRTC";

import {
  startCall,
  joinCall,
  endCall,
  rejectCall,
  cancelCall,
} from "./callApi";

export class CallManager {
  constructor({
    stompClient,
    currentUserId,
    onIncomingCall,
    onLocalStream,
    onRemoteStream,
    onCallStateChange,
  }) {
    this.stompClient = stompClient;
    this.currentUserId = currentUserId;

    this.onIncomingCall = onIncomingCall;
    this.onLocalStream = onLocalStream;
    this.onRemoteStream = onRemoteStream;
    this.onCallStateChange = onCallStateChange;

    this.callSubscription = null;

    this.callId = null;
    this.chatRoomId = null;
    this.receiverId = null;
    this.callType = null;

    this.pendingOffer = null;
    this.pendingIceCandidates = [];
  }

  subscribeToCalls() {
    if (!this.stompClient?.connected) {
      console.error("[CALL] WebSocket is not connected.");
      return;
    }

    // Prevent duplicate subscription
    if (this.callSubscription) {
      this.callSubscription.unsubscribe();
    }

    this.callSubscription = this.stompClient.subscribe(
      "/user/queue/call",
      async (message) => {
        try {
          const signal = JSON.parse(message.body);

          console.log("[CALL] Signal received:", signal);

          await this.handleSignal(signal);
        } catch (error) {
          console.error("[CALL] Signal handling error:", error);
        }
      },
    );

    console.log("[CALL] Subscribed to /user/queue/call");
  }

  async startOutgoingCall({ chatRoomId, receiverId, type, token }) {
    try {
      this.chatRoomId = chatRoomId;
      this.receiverId = receiverId;
      this.callType = type;

      this.onCallStateChange?.("starting");

      // 1. Create call in backend
      const call = await startCall(chatRoomId, type, token);

      this.callId = call.callId;

      // 2. Get microphone/camera
      const stream = await getLocalStream(type);

      this.onLocalStream?.(stream);

      // 3. Create WebRTC peer connection
      createPeerConnection({
        onIceCandidate: (candidate) => {
          this.sendSignal({
            action: "ice-candidate",
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          });
        },

        onTrack: (remoteStream) => {
          console.log("[CALL] Remote stream received");
          this.onRemoteStream?.(remoteStream);
        },
      });

      addLocalTracks(stream);
      const offer = await createOffer();
      this.sendSignal({
        action: "offer",
        sdp: offer.sdp,
      });

      this.onCallStateChange?.("ringing");

      console.log("[CALL] Outgoing call started");
    } catch (error) {
      console.error("[CALL] Start call failed:", error);

      this.resetCall();
      this.onCallStateChange?.("error");

      throw error;
    }
  }

  async handleSignal(signal) {
    switch (signal.action) {
      case "offer":
        await this.handleIncomingOffer(signal);
        break;

      case "answer":
        await this.handleIncomingAnswer(signal);
        break;

      case "ice-candidate":
        await this.handleIncomingIceCandidate(signal);
        break;

      case "reject":
        this.onCallStateChange?.("rejected");
        this.resetCall();
        break;

      case "end":
        this.onCallStateChange?.("ended");
        this.resetCall();
        break;

      case "cancel":
        this.onCallStateChange?.("cancelled");
        this.resetCall();
        break;

      default:
        console.warn("[CALL] Unknown action:", signal.action);
    }
  }

  async handleIncomingOffer(signal) {
    this.callId = signal.callId;
    this.chatRoomId = signal.chatRoomId;

    // Caller ID
    this.receiverId = signal.senderId;

    this.callType = signal.callType;

    // Store offer until user clicks Accept
    this.pendingOffer = signal.sdp;

    console.log("[CALL] Incoming call:", signal);

    this.onIncomingCall?.({
      callId: signal.callId,
      chatRoomId: signal.chatRoomId,
      callerId: signal.senderId,
      callerName: signal.senderName,
      profilePicture: signal.senderProfilePicture,
      callType: signal.callType,
    });

    this.onCallStateChange?.("incoming");
  }

  async acceptIncomingCall(token) {
    try {
      if (!this.callId || !this.pendingOffer) {
        throw new Error("No incoming call.");
      }

      this.onCallStateChange?.("accepting");

      await joinCall(this.callId, token);

      const stream = await getLocalStream(this.callType);

      this.onLocalStream?.(stream);

      createPeerConnection({
        onIceCandidate: (candidate) => {
          this.sendSignal({
            action: "ice-candidate",
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          });
        },

        onTrack: (remoteStream) => {
          console.log("[CALL] Remote stream received");
          this.onRemoteStream?.(remoteStream);
        },
      });

      addLocalTracks(stream);

      const answer = await handleOffer({
        type: "offer",
        sdp: this.pendingOffer,
      });

      this.sendSignal({
        action: "answer",
        sdp: answer.sdp,
      });
      await this.flushPendingIceCandidates();

      this.pendingOffer = null;

      this.onCallStateChange?.("ongoing");

      console.log("[CALL] Incoming call accepted");
    } catch (error) {
      console.error("[CALL] Accept call failed:", error);

      this.resetCall();

      throw error;
    }
  }

  async handleIncomingAnswer(signal) {
    try {
      await handleAnswer({
        type: "answer",
        sdp: signal.sdp,
      });

      await this.flushPendingIceCandidates();

      this.onCallStateChange?.("ongoing");

      console.log("[CALL] Call connected");
    } catch (error) {
      console.error("[CALL] Answer handling failed:", error);
    }
  }

  async handleIncomingIceCandidate(signal) {
    const candidate = {
      candidate: signal.candidate,
      sdpMid: signal.sdpMid,
      sdpMLineIndex: signal.sdpMLineIndex,
    };

    try {
      await addIceCandidate(candidate);
    } catch (error) {
      console.log("[CALL] Buffering ICE candidate");

      this.pendingIceCandidates.push(candidate);
    }
  }

  async flushPendingIceCandidates() {
    if (this.pendingIceCandidates.length === 0) {
      return;
    }

    const candidates = [...this.pendingIceCandidates];

    this.pendingIceCandidates = [];

    for (const candidate of candidates) {
      try {
        await addIceCandidate(candidate);
      } catch (error) {
        console.error("[CALL] Failed to add buffered ICE candidate:", error);
      }
    }
  }

  sendSignal(data) {
    if (!this.stompClient?.connected) {
      console.error("[CALL] WebSocket is not connected.");
      return;
    }

    const message = {
      callId: this.callId,
      chatRoomId: this.chatRoomId,
      senderId: this.currentUserId,
      receiverId: this.receiverId,
      callType: this.callType,
      ...data,
    };

    console.log("[CALL] Sending signal:", message);

    this.stompClient.publish({
      destination: "/app/call.signal",
      body: JSON.stringify(message),
    });
  }

  async endCurrentCall(token) {
    if (!this.callId) {
      console.warn("[CALL] No active call to end.");
      return;
    }

    const callId = this.callId;

    try {
      console.log("[CALL] Ending call:", callId);

      await endCall(callId, token);

      this.sendSignal({
        action: "end",
      });

      console.log("[CALL] Call ended successfully");
    } catch (error) {
      console.error("[CALL] Failed to end call:", error);
      throw error;
    } finally {
      this.resetCall();
    }
  }

  async rejectIncomingCall(token) {
    if (!this.callId) {
      return;
    }

    try {
      await rejectCall(this.callId, token);

      this.sendSignal({
        action: "reject",
      });
    } finally {
      this.resetCall();
    }
  }

  async cancelOutgoingCall(token) {
    if (!this.callId) {
      return;
    }

    try {
      await cancelCall(this.callId, token);

      this.sendSignal({
        action: "cancel",
      });
    } finally {
      this.resetCall();
    }
  }
  resetCall() {
    console.log("[CALL] Resetting current call");

    closePeerConnection();

    this.callId = null;
    this.chatRoomId = null;
    this.receiverId = null;
    this.callType = null;

    this.pendingOffer = null;
    this.pendingIceCandidates = [];
  }

  destroy() {
    console.log("[CALL] Destroying CallManager");

    this.resetCall();

    if (this.callSubscription) {
      this.callSubscription.unsubscribe();
      this.callSubscription = null;
    }
  }
}
