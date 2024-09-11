import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MultiTableComponent } from "../components/EloTable";
import NavButton from "../components/NavButton";
import { getLeaderboard } from "../services/api";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const navigate = useNavigate();

  const convertData = (obj, type, deltaObj) => {
    return Object.entries(obj).map(([key, value], index) => ({
      id: (index + 1).toString(),
      name: key.replace(`${type}_`, ""),
      score: value.toFixed(4),
      improved: deltaObj[key] > 0.0 ? 1 : deltaObj[key] < 0.0 ? -1 : 0,
    }));
  };

  useEffect(() => {
    const handleLeaderboard = async () => {
      try {
        const response = await getLeaderboard();
        // console.log(response);

        if (response && response.leaderboard && response.delta) {
          const processedData = {
            players: convertData(
              response.leaderboard.players,
              "Player",
              response.delta.players
            ),
            prompts: convertData(
              response.leaderboard.targets,
              "Target",
              response.delta.targets
            ),
            models: convertData(
              response.leaderboard.models,
              "Model",
              response.delta.models
            ),
          };
          setLeaderboardData(processedData);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    handleLeaderboard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full bg-black text-white font-mono p-4">
      <div className="w-full flex justify-end gap-x-2">
        <NavButton text={"HOME"} onClick={() => navigate("/")} />
      </div>
      {leaderboardData ? (
        <MultiTableComponent
          playerData={leaderboardData.players}
          promptData={leaderboardData.prompts}
          modelData={leaderboardData.models}
        />
      ) : (
        <p>Loading leaderboard data...</p>
      )}
    </div>
  );
}
