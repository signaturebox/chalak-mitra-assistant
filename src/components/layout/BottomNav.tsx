import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, BookOpen, Mic, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/voice-ai", icon: Mic, label: "AI" },
  { path: "/quiz", icon: BookOpen, label: "Quiz" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full press-effect"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-1.5 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
