"use client";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";

// Example data for games
const exampleGames = [
  {
    id: 1,
    title: "Space Invaders",
    publisher: "Taito",
    release_date: "2023-05-20",
    difficulty: 4,
  },
  {
    id: 2,
    title: "Pac-Man",
    publisher: "Namco",
    release_date: "2023-04-12",
    difficulty: 5,
  },
  {
    id: 3,
    title: "Minecraft",
    publisher: "Mojang",
    release_date: "2023-01-15",
    difficulty: 6,
  },
  {
    id: 4,
    title: "Tetris",
    publisher: "Nintendo",
    release_date: "2023-03-10",
    difficulty: 3,
  },
  {
    id: 5,
    title: "The Legend of Zelda",
    publisher: "Nintendo",
    release_date: "2023-07-10",
    difficulty: 7,
  },
];

// Utility function to assign color based on difficulty
const getDifficultyColor = (difficulty: number) => {
  switch (true) {
    case difficulty >= 0 && difficulty <= 2:
      return "bg-green-500 hover:bg-green-600"; // Beginner (0-2)
    case difficulty >= 3 && difficulty <= 5:
      return "bg-yellow-500 hover:bg-yellow-600"; // Intermediate (3-5)
    case difficulty >= 6 && difficulty <= 8:
      return "bg-red-500 hover:bg-red-600"; // Advanced (6-8)
    case difficulty >= 9 && difficulty <= 10:
      return "bg-purple-500 hover:bg-purple-600"; // Expert (9-10)
    default:
      return "bg-blue-500 hover:bg-blue-600"; // Fallback for any out-of-range value
  }
};

// Component for displaying individual game card
const SpacesCard = ({ title, author, daysAgo, href, difficulty }) => {
  const dateObj = new Date(daysAgo);
  const currentDate = new Date();
  const timeDifference = currentDate - dateObj;
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <TooltipProvider>
      <Link
        href={href}
        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
      >
        <Card className="h-full relative group hover:opacity-95 transition-transform transform hover:-translate-y-1 shadow-md hover:shadow-xl rounded-xl bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900">
          <CardContent className="p-4 flex flex-col justify-center items-center h-full text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  className={`absolute top-2 right-2 opacity-90 ${difficultyColor}`}
                >
                  {difficulty}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Difficulty</p>
              </TooltipContent>
            </Tooltip>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {title}
            </h2>
          </CardContent>
          <CardFooter>
            <div className="absolute left-0 bottom-2 w-full flex justify-between px-4">
              <p className="text-xs sm:text-sm text-gray-300">{author}</p>
              <p className="text-xs text-gray-400">{days} days ago</p>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </TooltipProvider>
  );
};

// Main Games component that fetches and displays the game list
export default function Games() {
  const [games, setGames] = useState(exampleGames); // Using example games
  const [searchQuery, setSearchQuery] = useState("");

  // Filter games based on search query
  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col border-b-[1px] border-white mt-20 p-4 sm:p-10">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold">Games</span>
        </div>
        <div>
          <span className="text-lg sm:text-xl font-semibold text-white/90">
            Test your skills and find where you rank within the community!
          </span>
        </div>
        {/* Search bar */}
        <div className="my-4">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-2 rounded-lg"
          />
        </div>
      </div>
      <main className="flex-grow p-4 sm:p-8">
        <div className="flex flex-wrap -mx-2">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <SpacesCard
                key={game.id}
                title={game.title}
                author={game.publisher}
                daysAgo={game.release_date}
                href={`/games/${game.id}`}
                difficulty={game.difficulty}
              />
            ))
          ) : (
            <div className="text-white text-center w-full">
              No games available
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
