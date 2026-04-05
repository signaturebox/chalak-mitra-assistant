import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User as UserIcon, Settings, ChevronRight, LogOut, Bell,
  Moon, Sun, Shield, HelpCircle, Award, BookOpen, Bookmark,
  FileText, Clock, Star, Edit3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "settings">("info");
  const [isDark, setIsDark] = useState(false);

  const stats = [
    { icon: BookOpen, value: "12", label: "Quizzes", color: "text-blue-500" },
    { icon: Award, value: "3", label: "Certificates", color: "text-amber-500" },
    { icon: Bookmark, value: "8", label: "Bookmarks", color: "text-emerald-500" },
    { icon: Clock, value: "45h", label: "Study Time", color: "text-purple-500" },
  ];

  const activities = [
    { icon: BookOpen, title: "CLI Quiz Completed", desc: "Score: 8/10 — Traction Motor", time: "2 hrs ago", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { icon: FileText, title: "Manual Downloaded", desc: "WAP-7 Maintenance Guide", time: "Yesterday", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
    { icon: Star, title: "Certificate Earned", desc: "Safety Protocol — Grade A", time: "3 days ago", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  ];

  const settingsItems = [
    { icon: Bell, label: "Notifications", desc: "Push & in-app alerts" },
    { icon: Shield, label: "Privacy & Security", desc: "Password, sessions" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQ, raise ticket" },
    { icon: FileText, label: "About App", desc: "Version, licenses" },
  ];

  const tabs = [
    { id: "info" as const, label: "Info" },
    { id: "activity" as const, label: "Activity" },
    { id: "settings" as const, label: "Settings" },
  ];

  return (
    <div className="animate-fade-in">
      {/* ===== PROFILE HERO ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground px-5 pt-4 pb-20">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5" />
        <div className="absolute bottom-4 -left-8 w-32 h-32 rounded-full bg-white/5" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center press-effect">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[15px] font-bold">My Profile</h1>
          <button className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center press-effect">
            <Edit3 size={16} />
          </button>
        </div>

        {/* Avatar + Info */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center mb-3">
            <UserIcon size={34} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Crew Member</h2>
          <p className="text-[11px] font-medium opacity-70 mt-0.5">CMS: 12345678 • LP (Goods)</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[9px] font-bold tracking-wide">NWR</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[9px] font-bold tracking-wide">JODHPUR</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[9px] font-bold tracking-wide">ABR LOBBY</span>
          </div>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-card rounded-2xl border border-border card-elevated p-1">
          <div className="grid grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`flex flex-col items-center py-3 ${i > 0 ? "border-l border-border/50" : ""}`}>
                <s.icon size={16} className={s.color} />
                <span className="text-[15px] font-extrabold text-foreground mt-1">{s.value}</span>
                <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="px-4 mt-5">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 press-effect ${
                activeTab === tab.id
                  ? "bg-card text-foreground card-elevated"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 mt-4 pb-8"
        >
          {/* INFO TAB */}
          {activeTab === "info" && (
            <div className="space-y-3">
              {[
                { label: "Full Name", value: "Crew Member" },
                { label: "CMS ID", value: "12345678" },
                { label: "Designation", value: "Loco Pilot (Goods)" },
                { label: "Division", value: "Jodhpur" },
                { label: "Lobby / HQ", value: "Abu Road" },
                { label: "Mobile", value: "98XXXXXX90" },
                { label: "Email", value: "crew@railway.gov.in" },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between p-3.5 bg-card rounded-xl border border-border/50">
                  <span className="text-[11px] font-semibold text-muted-foreground">{field.label}</span>
                  <span className="text-[12px] font-bold text-foreground">{field.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {activities.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-3.5 bg-card rounded-xl border border-border/50"
                >
                  <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center flex-shrink-0`}>
                    <act.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.desc}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap mt-0.5">{act.time}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => {
                  setIsDark(!isDark);
                  document.documentElement.classList.toggle("dark");
                }}
                className="w-full flex items-center justify-between p-3.5 bg-card rounded-xl border border-border/50 press-effect"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    {isDark ? <Moon size={16} className="text-foreground" /> : <Sun size={16} className="text-foreground" />}
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-foreground">Dark Mode</p>
                    <p className="text-[10px] text-muted-foreground">{isDark ? "On" : "Off"}</p>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${isDark ? "bg-primary" : "bg-muted"}`}>
                  <motion.div
                    className="w-5 h-5 rounded-full bg-card shadow-sm"
                    animate={{ x: isDark ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>

              {settingsItems.map((si) => (
                <button
                  key={si.label}
                  className="w-full flex items-center justify-between p-3.5 bg-card rounded-xl border border-border/50 press-effect"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <si.icon size={16} className="text-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] font-bold text-foreground">{si.label}</p>
                      <p className="text-[10px] text-muted-foreground">{si.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}

              {/* Logout */}
              <div className="pt-4">
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full flex items-center justify-center gap-2 p-3.5 bg-destructive/10 rounded-xl text-destructive font-bold text-[13px] press-effect border border-destructive/20"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
