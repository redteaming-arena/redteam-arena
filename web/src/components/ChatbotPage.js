import React, { useState, useRef, useEffect } from "react";
import { gameStreamEvent, writeSession } from "../services/api";
import SubmitIcon from "../assets/submit";


const ChatbotPage = ({ timeLeft, onSuccess, phrase, sessionId, onAbout, showAbout = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState("");
  const eventSourceRef = useRef(null);
  const currentStreamedMessageRef = useRef(""); // Ref to hold the latest streamed message
  const textareaRef = useRef(null);
  const scrollableRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  
  const scrollToBottom = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedMessage]);



  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSend = async () => {
    if (input.trim() && timeLeft > 0 && !isLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");
      setCurrentStreamedMessage("");
  
      try {
        const eventSource = gameStreamEvent(sessionId, input);
        
        eventSourceRef.current = eventSource.subscribe({
          onopen: () => {
            setCurrentStreamedMessage("");
            setIsLoading(true);
            console.log("open connection stream");
          },
          onmessage: (event) => {
            if (event.event === 'end') {
              // Handle end of stream
              console.log("Stream ended:", event.data);
              setIsLoading(false);
              if (currentStreamedMessageRef.current) {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { text: currentStreamedMessageRef.current, sender: "bot" },
                ]);
              }
              eventSourceRef.current.close();
              return;
            }
  
            const data = JSON.parse(event.data);
            
            setCurrentStreamedMessage((prevMessage) => {
              const updatedMessage = prevMessage + data.model_response;
              currentStreamedMessageRef.current = updatedMessage;
              return updatedMessage;
            });
  
            if (data.game_state === "win") {
              writeSession(sessionId)
              onSuccess(60 - timeLeft);
              eventSourceRef.current.close();
            }
          },
          onclose: () => {
            console.log("Stream ended");
            setIsLoading(false);
          },
          onerror: (error) => {
            setIsLoading(false);
            console.error("EventSource failed:", error);
          },
        });
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, I couldn't process that request.", sender: "bot" },
        ]);
      } finally {
        setCurrentStreamedMessage(""); // Reset for the next message
      }
    }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-vt323 no-scroll">
      <div className="w-full sm:max-w-[60%] mx-auto p-4 flex justify-between items-center">
        <h1 className="text-lg text-white text-center">
          Objective: {phrase || "Loading..."}
        </h1>
        <div className="text-xl">{timeLeft}s</div>
      </div>
      <div className="flex-grow overflow-hidden flex flex-col w-full sm:max-w-[60%] mx-auto p-4 space-y-4 sm:rounded-lg no-scroller">
        <div className="flex-grow overflow-auto p-4 space-y-4" ref={scrollableRef}>
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-full inline-block ${
                    message.sender === "bot"
                      ? "bg-black text-green-500 text-left"
                      : " text-white border border-black text-right"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          { isLoading && (
            <div className="flex justify-start">
              <div className="p-2 rounded-lg max-w-[95%] inline-block bg-black text-green-500 text-left z-10">
                {currentStreamedMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-black text-white p-4 w-full sm:max-w-[60%] mx-auto">
        <fieldset className="border border-white p-2">
          <div className="relative flex">
            <div className="w-full">
              <textarea
                ref={textareaRef}
                className="text-md w-full min-h-[32px] max-h-[200px] bg-black text-white resize-none focus:outline-none overflow-y-auto"
                placeholder="Enter your prompt here..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={2}
              />
            </div>
            <div className="h-full">
              {input && (
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-0 bg-black border-[1px] text-white px-[0.1rem] py-[0.1rem] rounded hover:bg-white hover:text-black focus:outline-none opacity-80"
                >
                  <SubmitIcon />
                </button>
              )}
            </div>
          </div>
        </fieldset>
        <div className="mt-2 flex justify-between items-center text-[10px] sm:text-sm text-white sm:block hidden">
          {/* {input && <span>Use <code className="bg-zinc-800 p-1 rounded-lg">Shift + Return</code> for new line</span>} */}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
