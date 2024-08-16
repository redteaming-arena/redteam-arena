// src/services/api.js

import { getToken } from './auth';
import { fetchEventSource } from '@microsoft/fetch-event-source';
const API_URL = process.env.REACT_APP_BACKEND_URL;


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
    console.log('Raw response:', response);
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

export const gameTestStreamEvent = (_, userInput) => {
  const url = `${API_URL}/api/game/chat?user_input=${encodeURIComponent(userInput)}&stream=true`;
  
  return {
    subscribe: (callbacks) => {
      const controller = new AbortController();
      const connect = () => {
        fetchEventSource(url, {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
          },
          signal: controller.signal,
          onopen(response) {
            if (response.ok && response.status === 200) {
              console.log("Connection opened");
              if (callbacks.onopen) callbacks.onopen();
            } else {
              throw new Error(`Failed to open connection: ${response.status} ${response.statusText}`);
            }
          },
          onmessage(event) {
            if (callbacks.onmessage) callbacks.onmessage(event);
          },
          onclose() {
            console.log("Connection closed");
            if (callbacks.onclose) callbacks.onclose();
          },
          onerror(err) {

            console.error("EventSource failed:", err);
            if (callbacks.onerror) callbacks.onerror(err);
            // Attempt to reconnect after a delay
            // setTimeout(connect, 5000);
          },
        });
      };

      connect();

      return {
        close: () => {
          controller.abort();
        }
      };
    }
  };
}


// NOTE: 
// Stream sometimes ends abruptly then spawns a new connection
// that but for now it's a feature, but it may become an issue
// since the timer.
export const gameStreamEvent = (sessionId, userInput) => {
  const url = `${API_URL}/api/game/chat?session_id=${sessionId}&user_input=${encodeURIComponent(userInput)}&stream=true`;
  
  return {
    subscribe: (callbacks) => {
      const controller = new AbortController();
      const connect = () => {
        fetchEventSource(url, {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${getToken()}`,
          },
          signal: controller.signal,
          
          onopen(response) {
            if (response.ok && response.status === 200) {
              console.log("Connection opened");
              if (callbacks.onopen) callbacks.onopen();
            } else {
              throw new Error(`Failed to open connection: ${response.status} ${response.statusText}`);
            }
          },
          onmessage(event) {
            if (callbacks.onmessage) callbacks.onmessage(event);
          },
          onclose() {
            console.log("Connection closed");
            if (callbacks.onclose) callbacks.onclose();
          },
          onerror(err) {
            console.warn("EventSource failed:", err);
            if (callbacks.onerror) callbacks.onerror(err);
          },
        });
      }

      connect();

      return {
        close: () => {
          controller.abort();
        }
      };
    }
  };
};

export const getChatHistory = async (sessionId) => {
const response = await fetch(`${API_URL}/api/game/history/${sessionId}`, {
    headers: {
    'Authorization': `Bearer ${getToken()}`,
    },
});
return handleResponse(response);
};

export const writeSession = async (sessionId) => {
  console.log('Attempting to write session with ID:', sessionId);
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const url = new URL(`${API_URL}/api/game/write_session`);
    url.searchParams.append('session_id', sessionId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
      // Note: We're not sending a body anymore
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server Error:', errorData);
      throw new Error(JSON.stringify(errorData) || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Server response:', data);
    return data;
  } catch (error) {
    console.error('Error in writeSession:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
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
