import React from 'react';

// Updated NavButton component with more customization options
const NavButton = ({ text, onClick, className = "", textSize = "text-sm", padding = "px-3 py-1" }) => (
    <button 
      onClick={onClick}
      className={`border border-white hover:bg-white hover:text-black transition-colors ${padding} ${textSize} ${className}`}
    >
      {text}
    </button>
  );

export default NavButton;