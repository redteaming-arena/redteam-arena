import React, { useEffect, useRef } from 'react';

const CyberpunkText = ({ text = 'CYBERPUNK', width, height}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Main text
      ctx.font = 'bold 5em "Courier New", Courier, "Lucida Console", Monaco, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Neon glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(text, width / 2, height / 2);

      // Glitch effect
      if (Math.random() < 0.1) {
        ctx.fillStyle = '#FF00FF';
        ctx.fillText(text, width / 2 + Math.random() * 4 - 2, height / 2 + Math.random() * 4 - 2);
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [text, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default CyberpunkText;