import React from "react";
import CyberpunkText from "./CyberpunkText";
import NavButton from "./NavButton";
import Footer from "./Footer";
import { Badge } from "./ui/badge";
import NavBar from "./Navagation";
import { AlertDialogWarning } from "./Alert";
import Card from "./Card";
import { Link } from "react-router-dom";

// Go up one level from "pages" to "src" to access "assets"
import badwordsImg from "../assets/blue-circle-test.png";
import noRefundImg from "../assets/blue-circle-test.png";
import moreGamesImg from "../assets/blue-circle-test.png";

const LandingPage = ({
  onStart,
  onLoginButton,
  onRegisterButton,
  onAbout,
  showAbout = false,
  isUserLoggedIn,
}) => {
  return (
    <>
      <div className="flex flex-col items-center h-[calc(100%-55px)] overflow-none w-full bg-black text-white font-mono p-4">
        {/* Navbar */}
        <div className="w-full flex justify-end gap-x-2">
          <NavBar
            isUserLoggedIn={isUserLoggedIn}
            onLoginButton={onLoginButton}
            onRegisterButton={onRegisterButton}
            showAbout={showAbout}
            onAbout={onAbout}
          />
        </div>

        {/* Branding & Welcome Text */}
        <div className="text-left mb-4 w-full max-w-6xl mx-auto"> {/* Reduced margin here */}
          <CyberpunkText text="WELCOME TO REDTEAM ARENA" />
        </div>

        {/* Get ready to play and Badge - Centered */}
        <div className="w-full max-w-6xl mx-auto mb-12 text-center"> {/* Increased bottom margin */}
          {/* Text "Get ready to play." */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6"> {/* Reduced margin here */}
            Get ready to play.
          </h1>

          {/* Badge */}
          <Badge className="mt-4 mb-8">
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
        </div>

        {/* Horizontal Line and Game Cards - Centered */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center gap-6 sm:gap-8 md:gap-12 mb-8">
            {/* Game Cards */}
            <AlertDialogWarning onStart={onStart}>
              <Link to="/BadWords">
                <Card
                  frontImage={badwordsImg}
                  frontText="BadWords"
                  backText="A game where you test the limits of LLMs!"
                />
              </Link>
            </AlertDialogWarning>

            <AlertDialogWarning onStart={onStart}>
              <Link to="/NoRefund">
                <Card
                  frontImage={noRefundImg}
                  frontText="NoRefund"
                  backText="Can you game the refund policy?"
                />
              </Link>
            </AlertDialogWarning>

            <Card
              frontImage={moreGamesImg}
              frontText="More games coming soon!"
              backText="Stay tuned for exciting new challenges!"
            />
          </div>
          {/* Horizontal Line */}
          <hr className="border-gray-500 my-8" />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;