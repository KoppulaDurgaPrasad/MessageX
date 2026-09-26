import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL = import.meta.env.VITE_API_URL;

export function createWebSocketClient(token) {
  return new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    debug: (message) => {
      console.log("[STOMP]", message);
    },
  });
}
