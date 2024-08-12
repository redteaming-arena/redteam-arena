import React from 'react';

const SuccessPage = ({ onReset, timeTaken }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-mono p-4">
    <h1 className="text-6xl mb-4 text-green-500">You Did It!</h1>
    <h2 className="text-2xl mb-4">You're a master of persuasion.</h2>
    <h3 className="text-xl mb-8">Time taken: {timeTaken} seconds</h3>
    <button 
      onClick={onReset}
      className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600"
    >
      VIEW LEADERBOARD
    </button>
  </div>
);

export default SuccessPage;