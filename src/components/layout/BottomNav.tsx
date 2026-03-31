import { Home, Building2, Mic, BookOpen, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { to: "/", icon: Home, label: "Home", labelHi: "होम" },
  { to: "/divisions", icon: Building2, label: "Divisions", labelHi: "डिवीजन" },
  { to: "/voice-ai", icon: Mic, label: "Voice AI", labelHi: "वॉइस AI" },
  { to: "/quiz", icon: BookOpen, label: "Quiz", labelHi: "क्विज़" },
  { to: "/profile", icon: User, label: "Profile", labelHi: "प्रोफ़ाइल" },
];

export function BottomNav() {
  const { lang } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-lg border-t border-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all text-[10px] font-medium min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : ""
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{lang === "hi" ? item.labelHi : item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
