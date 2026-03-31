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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-pb">
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/40">
        <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-1 min-w-[52px] transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-[22px] w-[22px] transition-all", isActive && "stroke-[2.5]")} />
                  <span className={cn("text-[10px] leading-tight", isActive ? "font-semibold" : "font-medium")}>
                    {lang === "hi" ? item.labelHi : item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
