// src/services/api.js

import { getToken } from "./auth";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const handleResponse = async response => {
  const data = await response.json();
  if (!response.ok) {
    console.error("API Error:", data);
    let errorMessage = "An error occurred";
    if (data.detail) {
      errorMessage = Array.isArray(data.detail)
        ? data.detail.map(error => error.msg).join(", ")
        : data.detail;
    }
    throw new Error(errorMessage);
  }
  // console.log("API Response:", data);
  return data;
};

export const getChats = async () => {
  const response = await fetch(`${API_URL}/api/game/history`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const getLeaderboard = async (user = false) => {
  if (user) {
    const response = await fetch(`${API_URL}/api/leaderboard/me`,
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      }
    );
    return handleResponse(response);
  } else {
    const response = await fetch(`${API_URL}/api/leaderboard/`);
    return handleResponse(response);
  }
};

export const handleLeaderboard = async (user = false) => {
  try {
    const leaderboardData = await getLeaderboard(user);
    // console.log("Leaderboard data fetched successfully:", leaderboardData);
    return leaderboardData;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const fetchProfile = async () => {
  const response = await fetch(`${API_URL}/api/user/`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const register = async (username, password) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  // console.log("Raw response:", response);
  return handleResponse(response);
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: username,
      password: password,
    }),
  });
  return handleResponse(response);
};

export const createGame = async () => {
  const token = getToken();
  // console.log("Token:", token ? `${token}` : "No token");

  if (!token) {
    throw new Error("No authentication token available");
  }

  try {
    // console.log(`Sending request to: ${API_URL}/api/game/create`);
    const response = await fetch(`${API_URL}/api/game/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // console.log("Response status:", response.status);
    // console.log("Response headers:", Object.fromEntries(response.headers));

    const text = await response.text();
    // console.log("Response text:", text);

    let data;
    try {
      data = JSON.parse(text);
      // console.log("Data");
      // console.log(data);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      throw new Error("Invalid JSON response");
    }

    if (!response.ok) {
      console.error("Error response:", data);
      throw new Error(data.detail || "Failed to create game");
    }

    return data;
  } catch (error) {
    console.error("Error in createGame:", error);
    if (error.message === "Failed to fetch") {
      console.error(
        "Network error. Please check your internet connection and API_URL configuration."
      );
    } else if (error.message.includes("Could not validate credentials")) {
      console.error("Authentication error. Token may be invalid or expired.");
      // Log token expiration if it's a JWT
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        // console.log(
        //   "Token expiration:",
        //   new Date(tokenPayload.exp * 1000).toISOString()
        // );
      } catch (e) {
        // console.log("Unable to decode token for expiration check");
      }
    }
    throw error;
  }
};

export function forfeitSessionWithBeacon(sessionId) {
  const url = `${API_URL}/api/game/forfeit?session_id=${sessionId}&username=${getToken()}`;
  navigator.sendBeacon(url);
}


export const gameChat = async (sessionId, userInput) => {
  const response = await fetch(
    `${API_URL}/api/game/chat?session_id=${sessionId}&user_input=${encodeURIComponent(userInput)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return handleResponse(response);
};

export const gameTestStreamEvent = (_, userInput) => {
  const url = `${API_URL}/api/game/chat?user_input=${encodeURIComponent(userInput)}&stream=true`;

  return {
    subscribe: callbacks => {
      const controller = new AbortController();
      const connect = () => {
        fetchEventSource(url, {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
          },
          signal: controller.signal,
          onopen(response) {
            if (response.ok && response.status === 200) {
              // console.log("Connection opened");
              if (callbacks.onopen) callbacks.onopen();
            } else {
              throw new Error(
                `Failed to open connection: ${response.status} ${response.statusText}`
              );
            }
          },
          onmessage(event) {
            if (callbacks.onmessage) callbacks.onmessage(event);
          },
          onclose() {
            // console.log("Connection closed");
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
        },
      };
    },
  };
};

// NOTE:
// Stream sometimes ends abruptly then spawns a new connection
// that but for now it's a feature, but it may become an issue
// since the timer.
export const gameStreamEvent = (sessionId, userInput) => {
  const url = `${API_URL}/api/game/chat?session_id=${sessionId}&user_input=${encodeURIComponent(userInput)}`;

  return {
    subscribe: callbacks => {
      const controller = new AbortController();
      const connect = () => {
        fetchEventSource(url, {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${getToken()}`,
          },
          signal: controller.signal,

          onopen(response) {
            if (response.ok && response.status === 200) {
              // console.log("Connection opened");
              if (callbacks.onopen) callbacks.onopen();
            } else {
              throw new Error(
                `Failed to open connection: ${response.status} ${response.statusText}`
              );
            }
          },
          onmessage(event) {
            if (callbacks.onmessage) callbacks.onmessage(event);
          },
          onclose() {
            // console.log("Connection closed");
            if (callbacks.onclose) callbacks.onclose();
          },
          onerror(err) {
            console.warn("EventSource failed:", err);
            if (callbacks.onerror) callbacks.onerror(err);
          },
        });
      };

      connect();

      return {
        close: () => {
          controller.abort();
        },
      };
    },
  };
};

export const getChatHistory = async sessionId => {
  const response = await fetch(`${API_URL}/api/game/history/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const writeSession = async sessionId => {
  // console.log("Attempting to write session with ID:", sessionId);
  try {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const url = new URL(`${API_URL}/api/game/write_session`);
    url.searchParams.append("session_id", sessionId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    // console.log("Response status:", response.status);
    // console.log(
    //   "Response headers:",
    //   Object.fromEntries(response.headers.entries())
    // );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Server Error:", errorData);
      throw new Error(
        JSON.stringify(errorData) || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    // console.log("Server response:", data);
    return data;
  } catch (error) {
    console.error("Error in writeSession:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
};

export const getSharedMessages = async id => {
  const response = await fetch(`${API_URL}/api/game/share/${id}`);
  return handleResponse(response);
};

export const postSharedMessages = async session_id => {
  const response = await fetch(`${API_URL}/api/game/share/${session_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};
