import { User, Crown, QrCode, Wrench, PersonStanding, Target, Ticket, Pencil, MessageCircle, Settings, LogOut, Moon, Sun, Globe, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { profile, roles, user, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const navigate = useNavigate();

  const { data: bookmarkCount } = useQuery({
    queryKey: ["profile-bookmarks"],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: downloadCount } = useQuery({
    queryKey: ["profile-downloads"],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase.from("download_history").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const toggleDark = () => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); };
  const handleSignOut = async () => { await signOut(); navigate("/auth"); };
  const roleLabel = roles.length > 0 ? roles.map(r => r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())).join(", ") : "Crew User";

  const stats = [
    { value: bookmarkCount ?? 0, label: lang === "hi" ? "गतिविधि" : "ACTIVITY", emoji: "📊" },
    { value: downloadCount ?? 0, label: lang === "hi" ? "कार्य" : "TASKS", emoji: "✅" },
    { value: "0%", label: lang === "hi" ? "प्रगति" : "PROGRESS", emoji: "🎯" },
    { value: "0.0", label: lang === "hi" ? "ड्यूटी घंटे" : "DUTY HRS", emoji: "⏰" },
  ];

  const features = [
    { emoji: "📱", label: lang === "hi" ? "डिजिटल लॉगबुक" : "Digital Logbook", to: "/tools" },
    { emoji: "🔧", label: lang === "hi" ? "टूल्स हिस्ट्री" : "Tools History", to: "/tools" },
    { emoji: "🏃", label: lang === "hi" ? "रनिंग रूम" : "Running Room", to: "/tools" },
    { emoji: "🎯", label: lang === "hi" ? "ट्रेनिंग क्विज़" : "Training Quizzes", to: "/quiz" },
    { emoji: "🎫", label: lang === "hi" ? "सहायता" : "Support Help", to: "/notifications" },
    { emoji: "✏️", label: lang === "hi" ? "व्यक्तिगत जानकारी" : "Personal Info", to: "/profile" },
    { emoji: "💬", label: lang === "hi" ? "ऐप फीडबैक" : "App Feedback", to: "/profile" },
    { emoji: "⚙️", label: lang === "hi" ? "सेटिंग्स" : "Settings", to: "/profile" },
  ];

  return (
    <div className="space-y-5 animate-fade-in -mx-4 -mt-4 md:mx-0 md:mt-0">
      {/* Profile Header */}
      <div className="railway-gradient pt-8 pb-6 px-4 text-center md:rounded-2xl">
        <div className="relative mx-auto w-24 h-24 mb-3">
          <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center">
            <span className="text-4xl">👑</span>
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          {profile?.full_name || "User"}
        </h2>
        <p className="text-white/70 text-sm mt-0.5">
          {profile?.cms_id || roleLabel}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            - DIVISION
          </span>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            TM
          </span>
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            -
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-3 border border-border/50 text-center shadow-sm">
              <span className="text-xl">{stat.emoji}</span>
              <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4 md:px-0">
        <div className="grid grid-cols-3 gap-3">
          {features.map((feat) => (
            <button
              key={feat.label}
              onClick={() => navigate(feat.to)}
              className="flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-3xl">{feat.emoji}</span>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{feat.label}</span>
            </button>
          ))}
          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-2 bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-3xl">🚪</span>
            <span className="text-[11px] font-semibold text-destructive text-center leading-tight">
              {lang === "hi" ? "लॉगआउट" : "Logout"}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Row */}
      <div className="px-4 md:px-0">
        <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm text-foreground">{t("profile.darkMode")}</span>
            </div>
            <button onClick={toggleDark} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${darkMode ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{t("profile.language")}</span>
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="px-4 md:px-0 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            📊 {lang === "hi" ? "हालिया गतिविधियाँ" : "Recent Activities"}
          </h3>
          <button className="text-xs text-primary font-medium">{lang === "hi" ? "सभी देखें" : "View All"}</button>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <span className="text-3xl">✨</span>
          <p className="text-sm text-muted-foreground mt-2">
            {lang === "hi" ? "कोई हालिया गतिविधि नहीं" : "No recent activities found"}
          </p>
        </div>
      </div>
    </div>
  );
}
