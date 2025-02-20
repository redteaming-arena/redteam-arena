import React, { useEffect, useCallback } from "react";
import CyberpunkText from "./CyberpunkText";
import NavButton from "./NavButton";
import Footer from "./Footer";
import { Badge } from "./ui/badge";
import NavBar from "./Navagation";
import { AlertDialogWarning } from "./Alert";
import { Link } from "react-router-dom";

const LandingPage = ({
  onStart,
  onLoginButton,
  onRegisterButton,
  onAbout,
  showAbout = false,
  isUserLoggedIn,
  isLoadingGame,
}) => {
  const handleKeyPress = useCallback(
    (event) => {
      if (event.code === "Space") {
        onStart();
      }
    },
    [onStart]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      <div className="flex flex-col items-center h-[calc(100%-55px)] overflow-none w-full bg-black text-white font-mono p-4">
        <div className="w-full flex justify-end gap-x-2">
          <NavBar
            isUserLoggedIn={isUserLoggedIn}
            onLoginButton={onLoginButton}
            onRegisterButton={onRegisterButton}
            showAbout={showAbout}
            onAbout={onAbout}
          />
        </div>
        <Badge className="mt-4">
          <a href="https://x.com/elder_plinius" target="_blank" rel="noopener noreferrer">
            Pliny
          </a>
          /
          <a href="https://discord.gg/basi" target="_blank" rel="noopener noreferrer">
            BASI
          </a>
          &nbsp;x&nbsp;
          <a href="https://discord.gg/bgx3wjaZYC" target="_blank" rel="noopener noreferrer">
            Chatbot Arena
          </a>
        </Badge>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center w-full max-w-6xl mx-auto">
          <div className="w-full mb-8">
            {/* Displaying Cyberpunk Text */}
            <CyberpunkText text="WELCOME TO REDTEAM ARENA" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-10">
            GET READY TO PLAY.
          </h1>
          <h3 className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12">
            OUR AVAILABLE GAMES
          </h3>

          {/* Wrapper for buttons to make them display side by side */}
          <div className="flex gap-4 mb-8">
            {/* Bad Words Button */}
            <AlertDialogWarning onStart={onStart}>
              <Link to="/BadWords">
                <NavButton
                  text="Bad Words"
                  textSize="text-sm sm:text-base md:text-lg lg:text-xl"
                  padding="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
                  className="font-bold"
                />
              </Link>
            </AlertDialogWarning>

            {/* No Refund Button */}
            <AlertDialogWarning onStart={onStart}>
              <Link to="/NoRefund">
                <NavButton
                  text="No Refund"
                  textSize="text-sm sm:text-base md:text-lg lg:text-xl"
                  padding="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4"
                  className="font-bold"
                />
              </Link>
            </AlertDialogWarning>
          </div>
        </div> 
        <Badge className="mt-4">More games coming soon!</Badge>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;