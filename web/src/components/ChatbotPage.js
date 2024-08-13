import React, { useState } from 'react';
import { gameChat } from '../services/api';

const ChatbotPage = ({ timeLeft, onSuccess, phrase, sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() && timeLeft > 0 && !isLoading) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setIsLoading(true);

      try {
        const data = await gameChat(sessionId, input);
        setMessages(data.chat_history || []);
        
        console.log(data.chat_history[data.chat_history.length-1].model.toLowerCase())
        if (phrase && data.chat_history[data.chat_history.length-1].model.toLowerCase().includes(phrase.toLowerCase())) {
          onSuccess(60 - timeLeft); // Pass the time taken to succeed
        }
      } catch (error) {
        console.error('Error getting model output:', error);
        setMessages(msgs => [...msgs, { text: "Sorry, I couldn't process that request.", sender: 'bot' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-green-500 font-mono">
      <div className="w-[60%] bg-[#202020] p-4 flex justify-between items-center">
        <h1 className="text-lg text-white text-center">
          Objective: {phrase || "Loading..."}
        </h1>
        <div className="text-xl">{timeLeft}s</div>
      </div>
      <div className="w-[60%] bg-[#202020] p-4 space-y-4 border border-gray-700 rounded-lg">
      <div className="flex-grow overflow-auto p-4 bg-[#202020] space-y-4 h-[60vh]">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-end">
              <div className="p-2 rounded-lg max-w-[95%] inline-block bg-green-500 text-black border border-black text-right">
                {message.user}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="p-2 rounded-lg max-w-[95%] inline-block bg-black text-green-500 text-left">
                {message.model}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
        <div className="p-4 bg-black">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="break me, I dare you"
              className="flex-grow p-2 rounded-lg bg-gray-800 text-green-500 border border-green-500"
              disabled={timeLeft === 0 || isLoading}
            />
            <button
              onClick={handleSend}
              className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600"
              disabled={timeLeft === 0 || isLoading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
  );
};

export default ChatbotPage;