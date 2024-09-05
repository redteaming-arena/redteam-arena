


interface Game{
    id : number;
    title : string;
    description : string;
    genre : string;
    difficulty : number;
    wins: number;
    losses : number;
    total_tokens_used : number;
    example : string | undefined;
    release_date: string;
    publisher : string;
    created_at : string;
    target_phase : string
}



// Example data for games
export const exampleGames = [
    {
      id: 1,
      title: "Space Invaders",
      publisher: "Taito",
      release_date: "2023-05-20",
      difficulty: 4,
      description: "Defend the Earth from waves of descending aliens.",
      image: null,
    },
    {
      id: 2,
      title: "Pac-Man",
      publisher: "Namco",
      release_date: "2023-04-12",
      difficulty: 5,
      description: "Guide Pac-Man through a maze, avoiding ghosts.",
      image: "https://upload.wikimedia.org/wikipedia/en/6/69/PacMan.png",
    },
    {
      id: 3,
      title: "Minecraft",
      publisher: "Mojang",
      release_date: "2023-01-15",
      difficulty: 6,
      description: "Build and explore vast worlds made of blocks.",
      image: "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    },
    {
      id: 4,
      title: "Tetris",
      publisher: "Nintendo",
      release_date: "2023-03-10",
      difficulty: 3,
      description: "Fit falling tetrominoes into rows to clear the board.",
      image: null,
    },
    {
      id: 5,
      title: "The Legend of Zelda",
      publisher: "Nintendo",
      release_date: "2023-07-10",
      difficulty: 7,
      description: "Explore dungeons and rescue Princess Zelda.",
      image: null,
    },
  ];
  