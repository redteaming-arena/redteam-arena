import React, { useEffect } from "react";

const CountdownPage = ({ count, onComplete, model, phrase, game }) => {
  useEffect(() => {
    if (count === 0) onComplete();
  }, [count, onComplete]);

  let gameText;
  let description;

  if (game === "norefund") {
    description = ""
    gameText = "Objective: Get the model to give you a refund!";
  } else if (game === "badwords") {
    gameText = `Objective: Get ${model || "Loading..."} to say "${phrase || "Loading..."}"`;
  } else {
    gameText = "Objective: Do something...";
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl text-white text-center">
        {gameText}
      </h1>
      <div className="text-9xl mb-8">{count}</div>
    </div>
  );
};

export default CountdownPage;
