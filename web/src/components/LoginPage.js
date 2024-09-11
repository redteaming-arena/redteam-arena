import React, { useState } from "react";
import CyberpunkText from "./CyberpunkText";
import NavButton from "./NavButton";

const LoginPage = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmitLogin = e => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-black text-white font-mono p-4 pt-16">
      <div className="mb-12">
        <CyberpunkText text="LOGIN" width={600} height={150} />
      </div>
      <form onSubmit={handleSubmitLogin} className="w-full max-w-md">
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-white text-sm font-bold mb-2"
          >
            USERNAME
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-white border border-white bg-gray-800 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-white text-sm font-bold mb-2"
          >
            PASSWORD
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-white border border-white bg-gray-800 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>
        <div className="flex justify-between items-center">
          <NavButton text="BACK" onClick={onBack} className="px-4 py-2" />
          <NavButton
            text="LOGIN"
            onClick={handleSubmitLogin}
            className="px-4 py-2"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
