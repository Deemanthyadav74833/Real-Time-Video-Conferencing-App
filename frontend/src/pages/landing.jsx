import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function LandingPage() {
    const router = useNavigate();
    return(
        <div className='landingpagecontainer'>
            <nav>
                <div className="navHeader">
                    <h2>Apna Video Call</h2>
                </div>

                <div className="navList">
                    <p onClick={()=>{
                        router("/123")
                    }}>Join as guest</p>
                    <p onClick={()=>{
                        router("/auth")
                    }}>Register</p>
                    <div onClick={()=>{
                        router("/auth")
                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>
                    <p>Cover a distance by Apna Video Call</p>
                    <div role='button' className='getStartedButton'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='mobile.png' alt='mobile' className='mobileImage'/>
                </div>
            </div>
        </div>
    );
}