import React from "react";
import CyberpunkText from "./CyberpunkText";
import NavButton from "./NavButton";
import Footer from "./Footer";
import { Badge } from "./ui/badge";
import NavBar from "./Navagation";
import { AlertDialogWarning } from "./Alert";
import Card from "./Card";
import { Link } from "react-router-dom";

import badwordsImg from "../assets/smiley.png";
import noRefundImg from "../assets/refund.png";
import moreGamesImg from "../assets/exclamation-mark.png";

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
      <div className="flex flex-col items-center h-[calc(100%-55px)] w-full bg-black text-white font-mono p-4">
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

        {/* First Row - Welcome Text (One Row, Full Width) */}
        <div className="w-full text-center my-12">
          <CyberpunkText text="WELCOME TO REDTEAM ARENA" variant="landing" />
        </div>

        {/* Second Row - Grid with 4 Columns */}
        <div className="w-full max-w-6xl grid grid-cols-4 gap-6 gap-x-200 mb-20">
          {/* First Column */}
          <div className="flex flex-col items-center justify-center col-span-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4">
              Get ready to play.
            </h1>
            <Badge className="mt-5 mr-5">
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

          {/* Second, Third, and Fourth Columns (Game Cards) */}
          <div className="col-span-1 ml-20">
              <Link to="/BadWords">
                <Card
                  frontImage={<img src={badwordsImg} className="filter brightness-0 invert" alt="BadWords" />}
                  frontText="BadWords"
                  backText="Can you get the model to say a bad word?"
                />
              </Link>
          </div>

          <div className="col-span-1 ml-20">
            <AlertDialogWarning onStart={onStart}>
              <Link to="/NoRefund">
                <Card
                  frontImage={<img src={noRefundImg} className="filter brightness-0 invert" alt="NoRefund" />}
                  frontText="NoRefund"
                  backText="Can you game the refund policy?"
                />
              </Link>
            </AlertDialogWarning>
          </div>

          <div className="col-span-1 ml-20">
            <Card
              frontImage={<img src={moreGamesImg} className="filter brightness-0 invert" alt="More games coming soon!" />}
              frontText="More games soon!"
              backText="Stay tuned for exciting new challenges!"
            />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;