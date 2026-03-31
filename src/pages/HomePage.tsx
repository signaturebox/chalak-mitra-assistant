import { Search, BookOpen, Building2, Zap, Mic, Bot, Gavel, Shield, Bell, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { to: "/search", icon: Zap, label: "Fault Search", labelHi: "फॉल्ट खोज", gradient: "from-orange-500 to-red-500" },
  { to: "/troubleshoot", icon: Bot, label: "AI Troubleshoot", labelHi: "AI समस्या निवारण", gradient: "from-violet-500 to-purple-600" },
  { to: "/voice-ai", icon: Mic, label: "Voice AI", labelHi: "वॉइस AI", gradient: "from-blue-500 to-cyan-500" },
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
  { to: "/divisions", icon: Building2, label: "Divisions", labelHi: "डिवीजन" },
  { to: "/quiz", icon: BookOpen, label: "CLI Quiz", labelHi: "CLI क्विज़" },
  { to: "/rulebooks", icon: Gavel, label: "Rule Books", labelHi: "नियम पुस्तिका" },
  { to: "/notifications", icon: Bell, label: "Alerts", labelHi: "अलर्ट" },
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
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting()} 👋</p>
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">
          {profile?.full_name || (lang === "hi" ? "चालक मित्र" : "Chalak Mitra")}
        </h1>
      </div>

      {/* Quick Actions — large horizontal cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {quickActions.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="snap-start shrink-0 w-[140px] rounded-2xl p-4 text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: `linear-gradient(145deg, var(--tw-gradient-stops))` }}
          >
            <div className={`w-[140px] -ml-4 -mt-4 -mr-4 rounded-2xl p-4 bg-gradient-to-br ${item.gradient}`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-[13px] font-bold leading-tight">{lang === "hi" ? item.labelHi : item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Shortcut Row */}
      <div className="native-section">
        {shortcuts.map((item, i) => (
          <Link key={item.label} to={item.to} className="native-row">
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
              <item.icon className="h-[18px] w-[18px] text-primary" />
            </div>
            <span className="flex-1 text-[14px] font-medium text-foreground">{lang === "hi" ? item.labelHi : item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </Link>
        ))}
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {lang === "hi" ? "सभी मॉड्यूल" : "All Modules"}
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {modules.map((mod) => (
            <Link
              key={mod.label}
              to={mod.to}
              className="native-card flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform"
            >
              <span className="text-[26px] leading-none">{mod.icon}</span>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                {lang === "hi" ? mod.labelHi : mod.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-2">
        <p className="text-[10px] text-muted-foreground/60">
          NWR Chalak Mitra v1.0 • North Western Railway
        </p>
      </div>
    </div>
  );
}
