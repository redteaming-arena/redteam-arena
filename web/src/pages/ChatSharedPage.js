import React, { useState, useRef, useEffect } from "react";
import { getSharedMessages } from "../services/api";
import { useParams } from "react-router-dom";

const ChatbotSharedPage = () => {
  const { session_id } = useParams();
  const [chat, setChat] = useState({});
  const [error, setError] = useState(null);
  const scrollableRef = useRef(null);

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await getSharedMessages(session_id);
        // console.log(response);
        setChat(response);
        setError(null);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        setError(
          "Either this session is not shared or this session does not exist"
        );
      }
    };

    fetchChatMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-black text-green-500 font-vt323 no-scroll">
        <div className="w-full sm:max-w-[80%] mx-auto p-4 flex justify-center items-center h-full">
          <div className="text-2xl text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-vt323 no-scroll">
      <div className="w-full sm:max-w-[80%] mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl text-white text-center">
          Objective: {chat.target_phrase || "Not Found"}
        </h1>
      </div>
      <div className="w-full sm:max-w-[80%] mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl text-white text-center">
          Username: {chat.username || "Anonymous"}
        </h1>
      </div>
      <div className="flex-grow overflow-hidden flex flex-col w-full sm:max-w-[80%] mx-auto p-4 space-y-4 sm:rounded-lg no-scroller">
        <div
          className="flex-grow overflow-auto p-4 space-y-4 mb-8"
          ref={scrollableRef}
        >
          {chat.chat_history?.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-full inline-block text-xl ${
                    message.role === "assistant"
                      ? "bg-black text-green-500 text-left"
                      : " text-white border border-black text-right"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatbotSharedPage;
