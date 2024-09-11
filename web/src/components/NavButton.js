import React from "react";

// Updated NavButton component with more customization options
const NavButton = ({
  text,
  onClick,
  className = "",
  textSize = "text-xl",
  padding = "px-3 py-1",
  type = "button",
}) => (
  <button
    onClick={onClick}
    className={`border border-white hover:bg-white hover:text-black transition-colors ${padding} ${textSize} ${className}`}
    type={type}
  >
    {text}
  </button>
);

export default NavButton;
