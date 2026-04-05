import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, MicOff, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

export default function VoiceAI() {
  const navigate = useNavigate();
  const chatRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "नमस्ते! 🙏 मैं चालक मित्र AI हूँ।\n\nलोको फॉल्ट, नियम, या किसी भी सहायता के लिए पूछें। मैं हिंदी और English दोनों में मदद कर सकता हूँ।", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: "user", text: input, time: now }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, {
        role: "bot",
        text: "यह एक डेमो रिस्पॉन्स है। AI backend connect करने पर real-time उत्तर मिलेंगे।\n\nआप fault codes, rules, या procedures के बारे में पूछ सकते हैं।",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1200);
  };

  const suggestions = ["WAP-7 fault codes", "GR 3.67 explain", "SPAD prevention steps", "Night duty rules"];

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white px-4 py-3">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5" />
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center press-effect">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <h1 className="text-[14px] font-extrabold tracking-tight">Chalak Mitra AI</h1>
            <p className="text-[9px] font-medium opacity-70 tracking-wide">RAILWAY VOICE ASSISTANT</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-semibold opacity-80">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar bg-muted/20">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-violet-600 dark:text-violet-400" />
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-3 text-[13px] leading-relaxed font-medium ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm"
                  : "bg-card text-card-foreground border border-border/60 rounded-2xl rounded-bl-md card-elevated"
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className={`text-[9px] mt-1.5 text-right font-semibold ${msg.role === "user" ? "opacity-60" : "text-muted-foreground"}`}>{msg.time}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <UserIcon size={14} className="text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Bot size={14} className="text-violet-600" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 card-elevated">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions (show when few messages) */}
        {messages.length <= 1 && (
          <div className="pt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-semibold text-foreground press-effect"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border px-3 py-2.5">
        <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-1 border border-border/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your question..."
            className="flex-1 bg-transparent text-[13px] font-medium py-2.5 outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center press-effect border border-orange-500/20">
            <Mic size={16} className="text-orange-500" />
          </button>
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center press-effect disabled:opacity-40 shadow-sm"
          >
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
