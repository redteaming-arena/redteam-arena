import React from 'react';
import Leaderboard from './Leaderboard';

const FailurePage = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 p-4">
    <h1 className="text-6xl mb-4">You Failed.</h1>
    <h2 className="text-2xl mb-8">Get fucked, loser.</h2>
    <button 
      onClick={onReset}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mb-8"
    >
      TRY AGAIN
    </button>
    <Leaderboard />
  </div>
);

export default FailurePage;