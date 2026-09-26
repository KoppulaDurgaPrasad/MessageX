const API_URL = import.meta.env.VITE_API_URL;

export async function getMessages(chatRoomId) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/messages/${chatRoomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load messages");
  }

  return response.json();
}
export async function sendMessage(request) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/messages`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to send message");
  }

  return response.json();
}

export async function uploadDocument(file) {
  const token = localStorage.getItem("accessToken");

  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", "documents");

  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to upload document");
  }

  return response.text();
}
