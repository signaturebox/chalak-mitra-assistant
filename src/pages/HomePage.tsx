import { Search, BookOpen, Gavel, Zap, Train, Shield, Wrench, TrafficCone, Ban, Building2, AlertTriangle, FileText, Bell, User, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-train.jpg";

const quickActions = [
  { to: "/search", icon: Search, label: "Fault Search", labelHi: "दोष खोज" },
  { to: "/quiz", icon: BookOpen, label: "CLI Quiz", labelHi: "CLI क्विज़" },
  { to: "/divisions", icon: Building2, label: "Divisions", labelHi: "डिवीजन" },
];

const categories = [
  { to: "/notifications", icon: "👤", label: "GM Message", labelHi: "GM संदेश", color: "border-blue-400" },
  { to: "/notifications", icon: "⚡", label: "PCEE Message", labelHi: "PCEE संदेश", color: "border-green-400" },
  { to: "/notifications", icon: "📋", label: "NWR Notices", labelHi: "NWR नोटिस", color: "border-orange-400" },
  { to: "/knowledge?type=electric", icon: "🚃⚡", label: "Electric Loco", labelHi: "विद्युत लोको", color: "border-yellow-400" },
  { to: "/knowledge?type=diesel", icon: "🚂", label: "Diesel Loco", labelHi: "डीज़ल लोको", color: "border-pink-400" },
  { to: "/knowledge?type=vande", icon: "🚄", label: "Vande Bharat", labelHi: "वंदे भारत", color: "border-cyan-400" },
  { to: "/knowledge?type=memu", icon: "🚈", label: "MEMU", labelHi: "मेमू", color: "border-blue-300" },
  { to: "/tools", icon: "🛡️", label: "Kachav", labelHi: "कछव", color: "border-green-300" },
  { to: "/knowledge?type=traffic", icon: "🚦", label: "Traffic", labelHi: "ट्रैफ़िक", color: "border-orange-300" },
  { to: "/tools", icon: "🚫", label: "SPAD Prevention", labelHi: "SPAD रोकथाम", color: "border-red-400" },
  { to: "/rulebooks", icon: "📕", label: "Rule Books", labelHi: "नियम पुस्तिका", color: "border-green-500" },
  { to: "/tools", icon: "🔧", label: "C & W", labelHi: "C & W", color: "border-yellow-500" },
  { to: "/tools", icon: "⚡🔌", label: "OHE", labelHi: "OHE", color: "border-blue-500" },
  { to: "/tools", icon: "🏗️", label: "P-Way", labelHi: "P-Way", color: "border-green-600" },
  { to: "/notifications", icon: "📄", label: "About NWR", labelHi: "NWR के बारे में", color: "border-cyan-500" },
];

export default function HomePage() {
  const { profile } = useAuth();
  const { lang } = useLanguage();

  const { data: notifications } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-5 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden md:rounded-2xl">
        <img src={heroImg} alt="Indian Railway" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">
            🚂 NWR Chalak Mitra
          </h1>
          <p className="text-white/80 text-sm mt-1">
            North Western Railway — {lang === "hi" ? "चालक मित्र" : "Loco Pilot Companion"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">
                {lang === "hi" ? item.labelHi : item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="px-4 md:px-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 text-white text-center font-bold tracking-wide text-sm uppercase shadow-md">
          {lang === "hi" ? "NWR चालक मित्र में आपका स्वागत है" : "WELCOME TO NWR CHALAK MITRA"}
        </div>
      </div>

      {/* Category Grid */}
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className={`flex flex-col items-center gap-2 bg-card rounded-2xl p-3.5 border-t-4 ${cat.color} shadow-sm hover:shadow-md transition-all active:scale-95`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                {lang === "hi" ? cat.labelHi : cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-0 pb-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          🚂<br />
          NWR Chalak Mitra v1.0.0 — North Western Railway • Safe Journey!
        </p>
      </div>
    </div>
  );
}
