import React, { useEffect, useCallback } from 'react';
import CyberpunkText from "./CyberpunkText";
import NavButton from './NavButton';

const RulesPage = ({ onStart, onLogin, onAbout, showAbout = false, buttonText }) => {
  const handleKeyPress = useCallback((event) => {
    if (event.code === 'Space') {
      onStart();
    }
  }, [onStart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full bg-black text-white font-mono p-4">
      <div className="w-full flex justify-end">
        <NavButton text={buttonText} onClick={onLogin} />
        {showAbout && <NavButton text="ABOUT" onClick={onAbout} className="ml-2" />}
      </div>

      <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
        <div className="w-full mb-8">
          <CyberpunkText text="BAD WORDS" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-8">YOU HAVE ONE MINUTE TO BREAK THE MODEL.</h1>
        <h3 className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12">THE FASTER, THE BETTER.</h3>
        <NavButton
          text="CLICK HERE OR PRESS SPACE TO BEGIN BREAKING"
          onClick={onStart}
          textSize="text-sm sm:text-base md:text-lg lg:text-xl"
          padding="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
          className="font-bold"
        />
      </div>

      <div></div> {/* Empty div for spacing */}
    </div>
  );
};

export default RulesPage;