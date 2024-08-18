// src/components/Leaderboard.js

import React, { useState, useEffect } from "react";
import { handleLeaderboard } from "../services/api";

const Leaderboard = ({
  userColor = "bg-green-700",
  borderColor = "border-green-500",
  textColor = "text-white",
}) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const { user, user_position, user_score, top_users, around_users } =
    leaderboardData;
  console.log(around_users)
  return (
    <div className={`w-full max-w-md mx-auto ${textColor}`}>
      <h2 className="text-2xl mb-4 text-center">Leaderboard</h2>
      <div className="mb-4 text-center">
        Your Position: {user_position} | Your Score: {user_score}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`border ${borderColor} px-4 py-2`}>Rank</th>
            <th className={`border ${borderColor} px-4 py-2`}>Email</th>
            <th className={`border ${borderColor} px-4 py-2`}>Score</th>
          </tr>
        </thead>
        <tbody>
        { user_position <= top_users.length && (<>
          {top_users.map((user) => (
            <tr
              key={user.email}
              className={user.position === user_position ? userColor : ""}
            >
              <td className={`border ${borderColor} px-4 py-2 text-center`}>
                {user.position}
              </td>
              <td className={`border ${borderColor} px-4 py-2`}>
                {user.email}
              </td>
              <td className={`border ${borderColor} px-4 py-2 text-right`}>
                {user.score}
              </td>
            </tr>
          ))}
        </>) }
         
          {user_position > top_users.length && (
            <>
              {top_users.map((user) => (
                <tr
                  key={user.email}
                  className={user.position === user_position ? userColor : ""}
                >
                  <td className={`border ${borderColor} px-4 py-2 text-center`}>
                    {user.position}
                  </td>
                  <td className={`border ${borderColor} px-4 py-2`}>
                    {user.email}
                  </td>
                  <td className={`border ${borderColor} px-4 py-2 text-right`}>
                    {user.score}
                  </td>
                </tr>
              ))}
              <tr className={userColor}>
                <td className={`border ${borderColor} px-4 py-2 text-center`}>
                  {user_position}
                </td>
                <td className={`border ${borderColor} px-4 py-2`}>
                  {user}
                </td>
                <td className={`border ${borderColor} px-4 py-2 text-right`}>
                  {user_score}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
