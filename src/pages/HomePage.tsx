import { Search, BookOpen, Building2, Zap, Mic, Bot, Gavel, Bell, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { to: "/search", label: "Fault Search", labelHi: "फॉल्ट खोज", emoji: "⚡", gradient: "gradient-amber" },
  { to: "/troubleshoot", label: "AI Troubleshoot", labelHi: "AI समस्या निवारण", emoji: "🤖", gradient: "gradient-indigo" },
  { to: "/voice-ai", label: "Voice AI", labelHi: "वॉइस AI", emoji: "🎙️", gradient: "gradient-teal" },
];

const modules = [
  { to: "/gm-messages", icon: "👤", label: "GM Message", labelHi: "GM संदेश" },
  { to: "/pcee-messages", icon: "📢", label: "PCEE Message", labelHi: "PCEE संदेश" },
  { to: "/nwr-notices", icon: "📋", label: "NWR Notices", labelHi: "NWR नोटिस" },
  { to: "/knowledge?type=electric", icon: "⚡", label: "Electric Loco", labelHi: "विद्युत लोको" },
  { to: "/knowledge?type=diesel", icon: "🚂", label: "Diesel Loco", labelHi: "डीज़ल लोको" },
  { to: "/knowledge?type=vande", icon: "🚄", label: "Vande Bharat", labelHi: "वंदे भारत" },
  { to: "/knowledge?type=memu", icon: "🚈", label: "MEMU", labelHi: "मेमू" },
  { to: "/tools", icon: "🛡️", label: "Kachav", labelHi: "कछव" },
  { to: "/knowledge?type=traffic", icon: "🚦", label: "Traffic", labelHi: "ट्रैफ़िक" },
  { to: "/tools", icon: "🚫", label: "SPAD Prevention", labelHi: "SPAD रोकथाम" },
  { to: "/rulebooks", icon: "📕", label: "Rule Books", labelHi: "नियम पुस्तिका" },
  { to: "/tools", icon: "🔧", label: "C & W", labelHi: "C & W" },
  { to: "/tools", icon: "🔌", label: "OHE", labelHi: "OHE" },
  { to: "/tools", icon: "🏗️", label: "P-Way", labelHi: "P-Way" },
  { to: "/notifications", icon: "ℹ️", label: "About NWR", labelHi: "NWR के बारे में" },
];

const shortcuts = [
  { to: "/divisions", icon: Building2, label: "Divisions", labelHi: "डिवीजन", desc: "Zone & Division info", descHi: "ज़ोन और डिवीजन की जानकारी" },
  { to: "/quiz", icon: BookOpen, label: "CLI Quiz", labelHi: "CLI क्विज़", desc: "Practice questions", descHi: "अभ्यास प्रश्न" },
  { to: "/rulebooks", icon: Gavel, label: "Rule Books", labelHi: "नियम पुस्तिका", desc: "G&SR, ACTM, Safety", descHi: "G&SR, ACTM, सुरक्षा" },
  { to: "/notifications", icon: Bell, label: "Alerts", labelHi: "अलर्ट", desc: "Notices & updates", descHi: "सूचनाएं और अपडेट" },
];

export default function HomePage() {
  const { profile } = useAuth();
  const { lang } = useLanguage();

  const { data: notifCount } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === "hi" ? "सुप्रभात" : "Good Morning";
    if (h < 17) return lang === "hi" ? "नमस्कार" : "Good Afternoon";
    return lang === "hi" ? "शुभ संध्या" : "Good Evening";
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting — Large display */}
      <div className="pt-1">
        <p className="text-[12px] text-muted-foreground font-medium tracking-wide uppercase">{greeting()}</p>
        <h1 className="text-[26px] font-bold text-foreground tracking-tight leading-tight mt-0.5">
          {profile?.full_name || (lang === "hi" ? "चालक मित्र" : "Chalak Mitra")} 👋
        </h1>
      </div>

      {/* Quick Actions — Vertical stack with icons */}
      <div className="space-y-2.5 stagger-in">
        {quickActions.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="glass-card flex items-center gap-4 p-4 press-effect group"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <span className="text-xl">{item.emoji}</span>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-foreground">{lang === "hi" ? item.labelHi : item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.to === "/search" ? (lang === "hi" ? "कोड खोजें और समाधान पाएं" : "Search codes & get solutions") :
                 item.to === "/troubleshoot" ? (lang === "hi" ? "AI से समस्या हल करें" : "AI-powered diagnostics") :
                 (lang === "hi" ? "बोलकर खोजें" : "Speak to search")}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Shortcuts — 2x2 grid */}
      <div className="grid grid-cols-2 gap-2.5 stagger-in">
        {shortcuts.map((item) => (
          <Link key={item.label} to={item.to} className="glass-card p-4 press-effect">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <item.icon className="h-[18px] w-[18px] text-primary" />
            </div>
            <p className="text-[13px] font-bold text-foreground">{lang === "hi" ? item.labelHi : item.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{lang === "hi" ? item.descHi : item.desc}</p>
          </Link>
        ))}
      </div>

      {/* All Modules */}
      <div>
        <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3 px-1">
          {lang === "hi" ? "सभी मॉड्यूल" : "All Modules"}
        </h2>
        <div className="grid grid-cols-3 gap-2 stagger-in">
          {modules.map((mod) => (
            <Link
              key={mod.label}
              to={mod.to}
              className="glass flex flex-col items-center justify-center gap-1.5 py-4 px-2 press-effect"
            >
              <span className="text-[26px] leading-none">{mod.icon}</span>
              <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                {lang === "hi" ? mod.labelHi : mod.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-2">
        <p className="text-[9px] text-muted-foreground/40 font-medium tracking-wide">
          NWR Chalak Mitra v1.0 • North Western Railway
        </p>
      </div>
    </div>
  );
}
