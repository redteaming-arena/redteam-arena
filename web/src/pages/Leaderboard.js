import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MultiTableComponent } from "../components/EloTable";
import NavButton from "../components/NavButton";
import { getLeaderboard } from "../services/api";

export default function Leaderboard() {
  const [leaderboardBadwords, setLeaderboardBadwords] = useState(null);
  const [leaderboardNoRefund, setLeaderboardNoRefund] = useState(null);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState("badwords");
  const navigate = useNavigate();

  const convertData = (obj, type, deltaObj) => {
    return Object.entries(obj).map(([key, value], index) => ({
      id: (index + 1).toString(),
      name: key.includes("@") ? key.split("@")[0] : key.replace(`${type}_`, ""),
      score: value.toFixed(4),
      improved: deltaObj[key] > 0.0 ? 1 : deltaObj[key] < 0.0 ? -1 : 0,
    }));
  };

  useEffect(() => {
    const handleLeaderboard = async () => {
      try {
        const response = await getLeaderboard();

        if (response?.badwords?.leaderboard && response?.badwords?.delta) {
          setLeaderboardBadwords({
            players: convertData(
              response.badwords.leaderboard.players,
              "Player",
              response.badwords.delta.players
            ),
            prompts: convertData(
              response.badwords.leaderboard.targets,
              "Target",
              response.badwords.delta.targets
            ),
            models: convertData(
              response.badwords.leaderboard.models,
              "Model",
              response.badwords.delta.models
            ),
          });
        }

        if (response?.norefund?.leaderboard && response?.norefund?.delta) {
          setLeaderboardNoRefund({
            players: convertData(
              response.norefund.leaderboard.players,
              "Player",
              response.norefund.delta.players
            ),
            prompts: convertData(
              response.norefund.leaderboard.targets,
              "Scenario",
              response.norefund.delta.targets
            ),
            models: convertData(
              response.norefund.leaderboard.models,
              "Model",
              response.norefund.delta.models
            ),
          });
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
      <div className="my-4">
        <label htmlFor="leaderboard-select" className="mr-2">Select Leaderboard:</label>
        <select
          id="leaderboard-select"
          value={selectedLeaderboard}
          onChange={(e) => setSelectedLeaderboard(e.target.value)}
          className="text-black px-2 py-1 rounded"
        >
          <option value="badwords">BadWords</option>
          <option value="norefund">NoRefund</option>
        </select>
      </div>
      {(selectedLeaderboard === "badwords" && leaderboardBadwords) && (
        <>
          <h2 className="text-2xl my-4">BadWords Leaderboard</h2>
          <MultiTableComponent
            playerData={leaderboardBadwords.players}
            promptData={leaderboardBadwords.prompts}
            modelData={leaderboardBadwords.models}
            game="badwords"
          />
        </>
      )}
      {(selectedLeaderboard === "norefund" && leaderboardNoRefund) && (
        <>
          <h2 className="text-2xl my-4">NoRefund Leaderboard</h2>
          <MultiTableComponent
            playerData={leaderboardNoRefund.players}
            promptData={leaderboardNoRefund.prompts}
            modelData={leaderboardNoRefund.models}
            game="norefund"
          />
        </>
      )}
    </div>
  );
}
