import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

// ----------------- CREATE CONTEXT -----------------
export const AuthContext = createContext({});

// ----------------- SETUP AXIOS CLIENT -----------------
const client = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8000/api/v1/users"
      : "https://real-time-video-conferencing-app-vd32.onrender.com/api/v1/users",
});

// ----------------- AUTH PROVIDER -----------------
export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ----------------- REGISTER -----------------
  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response?.status === StatusCodes.CREATED) {
        return response.data.message;
      }
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      throw error;
    }
  };

  // ----------------- LOGIN -----------------
  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", { username, password });

      if (response?.status === StatusCodes.OK && response?.data) {
        localStorage.setItem("token", response.data.token);
        setUserData(response.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // ----------------- GET HISTORY -----------------
  const getHistoryOfUser = async () => {
    try {
      const response = await client.get("/allactivity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return response?.data || [];
    } catch (error) {
      console.error("History Error:", error.response?.data || error.message);
      return [];
    }
  };

  // ----------------- ADD TO HISTORY -----------------
  const addToUserHistory = async (meetingcode) => {
    try {
      const response = await client.post(
        "/addToActivity",
        { meeting_code: meetingcode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response?.data || null;
    } catch (error) {
      console.error("AddToHistory Error:", error.response?.data || error.message);
      return null;
    }
  };

  // ----------------- LOGOUT -----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/login");
  };

  // ----------------- PROVIDER DATA -----------------
  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
    handleLogout,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
