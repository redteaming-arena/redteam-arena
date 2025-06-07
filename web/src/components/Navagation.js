import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import NavButton from "./NavButton";

const NavBar = ({
  isUserLoggedIn,
  onLoginButton,
  onRegisterButton,
  showAbout,
  onAbout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { text: isUserLoggedIn ? "LOGOUT" : "LOGIN", onClick: onLoginButton },
    ...(isUserLoggedIn
      ? []
      : [{ text: "REGISTER", onClick: onRegisterButton }]),
    ...(isUserLoggedIn
      ? [{ text: "PROFILE", onClick: () => navigate("/profile") }]
      : []),
    { text: "LEADERBOARD", onClick: () => navigate("/leaderboard") },
    ...(isUserLoggedIn
      ? [{ text: "HISTORY", onClick: () => navigate("/history") }]
      : []),
    ...(showAbout ? [{ text: "ABOUT", onClick: onAbout }] : []),
    { text: "GITHUB", onClick: () => window.open("https://github.com/redteaming-arena/redteam-arena", "_blank").focus() },
  ];

  return (
    <nav className="w-full bg-black text-white p-4">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate("/")} className="text-xl font-bold hover:text-cyan-400 transition-colors">
          RedTeam Arena
        </button>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="hidden md:flex space-x-2">
          {navItems.map((item, index) => (
            <NavButton key={index} text={item.text} onClick={item.onClick} />
          ))}
        </div>
      </div>
      {isMenuOpen && (
        <div className="mt-4 space-y-2 md:hidden">
          {navItems.map((item, index) => (
            <NavButton
              key={index}
              text={item.text}
              onClick={() => {
                item.onClick();
                toggleMenu();
              }}
              className="w-full"
            />
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
