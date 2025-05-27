import { useNavigate } from "react-router-dom";
import { useState } from "react";
import dorianLogo from "../assets/dorianLogo.png";
import { PlusIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";

export default function StartScreen() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const topics = [
    {
      title: "Summary of the Novel",
      keyword: "summary of the novel",
      description: "A brief overview of the novel.",
    },
    {
      title: "Freudian Psychoanalysis",
      keyword: "freudian psychoanalysis",
      description:
        "An application of the Freudian Psychoanalysis for the novel.",
    },
    {
      title: "List of Characters",
      keyword: "list of characters",
      description: "A list of the principal characters in the novel.",
    },
    {
      title: "Themes & Symbolism",
      keyword: "main theme of the novel",
      description: "Exploration of major literary themes.",
    },
  ];

  const handleRedirect = async () => {
  if (!input.trim()) return;

  try {
    const res = await fetch("https://dorian-backend.onrender.com/api/chat/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const matched = data?.matches?.[0] || input.trim();

    navigate("/chat", {
      state: {
        topic: matched, // don't set any messages
        mode: "confirm" // let ChatScreen decide what to display
      },
    })
    console.log("🚀 Navigating to Chat with topic:", matched);
    setInput(""); // clear the input box
  } catch (error) {
    console.error("Match fetch failed:", error);
    navigate("/chat", {
      state: {
        topic: input.trim(),
        mode: "confirm",
      },
    });
    
  }
};

  return (
    <motion.div
      initial={{ backgroundColor: "#000000", opacity: 0 }}
      animate={{ backgroundColor: "#000000", opacity: 1 }}
      exit={{ backgroundColor: "#000000", opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-screen w-screen bg-black text-white p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <button className="cursor-pointer" onClick={() => navigate("*")}>
          <h1
            className="text-2xl font-inter font-thin tracking-widest text-white flex items-center gap-2 my-5"
            style={{ letterSpacing: "0.3em" }}
          >
            <img src={dorianLogo} alt="Logo" className="w-5 h-7 me-2" />
            <p>
              <span className="text-gray-200 font-light">TheBot</span>
              <span className="text-blue-400 font-medium">OfDorianGray</span>
            </p>
          </h1>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="mt-4 px-9 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white text-lg cursor-pointer flex items-center gap-1"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="h-9 w-full bg-gradient-to-r from-blue-500 to-red-600 my-5" />

      <div className="text-left mt-15 mb-6 ps-35">
        <h1 className="text-5xl">
          <span className="text-blue-400">Welcome,</span>{" "}
          <span className="text-red-600">Seeker</span>
        </h1>
        <h2 className="text-5xl text-gray-300 font-light">
          What insights are you searching for?
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 px-45">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() =>
              navigate("/chat", {
                state: {
                  topic: topic.keyword,
                  mode: "direct",
                },
              })
            }
            className="h-50 p-6 my-8 rounded-lg bg-white hover:bg-gray-100 hover:scale-105 transition cursor-pointer text-left shadow-md flex flex-col justify-start"
          >
            <h3 className="text-lg text-red-800 mb-4">{topic.title}</h3>
            <p className="text-md text-black">{topic.description}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mx-20 mt-40">
        <div className="relative flex-1 mx-100 mb-15">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRedirect()}
            placeholder="Ask me anything about Dorian Gray..."
            className="w-full px-4 pr-12 py-3 rounded-full bg-white text-black focus:outline-none h-15"
          />
          <button
            onClick={handleRedirect}
            disabled={!input.trim()}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition
                ${
                  input.trim()
                    ? "bg-blue-500 text-white hover:scale-105"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
          >
            <PaperAirplaneIcon className="h-5 w-5 transform rotate-320" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
