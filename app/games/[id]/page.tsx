import React from 'react';
import { redirect } from "next/navigation";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { get_game } from "@/services/games";

interface Query {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string;
  };
}

interface GameData {
  title: string;
  genre: string;
  description: string;
  // Add other properties as needed
}

const GameDetails: React.FC<{ gameData: any }> = ({ gameData }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4 text-center">{gameData.title}</h1>
    <h3 className="text-lg font-bold mb-4 text-center">Difficulty: {gameData.difficulty}</h3>
    
    <div className="flex flex-wrap gap-4 mb-4 justify-center">
      {gameData.genre.split(",").map((genre : any, index : any) => (
        <Badge key={index} variant="outline" className="text-sm">
          {genre.trim()}
        </Badge>
      ))}
    </div>
    
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{gameData.description}</p>
      </CardContent>
    </Card>
    
    <div className="flex justify-center">
      <Button variant="secondary" size="sm">
        Play Game
      </Button>
    </div>
  </div>
);

export default async function Game(query: Query) {
  const { params } = query;
  
  if (isNaN(parseInt(params.id))) {
    redirect("/games");
  }
  
  const game = await get_game(parseInt(params.id));
  
  if (!game.success) {
    redirect("/games");
  }
  
  const gameData = game.data;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mt-20">
        <GameDetails gameData={gameData} />
      </main>
    </div>
  );
}