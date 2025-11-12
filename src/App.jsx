import { useState } from "react";
import "./ChatApp.css"; // Create a CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faTrashCan,
  faPaperPlane,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";

// ensure fallback to deployed backend if VITE var is missing
const backendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  "https://my-chatbot-api-frcgame3gufpfuh2.westeurope-01.azurewebsites.net";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  // remove placeholder defaults so deployed build won't POST to junk paths
  const [settingsData, setSettingsData] = useState({
    apiUrl: "",
    apiKey: "",
  });

  const addMessage = (text, role) => {
    const newMessage = { text, role };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleUserInput = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    // Add the user message immediately
    addMessage(inputText, "user");
    const userInput = inputText;
    setInputText("");

    // Build chat message history
    const requestBody = {
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps people find information.",
        },
        { role: "user", content: userInput },
      ],
    };

    try {
      // use already-defined backendUrl (fallback to deployed or VITE var)
      console.log(
        "DEBUG: sendToBackend called. messages:",
        requestBody.messages
      );
      console.log("DEBUG: sending to URL:", `${backendUrl}/api/chat`);

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      console.log("DEBUG: fetch returned status", response.status);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errText}`);
      }

      const responseData = await response.json();
      console.log("DEBUG: backend response data:", responseData);

      // Handle various response shapes
      const assistantReply =
        responseData.text ??
        responseData.choices?.[0]?.message?.content ??
        responseData.choices?.[0]?.content ??
        responseData.reply ??
        JSON.stringify(responseData);

      addMessage(assistantReply, "assistant");
    } catch (error) {
      console.error("Error fetching data from backend:", error);
      addMessage(
        "Error connecting to backend: " + (error.message || ""),
        "assistant"
      );
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    // only store values if you want to override temporarily
    setSettingsData({
      apiUrl: settingsData.apiUrl,
      apiKey: settingsData.apiKey,
    });
    setShowSettings(false);
  };

  return (
    <div className="container">
      <h2>
        <FontAwesomeIcon icon={faRobot} /> AI Chatapp
      </h2>

      {showSettings && (
        <div className="settings-popup">
          <div className="settings-content">
            <label htmlFor="apiUrl">API URL:</label>
            <input
              type="text"
              id="apiUrl"
              value={settingsData.apiUrl}
              onChange={(e) =>
                setSettingsData({ ...settingsData, apiUrl: e.target.value })
              }
            />

            <label htmlFor="apiKey">API Key:</label>
            <input
              type="text"
              id="apiKey"
              value={settingsData.apiKey}
              onChange={(e) =>
                setSettingsData({ ...settingsData, apiKey: e.target.value })
              }
            />

            <button onClick={handleSaveSettings}>Save</button>
            <button onClick={handleSettingsClose}>Cancel</button>
          </div>
        </div>
      )}

      <div className="chat-app">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user" ? "user-message" : "assistant-message"
              }
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={handleUserInput}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>
            <FontAwesomeIcon icon={faPaperPlane} /> Send
          </button>
          <button onClick={handleClearChat}>
            <FontAwesomeIcon icon={faTrashCan} /> Clear
          </button>
          <button className="settings-button" onClick={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} /> Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
