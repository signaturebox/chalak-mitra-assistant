import { User, Moon, Sun, Globe, ChevronRight, LogOut, Shield, Star } from "lucide-react";
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

  const features = [
    { emoji: "📱", label: lang === "hi" ? "लॉगबुक" : "Logbook", to: "/tools" },
    { emoji: "🔧", label: lang === "hi" ? "टूल्स" : "Tools", to: "/tools" },
    { emoji: "🎯", label: lang === "hi" ? "ट्रेनिंग" : "Training", to: "/quiz" },
    { emoji: "🎫", label: lang === "hi" ? "सहायता" : "Support", to: "/notifications" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Hero */}
      <div className="m3-card-elevated overflow-hidden">
        <div className="railway-gradient px-6 pt-10 pb-6 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-white/5" />
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-white">{profile?.full_name || "User"}</h2>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <Shield className="h-3 w-3 text-white/50" />
              <p className="text-white/60 text-[12px] font-medium">{profile?.cms_id || roleLabel}</p>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-border/30">
          <div className="py-4 text-center">
            <p className="text-xl font-bold text-foreground">{bookmarkCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Bookmarks</p>
          </div>
          <div className="py-4 text-center">
            <p className="text-xl font-bold text-foreground">{downloadCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Downloads</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-4 gap-2.5 stagger-in">
        {features.map((f) => (
          <button key={f.label} onClick={() => navigate(f.to)}
            className="m3-card-elevated flex flex-col items-center gap-2 py-4 press-effect">
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-[10px] font-bold text-foreground text-center leading-tight">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="m3-surface stagger-in">
        <div className="m3-list-item py-4">
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
            {darkMode ? <Moon className="h-[18px] w-[18px] text-muted-foreground" /> : <Sun className="h-[18px] w-[18px] text-muted-foreground" />}
          </div>
          <span className="flex-1 text-[14px] font-medium text-foreground">{t("profile.darkMode")}</span>
          <button onClick={toggleDark} className={`w-[52px] h-[32px] rounded-full transition-all relative ${darkMode ? "bg-primary" : "bg-muted-foreground/25"}`}>
            <span className={`absolute top-[4px] w-6 h-6 rounded-full bg-white shadow-md transition-all ${darkMode ? "left-[24px]" : "left-[3px]"}`} />
          </button>
        </div>
        <div className="m3-list-item py-4">
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
            <Globe className="h-[18px] w-[18px] text-muted-foreground" />
          </div>
          <span className="flex-1 text-[14px] font-medium text-foreground">{t("profile.language")}</span>
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="m3-chip m3-chip-tonal text-[12px]">{lang === "en" ? "हिन्दी" : "English"}</button>
        </div>
        <button onClick={handleSignOut} className="m3-list-item py-4 w-full">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-[18px] w-[18px] text-destructive" />
          </div>
          <span className="flex-1 text-[14px] text-destructive font-semibold text-left">{lang === "hi" ? "लॉगआउट" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
