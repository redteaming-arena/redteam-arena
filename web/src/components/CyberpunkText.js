import React, { useEffect, useRef, useState } from "react";

const CyberpunkText = ({ text = "CYBERPUNK" }) => {
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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Calculate font size based on canvas width
      const fontSize = Math.max(20, Math.floor(dimensions.width / 15)); // Minimum 20px, adjust divisor as needed

      // Main text
      ctx.font = `bold ${fontSize}px "Courier New", Courier, "Lucida Console", Monaco, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Neon glow effect
      ctx.shadowBlur = fontSize / 3;
      ctx.shadowColor = "rgba(0, 255, 255, 0.7)";
      ctx.fillStyle = "#00FFFF";
      ctx.fillText(text, dimensions.width / 2, dimensions.height / 2);

      // Glitch effect
      if (Math.random() < 0.1) {
        ctx.fillStyle = "#FF00FF";
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
  }, [text, dimensions]);

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
