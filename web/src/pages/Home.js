import React, { useState, useEffect } from "react";
import RulesPage from "../components/RulesPage";
import CountdownPage from "../components/CountdownPage";
import ChatbotPage from "../components/ChatbotPage";
import FailurePage from "../components/FailurePage";
import SuccessPage from "../components/SuccessPage";
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import {
  register,
  login,
  createGame,
  writeSession,
  forfeitSessionWithBeacon,
} from "../services/api";
import { removeToken, getToken, setToken, isLoggedIn } from "../services/auth";
import LoadingScreen from "../components/LoadingScreen";

const TIMER_DURATION = 60; // 1 minute TODO: CHANGE.

const Home = () => {
  const [page, setPage] = useState("rules");
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [successTime, setSuccessTime] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [sessionWritten, setSessionWritten] = useState(false);

  useEffect(() => {
    if (page === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [page, count]);

  useEffect(() => {
    if (page === "chat") {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 0) return prevTime - 1;
          setPage("loading");
          return 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [page]);

  useEffect(() => {
    if (page === "loading" && !sessionWritten) {
      const data = writeSession(sessionId);
      data
        .then(res => {
          setPage(res.state === "win" ? "success" : "failure");
        })
        .catch(err => {
          console.error(err);
        });

      setSessionWritten(true);
    }
  }, [page]);

  useEffect(() => {
    const loggedToken = getToken();
    if (
      loggedToken !== "undefined" &&
      loggedToken !== process.env.REACT_APP_DEV_LOGIN_TOKEN
    ) {
      setToken(loggedToken);
      setIsUserLoggedIn(true);
    } else {
      setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN);
      setIsUserLoggedIn(false);
    }

    const handleBeforeUnload = () => {
      if (sessionId) {
        forfeitSessionWithBeacon(sessionId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // No need to call `forfeitSession` here
    };
  }, [sessionId]);

  const startCountdown = async () => {
    try {
      const data = await createGame();
      setSessionId(data.session_id);
      setCurrentPhrase(data.target_phrase);
      setCurrentModel(data.model);
      setPage("countdown");
      setCount(3);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert(`Failed to start game: ${error.message}`);
    }
  };

  const startChat = () => {
    setPage("chat");
    setTimeLeft(TIMER_DURATION);
  };

  const restart = () => {
    setSuccessTime(null);
    setTimeLeft(TIMER_DURATION);
    startCountdown();
    setSessionWritten(false);
  };

  const handleSuccess = timeTaken => {
    setSuccessTime(timeTaken);
    setPage("loading");
  };

  const handleLogin = async (username, password) => {
    let data;
    try {
      data = await login(username, password);
      console.log("DATA:", data)
      setToken(data.access_token);
      setIsUserLoggedIn(true);
      setPage("rules");
    } catch (loginError) {
      // console.log(loginError);
      console.error("Login failed:", loginError);
      alert(loginError);
    }
  };

  const handleRegister = async (username, password) => {
    try {
      await register(username, password);
      handleLogin(username, password);
    } catch (registerError) {
      console.error("Registration failed:", registerError);
      if (registerError) {
        alert(registerError);
      } else {
        alert("Failed to login or register. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN);
    setIsUserLoggedIn(false);
    setPage("rules");
  };

  const showLoginPage = () => {
    setPage("login");
  };

  const showRegisterPage = () => {
    setPage("register");
  };

  const handleAbout = () => {
    // console.log("About");
  };

  const handleBack = () => {
    setPage("rules");
  };

  const handleLeaderboard = () => {
    setPage("leaderboard");
  };
  const showAbout = false;

  const onHomeButton = () => {
    console.log("OnHomeButton");
    setPage("rules");
  };

  return (
    <div className="bg-black min-h-screen w-screen">
      {page === "rules" && (
        <RulesPage
          onStart={startCountdown}
          onLoginButton={isUserLoggedIn ? handleLogout : showLoginPage}
          onRegisterButton={showRegisterPage}
          onAbout={handleAbout}
          showAbout={showAbout} // Set to false to hide the About button
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "login" && (
        <LoginPage onLogin={handleLogin} onBack={handleBack} />
      )}
      {page === "register" && (
        <RegisterPage onRegister={handleRegister} onBack={handleBack} />
      )}
      {page === "countdown" && (
        <CountdownPage
          count={count}
          onComplete={startChat}
          model={currentModel}
          phrase={currentPhrase}
        />
      )}
      {page === "chat" && (
        <ChatbotPage
          timeLeft={timeLeft}
          onSuccess={handleSuccess}
          model={currentModel}
          phrase={currentPhrase}
          sessionId={sessionId}
          timerDuration={TIMER_DURATION}
        />
      )}
      {page === "failure" && (
        <FailurePage
          onReset={restart}
          sessionId={sessionId}
          currentModel={currentModel}
          currentPhrase={currentPhrase}
          onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
          onAbout={handleAbout}
          showAbout={showAbout} // Set to false to hide the About button
          onHomeButton={onHomeButton}
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "success" && (
        <SuccessPage
          onReset={restart}
          sessionId={sessionId}
          currentModel={currentModel}
          currentPhrase={currentPhrase}
          timeTaken={TIMER_DURATION - successTime}
          onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
          onAbout={handleAbout}
          showAbout={showAbout} // Set to false to hide the About button
          onHomeButton={onHomeButton}
          idUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "loading" && <LoadingScreen />}
    </div>
  );
};

export default Home;
