import { Mic, MicOff, Bot, Send } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VoiceAI() {
  const { lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6 animate-fade-in flex flex-col items-center min-h-[60vh] justify-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
        <Bot className="h-10 w-10 text-white" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">
          {lang === "hi" ? "वॉइस AI सहायक" : "Voice AI Assistant"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          {lang === "hi"
            ? "अपनी समस्या बताएं या फॉल्ट कोड बोलें"
            : "Describe your problem or speak a fault code"}
        </p>
      </div>

      <button
        onClick={() => setIsListening(!isListening)}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
          isListening
            ? "bg-red-500 shadow-red-500/30 animate-pulse"
            : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
        }`}
      >
        {isListening ? (
          <MicOff className="h-10 w-10 text-white" />
        ) : (
          <Mic className="h-10 w-10 text-white" />
        )}
      </button>

      <p className="text-xs text-muted-foreground">
        {isListening
          ? (lang === "hi" ? "सुन रहा है... बोलें" : "Listening... speak now")
          : (lang === "hi" ? "माइक टैप करें" : "Tap the mic to start")}
      </p>

      <div className="w-full max-w-sm flex gap-2 mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "hi" ? "या यहाँ टाइप करें..." : "Or type here..."}
          className="flex-1 h-12 px-4 rounded-2xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 active:scale-95">
          <Send className="h-5 w-5" />
        </button>
      </div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-2 mt-2">
        {[
          lang === "hi" ? "ब्रेक फेल" : "Brake Failure",
          lang === "hi" ? "ट्रैक्शन मोटर" : "Traction Motor",
          lang === "hi" ? "पैंटोग्राफ" : "Pantograph",
          lang === "hi" ? "सिग्नल पासिंग" : "Signal Passing",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            className="text-xs py-2.5 px-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors active:scale-95"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
