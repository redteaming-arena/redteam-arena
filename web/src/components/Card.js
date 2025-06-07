import React, { useState } from "react";
import { motion } from "framer-motion";

const Card = ({ frontImage, frontText, backText }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-40 sm:w-48 md:w-56 h-48 sm:h-56 md:h-64 rounded-xl cursor-pointer perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute w-full h-full rounded-xl shadow-lg"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0 }}
        animate={{
          rotateY: isHovered ? 10 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Front of Card */}
        <div
          className="absolute w-full h-full flex flex-col items-center justify-center 
                     bg-black text-white rounded-xl p-4 border-2 border-white shadow-md"
          style={{
            backfaceVisibility: "hidden",
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? "rotateY(0deg)" : "rotateY(0deg)",
          }}
        >
          <div className="w-24 h-24 mb-8">{frontImage}</div>
          <p className="text-lg font-bold">{frontText}</p>
        </div>

        {/* Back of Card */}
        <div
          className="absolute w-full h-full flex items-center justify-center 
                     bg-black text-white rounded-xl p-4 border-2 border-white shadow-md"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          <p className="text-md text-center">{backText}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Card;