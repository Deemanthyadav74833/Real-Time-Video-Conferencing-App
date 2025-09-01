// VideoMeetComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// ✅ Dynamic backend URL (works for local + deployed)
const server_url = window.location.hostname.includes("localhost")
  ? "http://localhost:8000"
  : "https://real-time-video-conferencing-app-vd32.onrender.com";

const VideoMeetComponent = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectToSocketServer();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectToSocketServer = () => {
    console.log("Connecting to socket server...");

    socketRef.current = io(server_url, {
      transports: ["websocket"], // ✅ Ensure websocket is used
      secure: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket:", socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Video Meeting</h2>
      <p>
        Socket status:{" "}
        <span className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </p>
    </div>
  );
};

export default VideoMeetComponent;
