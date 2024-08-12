import React, { useState, useEffect } from 'react';
import leaderboardData from '../data/leaderboard.json';

const Leaderboard = () => {
  const [sortedUsers, setSortedUsers] = useState([]);

  useEffect(() => {
    const sorted = [...leaderboardData.users].sort((a, b) => b.score - a.score);
    setSortedUsers(sorted);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl mb-4 text-center">Leaderboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-green-500 px-4 py-2">Rank</th>
            <th className="border border-green-500 px-4 py-2">Username</th>
            <th className="border border-green-500 px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr key={user.username}>
              <td className="border border-green-500 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-green-500 px-4 py-2">{user.username}</td>
              <td className="border border-green-500 px-4 py-2 text-right">{user.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;