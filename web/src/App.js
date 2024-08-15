import React, { useState, useEffect } from 'react';
import RulesPage from './components/RulesPage';
import CountdownPage from './components/CountdownPage';
import ChatbotPage from './components/ChatbotPage';
import FailurePage from './components/FailurePage';
import SuccessPage from './components/SuccessPage';
import LeaderboardPage from './components/Leaderboard';
import LoginPage from './components/LoginPage';
import { register, login, createGame } from './services/api';
import { removeToken, setToken, getToken, isLoggedIn } from './services/auth';


const TIMER_DURATION = 60; // 1 minute

const App = () => {
  const [page, setPage] = useState('rules');
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [successTime, setSuccessTime] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    if (page === 'countdown' && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [page, count]);

  useEffect(() => {
    if (page === 'chat') {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) return prevTime - 1;
          setPage('failure');
          return 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [page]);

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn() && (getToken() != process.env.REACT_APP_DEV_LOGIN_TOKEN));
    setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN)
  }, []);  

  const startCountdown = async () => {
    try {
      const data = await createGame();
      setSessionId(data.session_id);
      setCurrentPhrase(data.target_phrase);
      setPage('countdown');
      setCount(3);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert(`Failed to start game: ${error.message}`);
    }
  };
  
  const startChat = () => {
    setPage('chat');
    setTimeLeft(TIMER_DURATION);
  };

  const restart = () => {
    setSuccessTime(null);
    setTimeLeft(TIMER_DURATION);
    startCountdown()
  };

  const handleSuccess = (timeTaken) => {
    setSuccessTime(timeTaken);
    setPage('success');
  };

  const handleLogin = (username, password) => {
    try {
      //const data = login(username, password)
      //console.log(data.access_token)
      //setToken(data.access_token); TODO: FIX THIS
      setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN)
      setIsUserLoggedIn(true);
      setPage('rules');  
    } catch (error) {
      //const data = register(username, password);
      //setToken(data.access_token); TODO: FIX THIS
      setToken(process.env.REACT_APP_DEV_LOGIN_TOKEN)
      setIsUserLoggedIn(true);
      setPage('rules');  
    }
  };

  const handleLogout = () => {
    removeToken()
    setIsUserLoggedIn(false);
    setPage('rules');
  };

  const showLoginPage = () => {
    setPage('login');
  };

  const handleAbout = () => {
    console.log("About");
  };

  const handleBack = () => {
    setPage('rules')
  }

  const showAbout = false;

  return (
    <div className="h-screen bg-black">
    {page === 'rules' && (
      <RulesPage 
        onStart={startCountdown}
        onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
        onAbout={handleAbout}
        showAbout={showAbout} // Set to false to hide the About button
        buttonText={isUserLoggedIn ? "LOGOUT" : "LOGIN"}
      />
    )}
    {page === 'login' && (
      <LoginPage
        onLogin={handleLogin}
        onBack={handleBack}
      />
    )}
    {page === 'countdown' && (
      <CountdownPage 
        count={count}
        onComplete={startChat} 
        phrase={currentPhrase} 
        onAbout={handleAbout}
        showAbout={showAbout} // Set to false to hide the About button
      />
    )}
    {page === 'chat' && (
      <ChatbotPage 
        timeLeft={timeLeft} 
        onSuccess={handleSuccess}
        phrase={currentPhrase}
        sessionId={sessionId}
        onAbout={handleAbout}
        showAbout={showAbout} // Set to false to hide the About button
      />
    )}
    {page === 'failure' && (
      <FailurePage 
        onReset={restart}
        onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
        onAbout={handleAbout}
        showAbout={showAbout} // Set to false to hide the About button
        buttonText={isUserLoggedIn ? "LOGOUT" : "LOGIN"}
      />
    )}
    {page === 'success' && (
      <SuccessPage 
        onReset={restart} 
        timeTaken={TIMER_DURATION - successTime}
        onLogin={isUserLoggedIn ? handleLogout : showLoginPage}
        onAbout={handleAbout}
        showAbout={showAbout} // Set to false to hide the About button
        buttonText={isUserLoggedIn ? "LOGOUT" : "LOGIN"}
      />
    )}
    {page === 'leaderboard' && <LeaderboardPage />}
  </div>
);
};

export default App;