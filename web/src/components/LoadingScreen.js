import React, { useState, useEffect } from 'react';

const AsciiLoadingScreen = () => {
  const [frame, setFrame] = useState(0);
  const frames = ['|', '/', '-', '\\'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <pre className="text-4xl font-mono mb-4">{frames[frame]}</pre>
        <p className="text-xl">Loading...</p>
      </div>
    </div>
  );
};

export default AsciiLoadingScreen;