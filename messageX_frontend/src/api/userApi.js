const API_URL = import.meta.env.VITE_API_URL;

export async function getCurrentUser() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  return response.json();
}

export async function searchUsers(keyword) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/api/users/search?keyword=${encodeURIComponent(keyword)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to search users");
  }

  return response.json();
}
