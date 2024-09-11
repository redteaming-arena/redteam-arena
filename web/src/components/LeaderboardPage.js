import React, { useState, useEffect } from "react";
import { handleLeaderboard } from "../services/api";

const LeaderboardPage = ({
  userColor = "bg-green-700",
  borderColor = "border-green-500",
  textColor = "text-white",
}) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bufferOffset, setBufferOffset] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await handleLeaderboard();
        setLeaderboardData(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch leaderboard data");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading)
    return <div className="text-center text-white">Loading leaderboard...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!leaderboardData) return null;

  const leaderboard = leaderboardData;
  const bufferSize = 10;
  const startIndex = bufferOffset;
  const endIndex = bufferOffset + bufferSize;
  const shownUsers = leaderboard.slice(startIndex, endIndex);

  const handlePrev = () => {
    setBufferOffset(Math.max(bufferOffset - bufferSize, 0));
  };

  const handleNext = () => {
    setBufferOffset(
      Math.min(bufferOffset + bufferSize, leaderboard.length - bufferSize)
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto ${textColor}`}>
      <h2 className="text-2xl mb-4 text-center">Leaderboard</h2>
      {leaderboard.length > bufferSize && (
        <div className="flex justify-between mb-4">
          <button
            onClick={handlePrev}
            disabled={bufferOffset === 0}
            className={`px-4 py-2 rounded ${borderColor} ${userColor} disabled:opacity-50`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={endIndex >= leaderboard.length}
            className={`px-4 py-2 rounded ${borderColor} ${userColor} disabled:opacity-50`}
          >
            Next
          </button>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`border ${borderColor} px-4 py-2`}>Rank</th>
            <th className={`border ${borderColor} px-4 py-2`}>Username</th>
            <th className={`border ${borderColor} px-4 py-2`}>Score</th>
          </tr>
        </thead>
        <tbody>
          {shownUsers.map(user => (
            <tr key={user.username}>
              <td className={`border ${borderColor} px-4 py-2 text-center`}>
                {user.position}
              </td>
              <td className={`border ${borderColor} px-4 py-2`}>
                {user.username}
              </td>
              <td className={`border ${borderColor} px-4 py-2 text-right`}>
                {user.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leaderboard.length > bufferSize && (
        <div className="mt-4 text-center">
          Showing {startIndex + 1} - {Math.min(endIndex, leaderboard.length)} of{" "}
          {leaderboard.length}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
