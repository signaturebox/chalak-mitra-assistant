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
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden safe-area-pb">
      <div className="glass-strong rounded-[22px] shadow-xl shadow-black/10">
        <div className="flex items-center justify-around h-[62px] max-w-lg mx-auto px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 w-14 h-[50px] rounded-2xl relative transition-all",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-[19px] w-[19px] transition-all", isActive && "stroke-[2.5]")} />
                  <span className={cn("text-[9px] leading-none", isActive ? "font-bold" : "font-medium")}>
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
