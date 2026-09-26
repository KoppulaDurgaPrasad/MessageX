let peerConnection = null;
let localStream = null;

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export function createPeerConnection({ onIceCandidate, onTrack }) {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      console.log("[WebRTC] ICE candidate generated");
      onIceCandidate(event.candidate);
    }
  };

  const remoteStream = new MediaStream();

  peerConnection.ontrack = (event) => {
    console.log("========== REMOTE TRACK ==========");
    console.log("[WebRTC] Track kind:", event.track.kind);
    console.log("[WebRTC] Track ID:", event.track.id);
    console.log("[WebRTC] Track enabled:", event.track.enabled);
    console.log("[WebRTC] Track readyState:", event.track.readyState);
    console.log("[WebRTC] Event streams:", event.streams);

    const alreadyExists = remoteStream
      .getTracks()
      .some((track) => track.id === event.track.id);

    if (!alreadyExists) {
      remoteStream.addTrack(event.track);
    }

    console.log("[WebRTC] Remote audio tracks:", remoteStream.getAudioTracks());

    console.log("[WebRTC] Remote video tracks:", remoteStream.getVideoTracks());

    console.log("[WebRTC] Remote stream active:", remoteStream.active);

    if (onTrack) {
      onTrack(remoteStream);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("[WebRTC] Connection state:", peerConnection.connectionState);
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("[WebRTC] ICE state:", peerConnection.iceConnectionState);
  };

  peerConnection.onicegatheringstatechange = () => {
    console.log(
      "[WebRTC] ICE gathering state:",
      peerConnection.iceGatheringState,
    );
  };

  peerConnection.onsignalingstatechange = () => {
    console.log("[WebRTC] Signaling state:", peerConnection.signalingState);
  };

  peerConnection.onnegotiationneeded = () => {
    console.log("[WebRTC] Negotiation needed");
  };

  return peerConnection;
}

export async function getLocalStream(type) {
  const constraints =
    type === "VIDEO"
      ? {
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        }
      : {
          audio: true,
          video: false,
        };

  console.log("[WebRTC] Call type:", type);
  console.log("[WebRTC] Media constraints:", constraints);

  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);

    console.log("[WebRTC] Local stream:", localStream);

    console.log("[WebRTC] Audio tracks:", localStream.getAudioTracks());

    console.log("[WebRTC] Video tracks:", localStream.getVideoTracks());

    localStream.getTracks().forEach((track) => {
      console.log(
        "[WebRTC] Track:",
        track.kind,
        "enabled:",
        track.enabled,
        "readyState:",
        track.readyState,
      );
    });

    return localStream;
  } catch (error) {
    console.error("[WebRTC] getUserMedia failed:", error.name, error.message);

    throw error;
  }
}

export function addLocalTracks(stream) {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  stream.getTracks().forEach((track) => {
    console.log("[WebRTC] Adding local track:", track.kind);

    peerConnection.addTrack(track, stream);
  });

  console.log("[WebRTC] Sender count:", peerConnection.getSenders().length);
}

export async function createOffer() {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  const offer = await peerConnection.createOffer();

  console.log("[WebRTC] Created offer:", offer);

  await peerConnection.setLocalDescription(offer);

  console.log("[WebRTC] Local description set");

  return offer;
}

export async function handleOffer(offer) {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  console.log("[WebRTC] Setting remote offer");

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  console.log("[WebRTC] Remote description set");

  const answer = await peerConnection.createAnswer();

  console.log("[WebRTC] Created answer:", answer);

  await peerConnection.setLocalDescription(answer);

  console.log("[WebRTC] Local answer set");

  return answer;
}

export async function handleAnswer(answer) {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  console.log("[WebRTC] Setting remote answer");

  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

  console.log("[WebRTC] Remote answer set");
}

export async function addIceCandidate(candidate) {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  console.log("[WebRTC] Adding ICE candidate:", candidate);

  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

export function getPeerConnection() {
  return peerConnection;
}

export function getLocalMediaStream() {
  return localStream;
}

export function closePeerConnection() {
  console.log("[WebRTC] Closing connection");

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      console.log("[WebRTC] Stopping track:", track.kind);

      track.stop();
    });

    localStream = null;
  }
}
