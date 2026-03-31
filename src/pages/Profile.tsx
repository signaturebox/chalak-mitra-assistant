import { User, MapPin, Building, Bell, Moon, Sun, LogOut, Bookmark, Globe, FileText } from "lucide-react";
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
  const [notifications, setNotifications] = useState(true);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="stat-card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{profile?.full_name || "User"}</h2>
          <p className="text-sm text-muted-foreground">{profile?.designation || roleLabel}</p>
          {profile?.cms_id && <p className="text-xs text-muted-foreground mt-0.5">CMS ID: {profile.cms_id}</p>}
        </div>
      </div>

      <div className="stat-card divide-y divide-border">
        {[
          { icon: Building, label: t("profile.role"), value: roleLabel },
          { icon: MapPin, label: t("profile.email"), value: user?.email || "—" },
          { icon: FileText, label: t("profile.phone"), value: profile?.phone || user?.phone || "—" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[180px]">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-center py-4">
          <Bookmark className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{bookmarkCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{t("profile.bookmarks")}</p>
        </div>
        <div className="stat-card text-center py-4">
          <FileText className="h-5 w-5 mx-auto text-railway-info mb-1" />
          <p className="text-lg font-bold text-foreground">{downloadCount ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{t("profile.downloads")}</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("profile.settings")}</h3>
        <div className="stat-card divide-y divide-border">
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
              className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium transition-colors"
            >
              {lang === "en" ? t("profile.hindi") : t("profile.english")}
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{t("profile.notifications")}</span>
            </div>
            <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">{t("profile.signOut")}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
