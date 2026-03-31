import { Mic, MicOff, Send, Sparkles } from "lucide-react";
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
    <div className="flex flex-col items-center min-h-[65vh] justify-center animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {lang === "hi" ? "वॉइस AI" : "Voice AI"}
        </h1>
        <p className="text-[13px] text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
          {lang === "hi" ? "अपनी समस्या बताएं या फॉल्ट कोड बोलें" : "Describe your problem or speak a fault code"}
        </p>
      </div>

      {/* Mic Button */}
      <div className="relative">
        {isListening && (
          <>
            <div className="absolute -inset-4 rounded-full bg-destructive/15 animate-pulse-ring" />
            <div className="absolute -inset-4 rounded-full bg-destructive/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
          </>
        )}
        <button
          onClick={() => setIsListening(!isListening)}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all press-effect ${
            isListening
              ? "gradient-rose shadow-2xl"
              : "gradient-teal shadow-2xl glow-teal"
          }`}
        >
          {isListening ? <MicOff className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-white" />}
        </button>
      </div>

      <p className="text-[13px] text-muted-foreground font-medium">
        {isListening ? (lang === "hi" ? "🔴 सुन रहा है..." : "🔴 Listening...") : (lang === "hi" ? "माइक टैप करें" : "Tap to speak")}
      </p>

      {/* Text input */}
      <div className="w-full max-w-sm flex gap-2.5">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "hi" ? "या यहाँ टाइप करें..." : "Or type here..."}
          className="m3-input flex-1" />
        <button className="w-13 h-13 rounded-2xl gradient-teal flex items-center justify-center text-white shrink-0 shadow-lg glow-teal press-effect" style={{ width: 52, height: 52 }}>
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="w-full max-w-sm flex flex-wrap gap-2 justify-center">
        {suggestions.map((s) => (
          <button key={s} onClick={() => setQuery(s)}
            className="m3-chip m3-chip-outline text-[12px]">
            <Sparkles className="h-3 w-3" />{s}
          </button>
        ))}
      </div>
    </div>
  );
}
