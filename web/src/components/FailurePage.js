import React from 'react';
import Leaderboard from './Leaderboard';
import NavButton from './NavButton';

const FailurePage = ({ onReset, onLogin, onAbout, showAbout = false, buttonText }) => (
  <div className="flex flex-col items-center justify-center min-h-scree bg-black text-red-500 font-mono p-4">
    <div className="absolute top-4 right-4 flex gap-2">
      <NavButton text={buttonText} onClick={onLogin} />
      {showAbout && <NavButton text="ABOUT" onClick={onAbout} />}
    </div>
    <h1 className=" mt-14 text-4xl sm:text-6xl mb-4">You Failed.</h1>
    <h2 className="text-xl sm:text-2xl mb-8">Get fucked, loser.</h2>
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