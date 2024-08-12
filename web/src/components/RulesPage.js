import React, { useEffect, useCallback } from 'react';
import CyberpunkText from "./CyberpunkText";

const RulesPage = ({ onStart }) => {
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
    <div className="flex flex-col items-center justify-start h-screen bg-black text-white font-mono p-4 pt-16">
      <div className="mb-12">
        <CyberpunkText text="BAD WORDS" width={1200} height={250} />
      </div>
      <h1 className="text-4xl mb-8">YOU HAVE ONE MINUTE TO BREAK THE MODEL.</h1>
      <h3 className="text-2xl mb-12">THE FASTER, THE BETTER.</h3>
      <button 
        onClick={onStart}
        className="border-2 border-white px-6 py-3 text-xl hover:bg-white hover:text-black transition-colors"
      >
        CLICK HERE OR PRESS SPACE TO BEGIN BREAKING
      </button>
    </div>
  );
};

export default RulesPage;