"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exampleGames } from "@/data/games";
import { Press_Start_2P } from "next/font/google";
import Link from 'next/link';

const retroFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

const backgroundColor = "bg-gray-900";
const textColor = "text-green-400";
const accentColor = "text-gray-300";

export default function GamePage() {
    const { id } = useParams();
    const router = useRouter();
    const game = exampleGames[id - 1];
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
      setIsExpanded(true);
    }, []);

    if (!game) {
      return (
        <div className={`min-h-screen ${backgroundColor} ${textColor} p-8`}>
          <Link href="/games" className={`${retroFont.className} ${accentColor} mb-4 inline-block`}>
            &lt; Back to Games 
          </Link>
          <h1 className={`${retroFont.className} text-2xl ${accentColor} mb-4`}>
            Game not found
          </h1>
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${backgroundColor} ${textColor} p-4 flex flex-col`}>
        <div 
          className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg flex-grow flex flex-col transition-all duration-500 ease-in-out ${
            isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <div className="bg-gray-700 p-2 flex items-center">
            <button 
              onClick={() => router.push('/games')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded mr-2"
            >
              X
            </button>
            <h2 className={`${retroFont.className} text-sm ${accentColor} flex-grow`}>{game.name}</h2>
            <div className="flex">
              <div className="w-4 h-4 bg-gray-600 border border-gray-500 mr-1"></div>
              <div className="w-4 h-4 bg-gray-600 border border-gray-500 mr-1"></div>
              <div className="w-4 h-4 bg-gray-600 border border-gray-500"></div>
            </div>
          </div>
          <div className="bg-gray-600 p-2 flex items-center">
            <input 
              type="text" 
              value={game.url} 
              readOnly 
              className="bg-gray-700 text-white px-2 py-1 rounded flex-grow mr-2"
            />
            <a 
              href={game.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mr-2"
            >
              Visit
            </a>
            <a 
              href={game.publisherUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              Publisher
            </a>
          </div>
          <iframe
            src={game.url}
            className="w-full flex-grow"
            title={game.name}
          />
        </div>
      </div>
    );
  }