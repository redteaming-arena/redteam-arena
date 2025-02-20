import React, { useState } from "react";
import { motion } from "framer-motion";

const Card = ({ frontImage, frontText, backText }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-40 sm:w-48 md:w-56 h-48 sm:h-56 md:h-64 rounded-xl cursor-pointer perspective-1000" // Increased sizes here
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute w-full h-full rounded-xl shadow-lg"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0 }}
        animate={{
          rotateY: isHovered ? 10 : 0, // Slight tilt when hovered to show back text
        }}
        transition={{ duration: 0.4 }} // Smooth transition for hover effect
      >
        {/* Front of Card */}
        <div
          className="absolute w-full h-full flex flex-col items-center justify-center 
                     bg-white text-black rounded-xl p-4 border border-gray-300 shadow-md"
          style={{
            backfaceVisibility: "hidden",
            opacity: isHovered ? 0 : 1, // Fade out the front only when hovered
            transform: isHovered ? "rotateY(0deg)" : "rotateY(0deg)", // Ensure front remains in place
          }}
        >
          <img src={frontImage} alt={frontText} className="w-24 h-24 mb-3" /> {/* Slightly larger image */}
          <p className="text-lg font-bold">{frontText}</p>
        </div>

        {/* Back of Card */}
        <div
          className="absolute w-full h-full flex items-center justify-center 
                     bg-white text-black rounded-xl p-4 border border-gray-300 shadow-md"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)", // Keep the back behind
            opacity: isHovered ? 1 : 0, // Fade in the back text when hovered
          }}
        >
          <p className="text-md">{backText}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Card;