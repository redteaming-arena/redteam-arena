// src/components/Game.js

import React, { useState, useEffect } from 'react';
import { createGame, gameChat } from '../services/api';

const Game = () => {
    const [sessionId, setSessionId] = useState(null);
    const [targetPhrase, setTargetPhrase] = useState('');
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [gameState, setGameState] = useState('not_started');
  
    useEffect(() => {
      const initGame = async () => {
        try {
          const data = await createGame();
          console.log('Game created:', data);
          setSessionId(data.session_id);
          setTargetPhrase(data.target_phrase);
          setGameState('ongoing');
        } catch (error) {
          console.error('Failed to start game:', error);
          alert(`Failed to start game: ${error.message}`);
        }
      };
      initGame();
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (gameState !== 'ongoing') {
        alert("The game has ended. Please start a new game.");
        return;
      }
      try {
        const data = await gameChat(sessionId, userInput);
        console.log("Received data from backend:", data);
        setChatHistory(data.chat_history || []);
        setGameState(data.game_state);
        setTargetPhrase(data.target_phrase);
        setUserInput('');
        if (data.game_state !== 'ongoing') {
          alert(`Game over! You ${data.game_state === 'win' ? 'won' : 'lost'}!`);
        }
      } catch (error) {
        console.error('Chat failed:', error);
        alert(`Chat failed: ${error.message}`);
      }
    };
  
    const renderGameStatus = () => {
      switch (gameState) {
        case 'not_started':
          return <p>Game is starting...</p>;
        case 'ongoing':
          return (
            <>
              <p>Game is in progress. Try to make the AI say the forbidden phrase!</p>
              <p><strong>Forbidden Phrase:</strong> "{targetPhrase}"</p>
            </>
          );
        case 'win':
          return <p>Congratulations! You won the game!</p>;
        case 'loss':
          return <p>Game over. You didn't manage to make the AI say the phrase.</p>;
        default:
          return null;
      }
    };
  
    const renderChatHistory = () => {
      console.log('Rendering chat history:', chatHistory);
      if (chatHistory.length === 0) {
        return <p>No messages yet. Start the conversation!</p>;
      }
  
      return (
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <p className="user-message"><strong>You:</strong> {chat.user}</p>
              <p className="ai-message"><strong>AI:</strong> {chat.model}</p>
            </div>
          ))}
        </div>
      );
    };
  
    return (
      <div>
        <h2>Don't say it!</h2>
        {renderGameStatus()}
        {renderChatHistory()}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            placeholder="Your message" 
            required 
            disabled={gameState !== 'ongoing'}
          />
          <button type="submit" disabled={gameState !== 'ongoing'}>Send</button>
        </form>
      </div>
    );
  };
  
  export default Game;