// VideoMeetComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// ✅ Dynamic backend URL (works for local + deployed)
const server_url = window.location.hostname.includes("localhost")
  ? "http://localhost:8000"
  : "https://real-time-video-conferencing-app-vd32.onrender.com";

// ✅ STUN servers (free public from Google)
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoMeetComponent = () => {
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectToSocketServer();
    startMedia();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.close();
    };
  }, []);

  const connectToSocketServer = () => {
    console.log("Connecting to socket server...");

    socketRef.current = io(server_url, {
      transports: ["websocket"],
      secure: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket:", socketRef.current.id);
      setIsConnected(true);

      // Join a fixed room for testing (later use meeting code)
      socketRef.current.emit("join-room", "demo-room");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
    });

    // ✅ Signaling listeners
    socketRef.current.on("offer", handleReceiveOffer);
    socketRef.current.on("answer", handleReceiveAnswer);
    socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("🚨 Error accessing media devices:", err);
    }
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection(iceServers);

    // ✅ Remote stream handling
    peer.ontrack = (event) => {
      console.log("📡 Received remote track");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ✅ Local stream tracks → peer
    localStreamRef.current.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    // ✅ ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", event.candidate);
      }
    };

    return peer;
  };

  const callUser = async () => {
    peerRef.current = createPeer();

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socketRef.current.emit("offer", offer);
  };

  const handleReceiveOffer = async (offer) => {
    peerRef.current = createPeer();

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socketRef.current.emit("answer", answer);
  };

  const handleReceiveAnswer = async (answer) => {
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidateMsg = async (incoming) => {
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(incoming));
    } catch (err) {
      console.error("🚨 Error adding ICE candidate:", err);
    }
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

      {/* ✅ Video elements */}
      <div className="flex gap-4 mt-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-1/2 border rounded"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-1/2 border rounded"
        />
      </div>

      <button
        onClick={callUser}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoMeetComponent;
