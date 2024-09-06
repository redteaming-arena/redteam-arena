"use client";
import Header from "@/components/header";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { exampleGames } from "@/data/games";
import Link from "next/link";

import { Press_Start_2P } from "next/font/google";
const retroFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

const placeholderImage = "/image.png";

const backgroundColor = "bg-black";
const textColor = "text-green-500";
const accentColor = "text-white";
const borderColor = "border-green-500";

const GameCard = ({ id }) => {
  const game = exampleGames[id - 1];
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const gameImage = game.image || placeholderImage;
  const currentDate = new Date();
  return (
    <div
      className={`w-full p-2 ${isExpanded ? 'fixed inset-0 z-50 flex items-center justify-center' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Link href={`/games/${id}`}>
        <Card
          className={`h-full relative transition-all duration-300 ${backgroundColor} ${borderColor} border-2
            ${isExpanded ? 'w-full h-full max-w-4xl max-h-[90vh] overflow-auto' : 'hover:shadow-green-500 hover:shadow-lg'}
            ${isFlipped ? 'rotate-y-180' : ''}`}
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
        >
          <div className="w-full h-full backface-hidden">
            <CardContent className="p-4">
              <h2 className={`${retroFont.className} text-sm ${accentColor}`}>
                {game.name}
              </h2>
              <p className={`${retroFont.className} text-xs ${textColor}`}>
                {game.description}
              </p>
            </CardContent>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default function Games() {
  const [games, setGames] = useState(exampleGames);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col min-h-screen ${backgroundColor} ${textColor}`}>
      <Header />
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <h1 className={`${retroFont.className} text-2xl mb-8 ${accentColor}`}>
          GAMES
        </h1>
        <div className="my-4 w-full max-w-md">
          <Input
            type="text"
            placeholder="SEARCH GAMES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-2 rounded-none ${backgroundColor} ${textColor} ${borderColor} border-2 ${retroFont.className} text-xs`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
              />
            ))
          ) : (
            <div className={`${retroFont.className} text-center w-full col-span-full ${textColor} text-xs`}>
              NO GAMES AVAILABLE
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}