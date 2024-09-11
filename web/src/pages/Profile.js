import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Avatar } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import NavButton from "../components/NavButton";
import { fetchProfile } from "../services/api";
import { getToken } from "../services/auth";
import clsx from "clsx";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  // TODO: CHANGE

  useEffect(() => {
    const checkSessionAndAuth = async () => {
      const token = getToken();
      if (
        token === "undefined" ||
        token === process.env.REACT_APP_DEV_LOGIN_TOKEN
      ) {
        navigate("/");
        return;
      }

      try {
        const profile = await fetchProfile();
        // console.log({ profile });
        setUser(profile);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setError("Failed to load chat history");
      }
    };

    checkSessionAndAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-black text-green-500 font-vt323 no-scroll">
        <div className="w-full sm:max-w-[80%] mx-auto p-4 flex justify-center items-center h-full">
          <div className="text-2xl text-center">{error}</div>
        </div>
      </div>
    );
  }

  const getInitials = name => {
    return name.slice(0, 2);
  };

  const CardChildren = user ? (
    <>
      <CardHeader className="flex flex-col items-center space-y-1.5">
        <Avatar className="flex place-items-center border-white border bg-muted text-center p-2">
          <AvatarFallback className="leading-[normal] ml-0.5">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <CardTitle className="text-lg">{user.username}</CardTitle>
          <Badge
            variant="secondary"
            className="bg-green-500 text-white pointer-events-none mt-2 w-fit"
          >
            Elo: {user.elo_rating.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Global Rank</span>
            <span className="text-lg font-semibold">
              <span className="text-sm">#</span>
              {user.global_rank}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <span className="text-lg font-semibold">
              {(100 * (user.games_won / user.games_played)).toFixed(2)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Games Played</span>
            <span className="text-lg font-semibold">{user.games_played}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Games Won</span>
            <span className="text-lg font-semibold">{user.games_won}</span>
          </div>
        </div>
      </CardContent>
    </>
  ) : (
    <span>Loading...</span>
  );

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-full flex justify-end gap-x-2 p-4 absolute top-0 right-0 text-white">
        <NavButton text="HOME" onClick={() => navigate("/")} />
        <NavButton
          text="LEADERBOARD"
          onClick={() => navigate("/leaderboard")}
        />
      </div>

      <Card
        className={clsx("w-[350px]", {
          "p-6": !user,
        })}
      >
        {CardChildren}
      </Card>
    </div>
  );
}
