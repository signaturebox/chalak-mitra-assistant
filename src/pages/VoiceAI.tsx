import { useState } from "react";
import { ArrowLeft, Mic, Send, Bot, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

export default function VoiceAI() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "नमस्ते! मैं चालक मित्र AI हूँ। लोको फॉल्ट, नियम या किसी भी सहायता के लिए पूछें।", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: "user", text: input, time: now }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, {
        role: "bot",
        text: "यह एक डेमो रिस्पॉन्स है। AI backend कनेक्ट करने पर real-time उत्तर मिलेंगे।",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="press-effect"><ArrowLeft size={22} /></button>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold">Chalak Mitra AI</h1>
          <p className="text-[10px] opacity-80">Railway Voice Assistant</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 no-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "bot" && (
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-violet-600" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md"
            }`}>
              {msg.text}
              <div className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</div>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <UserIcon size={14} className="text-primary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-3">
        <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent text-sm py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center press-effect">
            <Mic size={18} className="text-orange-500" />
          </button>
          <button onClick={send} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center press-effect">
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
