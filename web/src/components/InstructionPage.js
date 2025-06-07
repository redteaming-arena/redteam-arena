import React from "react";
import NavButton from "./NavButton";

const InstructionPage = ({ onContinue, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white min-h-screen px-8 bg-black font-mono">
      <h1 className="text-3xl font-bold mb-4">GAME INSTRUCTIONS</h1>
      <p className="text-lg max-w-2xl text-center mb-8">
        You have 2 minutes to convince a customer service agent to give you a refund. Good luck!
      </p>
      <div className="flex gap-4">
        <NavButton
          text="BACK"
          onClick={onBack}
          className="px-4 py-2"
        />
        <NavButton
          text="START"
          onClick={onContinue}
          className="px-4 py-2"
        />
      </div>
    </div>
  );
};

export default InstructionPage;
