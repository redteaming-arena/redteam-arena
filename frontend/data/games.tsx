


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
      name: "wikipedia",
      url: "https://en.wikipedia.org",
      github: null,
      publisher: "Taito",
      description: null,
      image: null,
    },

    {
      id: 2,
      name: "comchat",
      url: "https://comchat.ai",
      publisher: "Taito",
      github: null,
      description: null,
      image: null,
    },
  ]
