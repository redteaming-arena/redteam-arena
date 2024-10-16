"use client"
import React, { useEffect, useState } from "react";

const LoadingHeader = () => {
    const [dots, setDots] = useState(0);
  
    useEffect(() => {
      const dotInterval = setInterval(() => {
        setDots((prev) => (prev + 1) % 3);
      }, 200);
  
      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(dotInterval);
    }, []);
  
    return (
      <div className="text-white p-5 flex items-center space-x-2 select-none">
        <div className="text-xl">{"/>"}</div>
        <div className="text-gray-400 select-none">/</div>
        <div className="flex items-center space-x-2 select-none">
          <span className="text-gray-400">Loading</span>
          <span className="text-gray-400">/</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-green-400">
            <span className="animate-pulse">{'.'.repeat(dots + 1)}</span>
          </span>
        </div>
      </div>
    );
  };
  

const LoadingPage = () => {
  return (
    <div className="min-h-screen">
      <LoadingHeader />
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div
          className="inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
