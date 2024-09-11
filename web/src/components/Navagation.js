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
    { text: "LEADERBOARD", onClick: () => navigate("/leaderboard") },
    ...(isUserLoggedIn
      ? [{ text: "PROFILE", onClick: () => navigate("/profile") }]
      : []),
    ...(isUserLoggedIn
      ? [{ text: "HISTORY", onClick: () => navigate("/history") }]
      : [{ text: "REGISTER", onClick: onRegisterButton }]),
    ...(showAbout ? [{ text: "ABOUT", onClick: onAbout }] : []),
  ];

  return (
    <nav className="w-full bg-black text-white p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">RedTeam Arena</div>
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
