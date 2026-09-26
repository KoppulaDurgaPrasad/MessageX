const API_URL = import.meta.env.VITE_API_URL;

async function callRequest(endpoint, method, token, body = null) {
  const response = await fetch(
    `${API_URL}/api/calls${endpoint}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body && {
          "Content-Type": "application/json",
        }),
      },
      ...(body && {
        body: JSON.stringify(body),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Call request failed"
    );
  }

  return response.json();
}

export function startCall(chatRoomId, type, token) {
  return callRequest(
    "/start",
    "POST",
    token,
    {
      chatRoomId,
      type,
    }
  );
}

export function joinCall(callId, token) {
  return callRequest(
    "/join",
    "POST",
    token,
    {
      callId,
    }
  );
}

export function endCall(callId, token) {
  return callRequest(
    "/end",
    "POST",
    token,
    {
      callId,
    }
  );
}

export function rejectCall(callId, token) {
  return callRequest(
    "/reject",
    "POST",
    token,
    {
      callId,
    }
  );
}

export function cancelCall(callId, token) {
  return callRequest(
    "/cancel",
    "POST",
    token,
    {
      callId,
    }
  );
}

export function getCall(callId, token) {
  return callRequest(
    `/${callId}`,
    "GET",
    token
  );
}

export function getMyCalls(token) {
  return callRequest(
    "/my",
    "GET",
    token
  );
}