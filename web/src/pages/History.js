import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getToken } from "../services/auth";
import { getChatHistory, getChats, postSharedMessages } from "../services/api";

const History = () => {
  const { session_id } = useParams();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const [shareStatus, setShareStatus] = useState({});
  const scrollableRef = useRef(null);

  useEffect(() => {
    const checkSessionAndAuth = async () => {
      const token = getToken();
      if (token === "undefined" || token === process.env.REACT_APP_DEV_LOGIN_TOKEN) {
        navigate("/");
        return;
      }

      try {
        const history = await getChats();
        setChatHistory(history);

        if (session_id) {
          const sessionExists = history.some(chat => chat.session_id === session_id);
          if (!sessionExists) {
            navigate("/history");
          } else {
            const chatDetails = await getChatHistory(session_id);
            setSelectedChat(chatDetails);
          }
        } else {
          const status = Object.fromEntries(history.map(chat => [chat.session_id, chat.shared]));
          setShareStatus(status);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setError("Failed to load chat history");
      }
    };

    checkSessionAndAuth();
  }, [session_id, navigate]);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  }, [selectedChat]);

  const handleShare = async sessionId => {
    try {
      const response = await postSharedMessages(sessionId);
      setShareStatus(prevStatus => ({
        ...prevStatus,
        [sessionId]: response.shared,
      }));
      return response;
    } catch (error) {
      console.error("Error sharing chat:", error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-green-500 font-vt323 p-4">
        <div className="flex-grow flex justify-center items-center">
          <div className="text-2xl text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-green-500 font-vt323">
        <div className="p-4 space-y-4">
          <h1 className="text-xl sm:text-2xl text-white text-center">
            Objective: {selectedChat.target_phrase || "Not Found"}
          </h1>
          <h2 className="text-lg sm:text-xl text-white text-center">
            Username: {selectedChat.username || "Anonymous"}
          </h2>
        </div>
        <div className="flex-grow overflow-hidden flex flex-col w-full p-4 space-y-4">
          <div
            className="flex-grow overflow-auto p-2 sm:p-4 space-y-4 mb-4"
            ref={scrollableRef}
          >
            {selectedChat.chat_history?.map((message, index) => (
              <div key={index} className="space-y-2">
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-2 sm:p-3 rounded-lg max-w-[80%] text-sm sm:text-base ${
                      message.role === "assistant"
                        ? "bg-black text-green-500 text-left"
                        : "text-white border border-black text-right"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <a href="/history" className="text-white hover:text-green-500">
            Back to All Sessions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-mono p-4 pt-16 pb-24">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Chat History</h1>
      <Link to="/" className="text-cyan-400 no-underline hover:text-cyan-300 transition-colors">
        {"← Back to Home"}
      </Link>
      <div className="flex-grow overflow-auto space-y-4">
        {chatHistory.map(chat => (
          <div
            key={chat.session_id}
            className="p-3 sm:p-4 border border-cyan-400 rounded hover:bg-transparent/50"
          >
            <div className="text-sm sm:text-base">Target Phrase: {chat.target_phrase}</div>
            <div className="text-sm sm:text-base">State: {chat.state.toLowerCase() }</div>
            <div className="flex flex-row gap-x-4 mt-2">
              <button
                onClick={() => handleShare(chat.session_id)}
                className="text-white hover:text-cyan-300 hover:underline text-sm sm:text-base"
              >
                {!shareStatus[chat.session_id] ? "Share" : "Unshare"}
              </button>
              <button
                onClick={() => navigate(`/history/${chat.session_id}`)}
                className="text-white hover:text-cyan-300 hover:underline text-sm sm:text-base"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;