const API_URL = import.meta.env.VITE_API_URL;

export async function getMyChats() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }

  return await response.json();
}

export async function createPrivateChat(receiverId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/private`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiverId: receiverId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create chat");
  }

  return response.json();
}

export async function getChatParticipants(chatRoomId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/api/chat/${chatRoomId}/participants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch chat participants");
  }

  return await response.json();
}

export async function createGroup({ name, image, description, memberIds }) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      image,
      description,
      memberIds,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create group");
  }

  return response.json();
}

export async function addGroupMember(chatRoomId, userId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/add-member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      chatRoomId,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to add member");
  }

  return response.text();
}

export async function removeGroupMember(chatRoomId, userId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/remove-member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      chatRoomId,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to remove member");
  }

  return response.text();
}

export async function leaveGroup(chatRoomId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/${chatRoomId}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to leave group");
  }

  return response.text();
}

export async function deleteGroup(chatRoomId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/chat/${chatRoomId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete group");
  }

  return response.text();
}
