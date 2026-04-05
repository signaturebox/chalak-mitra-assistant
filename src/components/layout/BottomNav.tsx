import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, BookOpen, Mic, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/voice-ai", icon: Mic, label: "AI", special: true },
  { path: "/quiz", icon: BookOpen, label: "Quiz" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto px-3 pb-1">
        <div className="glass-strong rounded-2xl border border-border/60 card-elevated">
          <div className="flex items-center justify-around h-[3.75rem] px-1">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;

              if (tab.special) {
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className="relative -mt-5 press-effect"
                  >
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary shadow-primary/30"
                        : "bg-primary/90 shadow-primary/20"
                    }`}
                    style={{ width: 52, height: 52 }}
                    >
                      <Icon size={22} className="text-primary-foreground" />
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="navDot"
                        className="w-1 h-1 bg-primary rounded-full mx-auto mt-1"
                      />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full press-effect"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-[1px] w-6 h-[3px] rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className={`text-[9px] font-semibold transition-all duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
