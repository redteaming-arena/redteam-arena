import React, { useState, useEffect } from 'react';
import RulesPage from './components/RulesPage';
import CountdownPage from './components/CountdownPage';
import ChatbotPage from './components/ChatbotPage';
import FailurePage from './components/FailurePage';
import SuccessPage from './components/SuccessPage';
import phrasesData from './data/phrases.json';

const TIMER_DURATION = 60; // 1 minute

const App = () => {
  const [page, setPage] = useState('rules');
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [successTime, setSuccessTime] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);

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

  const startCountdown = () => {
    const randomIndex = Math.floor(Math.random() * phrasesData.phrases.length);
    setCurrentPhrase(phrasesData.phrases[randomIndex]);
    setPage('countdown');
    setCount(3);
  };
  
  const startChat = () => {
    setPage('chat');
    setTimeLeft(TIMER_DURATION);
  };

  const showLeaderboard = () => {
    setPage('rules');
    setCount(3);
    setTimeLeft(TIMER_DURATION);
    setSuccessTime(null);
    setCurrentPhrase(null);
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
        />
      )}
      {page === 'failure' && <FailurePage onReset={showLeaderboard} />}
      {page === 'success' && (
        <SuccessPage 
          onReset={showLeaderboard} 
          timeTaken={TIMER_DURATION - successTime} 
        />
      )}
    </div>
  );
};

export default App;