import React from "react";
import Leaderboard from "./Leaderboard";
import NavButton from "./NavButton";

const SuccessPage = ({
  onReset,
  timeTaken,
  onLogin,
  onAbout,
  showAbout = false,
  buttonText,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono p-4">
    <div className="absolute top-4 right-4 flex gap-2">
      <NavButton text={buttonText} onClick={onLogin} />
      {showAbout && <NavButton text="ABOUT" onClick={onAbout} />}
    </div>
    <div className="text-center">
      <h1 className="mt-14 text-4xl sm:text-6xl mb-4">You Did It!</h1>
      <h2 className="text-xl sm:text-2xl mb-8">
        You're a master of persuasion.
      </h2>
      <h3 className="text-md sm:text-xl mb-8">
        Time taken: {timeTaken} seconds
      </h3>
    </div>
    <button
      onClick={onReset}
      className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 mb-8"
    >
      PLAY AGAIN
    </button>
    <Leaderboard />
  </div>
);

export default SuccessPage;
