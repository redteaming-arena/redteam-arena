// src/services/api.js

import { getToken } from '../utils/auth';

const API_URL = 'http://34.30.158.155:8000';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
      console.error('API Error:', data);
      let errorMessage = 'An error occurred';
      if (data.detail) {
        errorMessage = Array.isArray(data.detail) 
          ? data.detail.map(error => error.msg).join(', ')
          : data.detail;
      }
      throw new Error(errorMessage);
    }
    console.log('API Response:', data);
    return data;
  };
  

export const register = async (email, password) => {
const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
});
return handleResponse(response);
};

export const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
  
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
};
  
export const createGame = async () => {
    const response = await fetch(`${API_URL}/api/game/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  };

export const gameChat = async (sessionId, userInput) => {
const response = await fetch(`${API_URL}/api/game/chat?session_id=${sessionId}&user_input=${encodeURIComponent(userInput)}`, {
    method: 'POST',
    headers: {
    'Authorization': `Bearer ${getToken()}`,
    },
});
return handleResponse(response);
};


export const getChatHistory = async (sessionId) => {
const response = await fetch(`${API_URL}/api/game/history/${sessionId}`, {
    headers: {
    'Authorization': `Bearer ${getToken()}`,
    },
});
return handleResponse(response);
};
  
export const getLeaderboard = async () => {
const response = await fetch(`${API_URL}/api/leaderboard/get`, {
headers: { 'Authorization': `Bearer ${getToken()}` },
});
return handleResponse(response);
};

export const getAllUsers = async () => {
const response = await fetch(`${API_URL}/api/admin/users`, {
headers: { 'Authorization': `Bearer ${getToken()}` },
});
return handleResponse(response);
};
