import { Moon, Sun, Globe, LogOut, Shield } from "lucide-react";
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
      {/* Profile Card */}
      <div className="glass-card overflow-hidden">
        <div className="relative px-6 pt-10 pb-8 text-center overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-teal opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur border-[3px] border-white/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-white">{profile?.full_name || "User"}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <Shield className="h-3 w-3 text-white/50" />
              <p className="text-white/60 text-[11px] font-medium">{profile?.cms_id || roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-border/20 bg-card/50">
          <div className="py-4 text-center">
            <p className="text-xl font-bold text-gradient">{bookmarkCount ?? 0}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mt-0.5">Bookmarks</p>
          </div>
          <div className="py-4 text-center">
            <p className="text-xl font-bold text-gradient">{downloadCount ?? 0}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold mt-0.5">Downloads</p>
          </div>
        </div>
      </div>

      {/* Quick Features */}
      <div className="grid grid-cols-4 gap-2 stagger-in">
        {features.map((f) => (
          <button key={f.label} onClick={() => navigate(f.to)}
            className="glass flex flex-col items-center gap-1.5 py-4 press-effect">
            <span className="text-2xl">{f.emoji}</span>
            <span className="text-[9px] font-bold text-foreground text-center leading-tight">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="glass-strong divide-y divide-border/20 stagger-in">
        <div className="m3-list-item py-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
            {darkMode ? <Moon className="h-[17px] w-[17px] text-primary" /> : <Sun className="h-[17px] w-[17px] text-accent" />}
          </div>
          <span className="flex-1 text-[14px] font-medium text-foreground">{t("profile.darkMode")}</span>
          <button onClick={toggleDark} className={`w-[52px] h-[30px] rounded-full transition-all relative ${darkMode ? "gradient-teal" : "bg-muted-foreground/20"}`}>
            <span className={`absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-md transition-all ${darkMode ? "left-[23px]" : "left-[3px]"}`} />
          </button>
        </div>
        <div className="m3-list-item py-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
            <Globe className="h-[17px] w-[17px] text-muted-foreground" />
          </div>
          <span className="flex-1 text-[14px] font-medium text-foreground">{t("profile.language")}</span>
          <button onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="m3-chip m3-chip-tonal text-[12px]">{lang === "en" ? "हिन्दी" : "English"}</button>
        </div>
        <button onClick={handleSignOut} className="m3-list-item py-4 w-full">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-[17px] w-[17px] text-destructive" />
          </div>
          <span className="flex-1 text-[14px] text-destructive font-semibold text-left">{lang === "hi" ? "लॉगआउट" : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
