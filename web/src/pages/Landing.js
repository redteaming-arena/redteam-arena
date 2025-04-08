import React, { useState } from "react";
import LandingPage from "../components/LandingPage"; // Import the LandingPage component
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import { register, login } from "../services/api";
import { setToken } from "../services/auth";

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
const Landing = () => {
  const [page, setPage] = useState("landing"); // Track current page (landing, login, register)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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
          onLoginButton={handleLoginButton}
          onRegisterButton={handleRegisterButton}
          onAbout={handleAbout}
          showAbout={showAbout}
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "login" && <LoginPage onLogin={() => setIsUserLoggedIn(true)} onBack={handleBackToLanding} />}
      {page === "register" && <RegisterPage onRegister={handleRegister} onBack={handleBackToLanding} />}
    </div>
  );
};

export default Landing;