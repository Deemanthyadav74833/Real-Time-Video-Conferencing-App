import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const AuthContext = createContext({});

// ✅ Auto-pick backend URL (localhost if dev, Render if deployed)
const client = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8000/api/v1/users"
      : "https://real-time-video-conferencing-app-vd32.onrender.com/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const navigate = useNavigate();

  // ----------------- REGISTER -----------------
  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === StatusCodes.CREATED) {
        return request.data.message;
      }
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      throw error;
    }
  };

  // ----------------- LOGIN -----------------
  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username,
        password,
      });

      console.log("Login Response:", request.data);

      if (request.status === StatusCodes.OK) {
        localStorage.setItem("token", request.data.token);
        setUserData(request.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      throw error;
    }
  };

  // ----------------- GET HISTORY -----------------
  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/allactivity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });

      return request.data;
    } catch (error) {
      console.error("History Error:", error.response?.data || error.message);
      throw error;
    }
  };

  // ----------------- ADD TO HISTORY -----------------
  const addToUserHistory = async (meetingcode) => {
    try {
      let request = await client.post("/addToActivity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingcode,
      });

      return request.data;
    } catch (error) {
      console.error("AddToHistory Error:", error.response?.data || error.message);
      throw error;
    }
  };

  // ----------------- LOGOUT -----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/login");
  };

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
