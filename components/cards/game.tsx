"use client";

import { create_game_session } from "@/services/games";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Game{
    id : number;
    name : string;
    url : string;
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

export default function GameCard({item} : {item : Game}){
    console.log(item)
    const router = useRouter()
    return (<div className="z-20 text-white">
        {item.title}
        <br/>
        {item.description}

        {/*  */}
        <Button onClick={async () => {
            const response = await create_game_session(item.id);
            if (response)
                router.push(response.data || "/error")
            }}>Play Game</Button>
    </div>)
}