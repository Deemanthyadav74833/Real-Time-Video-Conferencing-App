import { createContext } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusCodes } from "http-status-codes";

export const AuthContext = createContext({});

// AuthContext.jsx
const BACKEND_URL =
  window.location.hostname.includes("localhost")
    ? "http://localhost:8000/api/v1/users"
    : "https://real-time-video-conferencing-app-vd32.onrender.com/api/v1/users";

const client = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // if you need cookies
});



export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async (name,username,password) => {
        try{
            let request = await client.post('/register', {
                name: name,
                username: username,
                password: password,
            });

            if(request.status === StatusCodes.CREATED){
                return request.data.message;
            }

        } catch (error) {
            throw error;
        }
    }


    
    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password)
            console.log(request.data)

            if (request.status === StatusCodes.OK) {
                localStorage.setItem("token", request.data.token);
            }
        } catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/allactivity",{
                params: {
                    token: localStorage.getItem("token")
                }

            });
            return request.data;
        } catch (error) {
            throw error;
        }
    }

    const addToUserHistory = async (meetingcode) => {
        try {
            let request = await client.post("/addToActivity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingcode
            });

            return request;
        } catch (error) {
            throw error;
        }
    }

    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser,addToUserHistory
    }

    return(
       <AuthContext.Provider value={data} >
            {children}
       </AuthContext.Provider>
    )
}