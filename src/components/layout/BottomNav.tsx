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
      <div className="bg-card/95 backdrop-blur-lg border-t border-border/40">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 w-16 h-full relative transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator pill */}
                  {isActive && (
                    <div className="absolute top-1.5 w-8 h-[3px] rounded-full bg-primary animate-scale-in" />
                  )}
                  <div className={cn(
                    "w-10 h-7 rounded-2xl flex items-center justify-center transition-all mt-1",
                    isActive && "bg-primary/12"
                  )}>
                    <item.icon className={cn("h-[20px] w-[20px] transition-all", isActive && "stroke-[2.5]")} />
                  </div>
                  <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-medium")}>
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
