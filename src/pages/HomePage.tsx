import { Search, BookOpen, Building2, Zap, Mic, Bot, Gavel, Bell, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { to: "/search", icon: Zap, label: "Fault Search", labelHi: "फॉल्ट खोज", gradient: "from-orange-500 to-red-500", emoji: "⚡" },
  { to: "/troubleshoot", icon: Bot, label: "AI Troubleshoot", labelHi: "AI समस्या निवारण", gradient: "from-violet-500 to-purple-600", emoji: "🤖" },
  { to: "/voice-ai", icon: Mic, label: "Voice AI", labelHi: "वॉइस AI", gradient: "from-blue-500 to-cyan-500", emoji: "🎙️" },
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
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground font-medium">{greeting()} 👋</p>
          <h1 className="text-[22px] font-extrabold text-foreground tracking-tight leading-tight">
            {profile?.full_name || (lang === "hi" ? "चालक मित्र" : "Chalak Mitra")}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
      </div>

      {/* Quick Actions — Horizontal scroll with gradient cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {quickActions.map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            className={`snap-start shrink-0 w-[150px] rounded-3xl bg-gradient-to-br ${item.gradient} p-4 text-white press-effect`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
              <span className="text-xl">{item.emoji}</span>
            </div>
            <p className="text-[14px] font-bold leading-tight">{lang === "hi" ? item.labelHi : item.label}</p>
            <div className="flex items-center gap-1 mt-1.5 text-white/70">
              <Sparkles className="h-3 w-3" />
              <span className="text-[10px] font-medium">Quick Access</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Shortcuts — Card list */}
      <div className="m3-surface stagger-in">
        {shortcuts.map((item) => (
          <Link key={item.label} to={item.to} className="m3-list-item py-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center">
              <item.icon className="h-[20px] w-[20px] text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-semibold text-foreground block">{lang === "hi" ? item.labelHi : item.label}</span>
              <span className="text-[11px] text-muted-foreground">{lang === "hi" ? item.descHi : item.desc}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
        ))}
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
          {lang === "hi" ? "सभी मॉड्यूल" : "All Modules"}
        </h2>
        <div className="grid grid-cols-3 gap-2 stagger-in">
          {modules.map((mod) => (
            <Link
              key={mod.label}
              to={mod.to}
              className="m3-card-elevated flex flex-col items-center justify-center gap-2 py-4 px-2 press-effect"
            >
              <span className="text-[28px] leading-none">{mod.icon}</span>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                {lang === "hi" ? mod.labelHi : mod.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-2">
        <p className="text-[10px] text-muted-foreground/50 font-medium">
          NWR Chalak Mitra v1.0 • North Western Railway
        </p>
      </div>
    </div>
  );
}
