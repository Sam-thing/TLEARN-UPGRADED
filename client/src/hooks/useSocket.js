import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (url = import.meta.env.VITE_SOCKET_URL) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io(url, {
      auth: { token },
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [url]);

  const emit = (event, data) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event, callback) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
};