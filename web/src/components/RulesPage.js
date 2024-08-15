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
    <div className="flex flex-col items-center justify-start h-screen bg-black text-white font-mono p-4 pt-16 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <NavButton text={buttonText} onClick={onLogin} />
        {showAbout && <NavButton text="ABOUT" onClick={onAbout} />}
      </div>
      <div className="mb-12">
        <CyberpunkText text="BAD WORDS" width={1200} height={250} />
      </div>
      <h1 className="text-4xl mb-8">YOU HAVE ONE MINUTE TO BREAK THE MODEL.</h1>
      <h3 className="text-2xl mb-12">THE FASTER, THE BETTER.</h3>
      <NavButton 
        text="CLICK HERE OR PRESS SPACE TO BEGIN BREAKING"
        onClick={onStart}
        textSize="text-xl"
        padding="px-8 py-4"
        className="font-bold"
      />
    </div>
  );
};

export default RulesPage;