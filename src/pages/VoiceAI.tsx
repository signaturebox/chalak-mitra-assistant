import { Mic, MicOff, Bot, Send } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VoiceAI() {
  const { lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState("");

  const suggestions = [
    lang === "hi" ? "ब्रेक फेल" : "Brake Failure",
    lang === "hi" ? "ट्रैक्शन मोटर" : "Traction Motor",
    lang === "hi" ? "पैंटोग्राफ" : "Pantograph",
    lang === "hi" ? "सिग्नल पासिंग" : "Signal Passing",
  ];

  return (
    <div className="flex flex-col items-center min-h-[65vh] justify-center animate-fade-in space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
        <Bot className="h-8 w-8 text-white" />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">
          {lang === "hi" ? "वॉइस AI सहायक" : "Voice AI"}
        </h1>
        <p className="text-[13px] text-muted-foreground max-w-[260px]">
          {lang === "hi" ? "अपनी समस्या बताएं या फॉल्ट कोड बोलें" : "Describe your problem or speak a fault code"}
        </p>
      </div>

      <button
        onClick={() => setIsListening(!isListening)}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
          isListening
            ? "bg-destructive shadow-destructive/30 animate-pulse"
            : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
        }`}
      >
        {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
      </button>

      <p className="text-[12px] text-muted-foreground">
        {isListening ? (lang === "hi" ? "सुन रहा है..." : "Listening...") : (lang === "hi" ? "माइक टैप करें" : "Tap to speak")}
      </p>

      <div className="w-full max-w-sm flex gap-2">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "hi" ? "या यहाँ टाइप करें..." : "Or type here..."}
          className="flex-1 h-11 px-4 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 active:scale-90 transition-transform">
          <Send className="h-5 w-5" />
        </button>
      </div>

      <div className="w-full max-w-sm flex flex-wrap gap-2 justify-center">
        {suggestions.map((s) => (
          <button key={s} onClick={() => setQuery(s)}
            className="pill-btn pill-btn-inactive">{s}</button>
        ))}
      </div>
    </div>
  );
}
