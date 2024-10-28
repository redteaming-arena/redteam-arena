import React, { useState, useRef, useEffect } from "react";
import { gameStreamEvent } from "../services/api";
import SubmitIcon from "../assets/submit";

const ChatbotPage = ({
  timeLeft,
  onSuccess,
  model,
  phrase,
  sessionId,
  timerDuration,
  onAbout,
  showAbout = false,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState("");
  const eventSourceRef = useRef(null);
  const currentStreamedMessageRef = useRef("");
  const textareaRef = useRef(null);
  const scrollableRef = useRef(null);

  useEffect(() => {
    textareaRef.current.focus();
  }, []);

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
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSend = async () => {
    if (input.trim() && timeLeft > 0 && !isLoading) {
      setMessages(prevMessages => [
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
          onmessage: event => {
            const data = JSON.parse(event.data);

            if (event.event === "end") {
              // Handle end of stream
              console.log("Stream ended:", event.data);
              setIsLoading(false);
              if (data.model_response) {
                setMessages(prevMessages => [
                  ...prevMessages,
                  { text: data.model_response, sender: "bot" },
                ]);
              }

              if (data.game_state === "win") {
                onSuccess(timerDuration - timeLeft, data.model_response);
                eventSourceRef.current.close();
              }

              eventSourceRef.current.close();
              return;
            }

            setCurrentStreamedMessage(prevMessage => {
              const updatedMessage = prevMessage + data.model_response;
              currentStreamedMessageRef.current = updatedMessage;
              return updatedMessage;
            });
          },
          onclose: () => {
            console.log("Stream ended");
            setIsLoading(false);
          },
          onerror: error => {
            setIsLoading(false);
            console.error("EventSource failed:", error);
          },
        });
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "Sorry, I couldn't process that request.", sender: "bot" },
        ]);
      } finally {
        setCurrentStreamedMessage(""); // Reset for the next message
      }
    }
  };

  const handleInput = event => {
    setInput(event.target.value);
    adjustHeight();
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-vt323 overfl">
      <div className="w-full p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl text-white text-center">
          Objective: {phrase || "Loading..."}
        </h1>
        <h1 className="text-xl sm:text-2xl text-white text-center">
          Opponent: {model || "Loading..."}
        </h1>
        <div className="text-2xl sm:text-3xl">{timeLeft}s</div>
      </div>
      <div className="flex-grow overflow-hidden flex flex-col w-full p-4 space-y-4 no-scroller">
        <div
          className="flex-grow overflow-auto p-4 space-y-4 mb-4"
          ref={scrollableRef}
        >
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-full inline-block text-lg sm:text-xl ${
                    message.sender === "bot"
                      ? "bg-black text-green-500 text-left"
                      : "text-white border border-black text-right"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg max-w-[95%] inline-block bg-black text-green-500 text-left z-10 text-lg sm:text-xl">
                {currentStreamedMessage}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-black text-white p-4 w-full pb-4">
        <fieldset className="border border-white p-2">
          <div className="relative flex flex-col sm:flex-row items-end">
            <div className="w-full mb-2 sm:mb-0 sm:mr-2">
              <textarea
                ref={textareaRef}
                className="text-lg sm:text-xl w-full min-h-[40px] max-h-[100px] sm:max-h-[200px] bg-black text-white resize-none focus:outline-none overflow-y-auto"
                placeholder="Enter your prompt here..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={2}
              />
            </div>
            <div className=" sm:w-auto">
              <button
                onClick={handleSend}
                className="w-full sm:w-auto bg-black border-[1px] text-white px-1 py-1 rounded hover:bg-white hover:text-black focus:outline-none"
              >
                <SubmitIcon />
              </button>
            </div>
          </div>
        </fieldset>
        <div className="mt-2 text-xs sm:text-sm text-white">
          {/* {input && <span>Use <code className="bg-zinc-800 p-1 rounded-lg">Shift + Return</code> for new line</span>} */}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
