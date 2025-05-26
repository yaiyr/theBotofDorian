import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import dorianLogo from "../assets/dorianLogo.png";
import dorianBotLogo from "../assets/dorianBotLogo.png";
import { PlusIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";

export default function ChatScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTopic = location.state?.topic || "";
  const mode = location.state?.mode || "confirm";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [matchQueue, setMatchQueue] = useState([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const initialHandled = useRef(false);

  const [isTyping, setIsTyping] = useState(false);

  const yesKeywords = ["yes", "yeah", "yup", "sure", "correct", "omsim", "yuh"];
  const noKeywords = ["no", "nope", "nah", "not really"];
  const thanksKeywords = ["thanks", "thank you", "ty", "thank u", "salamat"];

  const gratitudeReplies = [
    "You're most gracious — I'm flattered.",
    "It was a pleasure, truly.",
    "No thanks needed — beauty, after all, is meant to be shared.",
  ];

  useEffect(() => {
    if (!initialTopic) {
      setMessages([
        {
          sender: "bot",
          text: "Welcome, seeker. What question stirs your curiosity about my life, my sins, or my story?",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchInitialResponse = async () => {
      if (!initialTopic || initialHandled.current) return;
      console.log("📌 useEffect running with topic:", initialTopic); // ✅ log this
      initialHandled.current = true; // ✅ lock it permanently

      if (mode === "direct") {
        try {
          const res = await fetch("https://dorian-backend.onrender.com/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: initialTopic }),
          });

          const data = await res.json();
          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.sender === "bot" && msg.text === data.response
            );
            if (!exists)
              return [...prev, { sender: "bot", text: data.response }];
            return prev;
          });
        } catch (error) {
          console.error("Initial fetch failed:", error);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `You asked about "${initialTopic}", but I couldn’t fetch the answer.`,
            },
          ]);
        }
      } else {
        try {
          const res = await fetch("https://dorian-backend.onrender.com/api/chat/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: initialTopic }),
          });

          const data = await res.json();
          const matches = data?.matches || [];
          console.log("🎯 Matches received:", matches);

          if (matches.length > 0) {
            const first = matches[0];
            const lines = [
              `Ah, are we speaking of the ${first}, perhaps?`,
              `Would you say your inquiry concerns the ${first}?`,
              `Might you be referring to the ${first}?`,
              `Do you mean the ${first}? It does sound familiar.`,
              `Is it the ${first} that has caught your attention?`,
            ];
            const prompt = lines[Math.floor(Math.random() * lines.length)];

            setMessages((prev) => [...prev, { sender: "bot", text: prompt }]);
            setPendingPrompt(first);
            setMatchQueue(matches);
            setMatchIndex(0);
            setAwaitingConfirmation(true);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: "I'm afraid I couldn’t grasp your intent. Might you rephrase it, perhaps more delicately?",
              },
            ]);
          }
        } catch (error) {
          console.error("Match confirmation failed:", error);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Something went awry trying to interpret your question.",
            },
          ]);
        }
      }
    };

    fetchInitialResponse();
  }, [initialTopic]);

  const sendMessage = async () => {
    console.log("📨 sendMessage triggered with input:", input);
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const lower = input.trim().toLowerCase();

    if (awaitingConfirmation) {
      if (yesKeywords.includes(lower)) {
        setIsTyping(true);
        try {
          const res = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: pendingPrompt }),
          });
          const data = await res.json();
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { sender: "bot", text: data.response },
            ]);
            setIsTyping(false);
          }, 1000);
        } catch (error) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "How dreadful. I couldn't fetch the answer this time.",
            },
          ]);
        }
        setPendingPrompt(null);
        setAwaitingConfirmation(false);
        setMatchQueue([]);
        setMatchIndex(0);
        return;
      }

      if (noKeywords.includes(lower)) {
        const nextIndex = matchIndex + 1;
        if (matchQueue[nextIndex]) {
          const nextPrompt = matchQueue[nextIndex];
          const altSuggestions = [
            `Then perhaps you meant the ${nextPrompt}?`,
            `Could it be you're referring to the ${nextPrompt}?`,
            `Might the ${nextPrompt} be your interest?`,
            `Would the ${nextPrompt} be closer to your thoughts?`,
            `Shall we consider the ${nextPrompt}, then?`,
          ];
          const nextText =
            altSuggestions[Math.floor(Math.random() * altSuggestions.length)];

          setMessages((prev) => [...prev, { sender: "bot", text: nextText }]);
          setPendingPrompt(nextPrompt);
          setMatchIndex(nextIndex);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "I’ve offered all I can. Perhaps it’s best you explore the novel itself — it may reveal what I cannot.",
            },
          ]);
          setPendingPrompt(null);
          setAwaitingConfirmation(false);
          setMatchQueue([]);
          setMatchIndex(0);
        }
        return;
      }

      // Invalid confirmation input
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: 'Pardon, but I require a simple "yes" or "no" — clarity is so rare these days.',
        },
      ]);
      return;
    }

    if (thanksKeywords.includes(lower)) {
      const reply =
        gratitudeReplies[Math.floor(Math.random() * gratitudeReplies.length)];
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      return;
    }

    // Attempt to match topic
    try {
      setIsTyping(true);
      const res = await fetch("http://localhost:5000/api/chat/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const matches = data?.matches || [];

      if (matches.length > 0) {
        const first = matches[0];
        const lines = [
          `Ah, are we speaking of the ${first}, perhaps?`,
          `Would you say your inquiry concerns the ${first}?`,
          `Might you be referring to the ${first}?`,
          `Do you mean the ${first}? It does sound familiar.`,
          `Is it the ${first} that has caught your attention?`,
        ];
        const prompt = lines[Math.floor(Math.random() * lines.length)];

        setTimeout(() => {
          setMessages((prev) => [...prev, { sender: "bot", text: prompt }]);
          setIsTyping(false);
          setPendingPrompt(first);
          setMatchQueue(matches);
          setMatchIndex(0);
          setAwaitingConfirmation(true);
        }, 800);
      } else {
        const fallbackReplies = [
          "I'm intrigued, but I must admit — I don't quite follow. Could you elaborate?",
          "That’s an interesting thought, but I may need you to phrase it more clearly.",
          "Alas, even my portrait could not divine your intent — care to try again?",
          "I fear that escapes me for the moment. Could you reword it, dear inquirer?",
          "The shadows obscure your meaning. Might you cast more light upon it?",
        ];
        const reply =
          fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        setTimeout(() => {
          setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
          setIsTyping(false);
        }, 800);
      }
    } catch (error) {
      console.error("Match fetch failed:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "How terribly inconvenient — the server failed me.",
        },
      ]);
    }
  };

  return (
    <motion.div
      initial={{ backgroundColor: "#000000", opacity: 0 }}
      animate={{ backgroundColor: "#000000", opacity: 1 }}
      exit={{ backgroundColor: "#000000", opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-screen h-screen flex flex-col bg-black text-white"
    >
      {/* HEADER */}
      <div className="p-6">
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
            onClick={() => {
              navigate("/chat");
              window.location.reload();
            }}
            className="mt-4 px-9 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white text-lg cursor-pointer flex items-center gap-1"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </button>
        </div>
        <div className="h-9 w-full bg-gradient-to-r from-blue-500 to-red-600 mb-2" />
      </div>

      {/* CHAT MESSAGES - scrollable */}
      <div className="flex-1 overflow-y-auto px-25 py-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="flex items-center gap-2">
                <img src={dorianBotLogo} alt="Bot" className="w-14 h-16" />
                <div className="text-white text-md max-w-[80%] space-y-2">
                  {msg.text.split("\n").map((line, index) =>
                    line.trim().startsWith("-") ? (
                      <li key={index} className="list-disc ml-6">
                        {line.replace(/^-+/, "").trim()}
                      </li>
                    ) : (
                      <p key={index} className="leading-relaxed">
                        {line.trim()}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {msg.sender === "user" && (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-md max-w-[70%] whitespace-pre-line break-words">
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center">
            <img src={dorianBotLogo} alt="Bot" className="w-14 h-16" />
            <div className="flex gap-1 text-white text-2xl">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* FIXED INPUT BAR */}
      <div className="">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 mx-100 mb-15">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything about Dorian Gray..."
              className="w-full px-4 pr-12 py-3 rounded-full bg-white text-black focus:outline-none h-15"
            />
            <button
              onClick={sendMessage}
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
      </div>
    </motion.div>
  );
}
