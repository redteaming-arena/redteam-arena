import React, { useState, useEffect } from 'react';
import RulesPage from './components/RulesPage';
import CountdownPage from './components/CountdownPage';
import ChatbotPage from './components/ChatbotPage';
import FailurePage from './components/FailurePage';
import SuccessPage from './components/SuccessPage';
import LeaderboardPage from './components/Leaderboard';
import { createGame } from './services/api';
import { setToken } from './services/auth';

const TIMER_DURATION = 60; // 1 minute

const App = () => {
  const [page, setPage] = useState('rules');
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [successTime, setSuccessTime] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [sessionId, setSessionId] = useState(null);

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

  const startCountdown = async () => {
    try {
      const myToken = process.env.REACT_APP_DEV_LOGIN_TOKEN
      setToken(myToken)
      const data = await createGame();
      setSessionId(data.session_id);
      setCurrentPhrase(data.target_phrase)
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

  return (
    <div className="h-screen bg-gray-800">
      {page === 'rules' && <RulesPage onStart={startCountdown} />}
      {page === 'countdown' && <CountdownPage count={count} onComplete={startChat} phrase={currentPhrase} />}
      {page === 'chat' && (
        <ChatbotPage 
          timeLeft={timeLeft} 
          onSuccess={handleSuccess}
          phrase={currentPhrase}
          sessionId={sessionId}
        />
      )}
      {page === 'failure' && <FailurePage onReset={restart} />}
      {page === 'success' && (
        <SuccessPage 
          onReset={restart} 
          timeTaken={TIMER_DURATION - successTime} 
        />
      )}
      {page === 'leaderboard' && <LeaderboardPage />}
    </div>
  );
};

export default App;