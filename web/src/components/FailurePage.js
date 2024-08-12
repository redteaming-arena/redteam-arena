import React from 'react';

const FailurePage = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-mono p-4">
    <h1 className="text-6xl mb-4 text-red-500">You Failed.</h1>
    <h2 className="text-2xl mb-8">Try and be better next time.</h2>
    <button 
      onClick={onReset}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
    >
      VIEW LEADERBOARD
    </button>
  </div>
);

export default FailurePage;