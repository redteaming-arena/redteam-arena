import React, { useEffect, useRef, useState } from "react";

const CyberpunkText = ({ text = "CYBERPUNK", variant = "landing" }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width } = canvasRef.current.getBoundingClientRect();
        setDimensions({ width, height: width * 0.2 }); // Adjust height ratio as needed
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const colorSchemes = {
      landing: {
        main: "#00FFFF",
        glow: "rgba(0, 255, 255, 0.7)",
        glitch: "#FF00FF",
      },
      norefund: {
        main: "#FFD700",
        glow: "rgba(255, 215, 0, 0.7)",
        glitch: "#FF4500",
      },
      badwords: {
        main: "#FF69B4",
        glow: "rgba(255, 105, 180, 0.7)",
        glitch: "#00FFFF",
      },
    };

    const colors = colorSchemes[variant] || colorSchemes.landing;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Calculate font size based on canvas width
      const fontSize = Math.max(20, Math.floor(dimensions.width / 16)); // Minimum 20px, adjust divisor as needed

      // Main text
      ctx.font = `bold ${fontSize}px "Courier New", Courier, "Lucida Console", Monaco, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Neon glow effect
      ctx.shadowBlur = fontSize / 3;
      ctx.shadowColor = colors.glow;
      ctx.fillStyle = colors.main;
      ctx.fillText(text, dimensions.width / 2, dimensions.height / 2);

      // Glitch effect
      if (Math.random() < 0.1) {
        ctx.fillStyle = colors.glitch;
        ctx.fillText(
          text,
          dimensions.width / 2 + Math.random() * 4 - 2,
          dimensions.height / 2 + Math.random() * 4 - 2
        );
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [text, variant, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{ width: "100%", height: "auto" }}
    />
  );
};

export default CyberpunkText;
