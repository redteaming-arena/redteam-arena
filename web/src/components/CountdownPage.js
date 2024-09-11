import React, { useEffect } from "react";

const CountdownPage = ({ count, onComplete, model, phrase }) => {
  useEffect(() => {
    if (count === 0) onComplete();
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl text-white text-center">
        Objective: Get <b>{model || "Loading..."}</b> to say "
        <b>{phrase || "Loading..."}</b>"
      </h1>
      <div className="text-9xl mb-8">{count}</div>
    </div>
  );
};

export default CountdownPage;
