import { User, Moon, Sun, Globe, ChevronRight, LogOut } from "lucide-react";
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
    queryFn: async () => { if (!user) return 0; const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id); return count ?? 0; },
    enabled: !!user,
  });
  const { data: downloadCount } = useQuery({
    queryKey: ["profile-downloads"],
    queryFn: async () => { if (!user) return 0; const { count } = await supabase.from("download_history").select("*", { count: "exact", head: true }).eq("user_id", user.id); return count ?? 0; },
    enabled: !!user,
  });

  const toggleDark = () => { setDarkMode(!darkMode); document.documentElement.classList.toggle("dark"); };
  const handleSignOut = async () => { await signOut(); navigate("/auth"); };
  const roleLabel = roles.length > 0 ? roles.map(r => r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())).join(", ") : "Crew User";

  const stats = [
    { value: bookmarkCount ?? 0, label: "Bookmarks", emoji: "📌" },
    { value: downloadCount ?? 0, label: "Downloads", emoji: "📥" },
  ];

  const features = [
    { emoji: "📱", label: lang === "hi" ? "डिजिटल लॉगबुक" : "Digital Logbook", to: "/tools" },
    { emoji: "🔧", label: lang === "hi" ? "टूल्स" : "Crew Tools", to: "/tools" },
    { emoji: "🎯", label: lang === "hi" ? "ट्रेनिंग" : "Training", to: "/quiz" },
    { emoji: "🎫", label: lang === "hi" ? "सहायता" : "Support", to: "/notifications" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Profile Card */}
      <div className="native-card overflow-hidden">
        <div className="railway-gradient px-5 pt-8 pb-5 text-center">
          <div className="w-20 h-20 rounded-full bg-white/15 border-[3px] border-white/25 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-lg font-bold text-white">{profile?.full_name || "User"}</h2>
          <p className="text-white/60 text-[12px] mt-0.5">{profile?.cms_id || roleLabel}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border/40">
          {stats.map((s) => (
            <div key={s.label} className="py-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-4 gap-2">
        {features.map((f) => (
          <button key={f.label} onClick={() => navigate(f.to)}
            className="native-card flex flex-col items-center gap-1.5 p-3 active:scale-95 transition-transform">
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="native-section">
        <div className="native-row">
          {darkMode ? <Moon className="h-[18px] w-[18px] text-muted-foreground" /> : <Sun className="h-[18px] w-[18px] text-muted-foreground" />}
          <span className="flex-1 text-[14px] text-foreground">{t("profile.darkMode")}</span>
          <button onClick={toggleDark} className={`w-[44px] h-[26px] rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-muted-foreground/30"}`}>
            <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "left-[21px]" : "left-[3px]"}`} />
          </button>
        </div>
        <div className="native-row">
          <Globe className="h-[18px] w-[18px] text-muted-foreground" />
          <span className="flex-1 text-[14px] text-foreground">{t("profile.language")}</span>
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="pill-btn pill-btn-inactive text-[11px]">{lang === "en" ? "हिन्दी" : "English"}</button>
        </div>
        <button onClick={handleSignOut} className="native-row w-full">
          <LogOut className="h-[18px] w-[18px] text-destructive" />
          <span className="flex-1 text-[14px] text-destructive font-medium">{lang === "hi" ? "लॉगआउट" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
