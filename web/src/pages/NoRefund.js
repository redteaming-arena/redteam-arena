import React, { useState, useEffect } from "react";
import NoRefundPage from "../components/NoRefundPage";
import CountdownPage from "../components/CountdownPage";
import ChatbotPageNoRefund from "../components/ChatbotPageNoRefund";
import FailurePage from "../components/FailurePage";
import SuccessPage from "../components/SuccessPage";
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import InstructionPage from "../components/InstructionPage";
import {
  register,
  login,
  createNoRefundGame,
  writeSessionNoRefund,
  forfeitSessionWithBeacon,
} from "../services/api";
import { getSessionHistory } from "../services/api";
import { removeToken, getToken, setToken, isLoggedIn } from "../services/auth";
import LoadingScreen from "../components/LoadingScreen";

const TIMER_DURATION = 120; // 1 minute TODO: CHANGE.

const NoRefund = () => {
  const [page, setPage] = useState("rules");
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [successTime, setSuccessTime] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [modelResponse, setModelResponse] = useState(null);
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
      const writeSession = async () => {
        try {
          const res = await writeSessionNoRefund(sessionId);
          if (res.game_state && !res.state) {
            res.state = res.game_state;
          }
          setSessionWritten(true);
          setPage(res.state === "win" ? "success" : "failure");
        } catch (err) {
          const errorMsg = err.message || "";
          if (errorMsg.includes("Game already written")) {
            try {
              const historyRes = await getSessionHistory(sessionId);
              const state = historyRes.state || historyRes.game_state;
              setPage(state === "win" ? "success" : "failure");
            } catch (historyErr) {
              console.error("Failed to fetch game state after write error:", historyErr);
              setPage("failure");
            }
          } else {
            setPage("failure");
          }
          setSessionWritten(true);
        }
      };
      writeSession();
    }
  }, [page, sessionId, sessionWritten]);

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
    };
  }, [sessionId]);

  const startCountdown = async () => {
    try {
      const data = await createNoRefundGame();
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

  const handleSuccess = (timeTaken, modelResponse) => {
    setSuccessTime(timeTaken);
    setModelResponse(modelResponse);
    setPage("loading");
  };

  const handleLogin = async (username, password) => {
    let data;
    try {
      data = await login(username, password);
      setToken(data.access_token);
      setIsUserLoggedIn(true);
      setPage("rules");
    } catch (loginError) {
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
      alert(registerError || "Failed to login or register. Please try again.");
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
    console.log("About");
  };

  const handleBack = () => {
    setPage("rules");
  };

  const handleLeaderboard = () => {
    setPage("leaderboard");
  };

  const onHomeButton = () => {
    setPage("rules");
  };

  return (
    <div className="bg-black min-h-screen w-full max-w-screen overflow-x-hidden overflow-y-auto">
      {page === "rules" && (
        <NoRefundPage
          onStart={() => setPage("instruction")}
          onLoginButton={isUserLoggedIn ? handleLogout : showLoginPage}
          onRegisterButton={showRegisterPage}
          onAbout={handleAbout}
          showAbout={false} // Set to false to hide the About button
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {page === "instruction" && (
        <InstructionPage
          onContinue={startCountdown}
          onBack={handleBack}
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
          phrase={""}
          game={"norefund"}
        />
      )}
      {page === "chat" && (
        <ChatbotPageNoRefund
          timeLeft={timeLeft}
          onSuccess={handleSuccess}
          model={currentModel}
          phrase={"Get the model to give you a refund!"}
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
          showAbout={false} // Set to false to hide the About button
          onHomeButton={onHomeButton}
          isUserLoggedIn={isUserLoggedIn}
          game="norefund"
        />
      )}
      {page === "success" && (
        <SuccessPage
          onReset={restart}
          sessionId={sessionId}
          currentModel={currentModel}
          currentPhrase={currentPhrase}
          modelResponse={modelResponse}
          timeTaken={TIMER_DURATION - successTime}
          onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
          onAbout={handleAbout}
          showAbout={false} // Set to false to hide the About button
          onHomeButton={onHomeButton}
          idUserLoggedIn={isUserLoggedIn}
          game="norefund"
          timer_duration={TIMER_DURATION}
        />
      )}
      {page === "loading" && <LoadingScreen />}
    </div>
  );
};

export default NoRefund;