// src/components/Leaderboard.js

import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        alert(`Failed to fetch leaderboard: ${error.message}`);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={index}>{user.email}: {user.score} points</li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
