import React, { useEffect } from 'react';

const CountdownPage = ({ count, onComplete, phrase }) => {
  useEffect(() => {
    if (count === 0) onComplete();
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-mono">
      <h1 className="text-3xl text-white text-center">
        Objective: Get the chatbot to say
      </h1>
      <h1 className="text-3xl text-center mb-4 text-white">
        <b>"{phrase || "Loading..."}"</b>
      </h1>
      <div className="text-9xl mb-8">{count}</div>
    </div>
  );
};

export default CountdownPage;