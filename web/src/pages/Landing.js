import React, { useState, useEffect } from "react";
import LandingPage from "../components/LandingPage"; // Import the LandingPage component
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import { register, login } from "../services/api";
import { setToken, getToken, removeToken } from "../services/auth";

const Landing = () => {
  const [page, setPage] = useState("landing"); // Track current page (landing, login, register)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
    const token = getToken();
    return token && token !== "undefined" && token !== process.env.REACT_APP_DEV_LOGIN_TOKEN;
  });
  const [showAbout, setShowAbout] = useState(false);

  const handleRegister = async (username, password) => {
    try {
      await register(username, password);
      const data = await login(username, password);
      setToken(data.access_token);
      setIsUserLoggedIn(true);
      setPage("landing"); // or "rules" or wherever you want to redirect
    } catch (err) {
      console.error("Registration or login failed:", err);
      alert("Registration or login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    removeToken();
    setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN);
    setIsUserLoggedIn(false);
    setPage("landing");
  };

  const handleLogin = async (username, password) => {
    let data;
    try {
      data = await login(username, password);
      setToken(data.access_token);
      setIsUserLoggedIn(true);
      setPage("landing");
    } catch (loginError) {
      console.error("Login failed:", loginError);
      alert(loginError);
    }
  };

  // Handling login button click
  const handleLoginButton = () => {
    setPage("login");
  };

  // Handling register button click
  const handleRegisterButton = () => {
    setPage("register");
  };

  // Handling About button click
  const handleAbout = () => {
    console.log("About button clicked");
    // Add About page logic here if needed
  };

  const handleBackToLanding = () => {
    setPage("landing");
  };

  return (
    <div>
      {page === "landing" && (
        <LandingPage
          onStart={() => console.log("Game starting...")} // Start game logic here
          onLoginButton={isUserLoggedIn ? handleLogout : handleLoginButton}
          onRegisterButton={handleRegisterButton}
          onAbout={handleAbout}
          showAbout={showAbout}
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "login" && <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />}
      {page === "register" && <RegisterPage onRegister={handleRegister} onBack={handleBackToLanding} />}
    </div>
  );
};

export default Landing;