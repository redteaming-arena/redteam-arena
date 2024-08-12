// src/components/Admin.js

import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/api';

const Admin = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(Object.values(data));
      } catch (error) {
        alert(`Failed to fetch users: ${error.message}`);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Panel</h2>
      <ul>
  {users.map((user, index) => (
    <li key={index}>{user.email}</li>
  ))}
</ul>
</div>
);
};

export default Admin;
