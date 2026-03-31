import { Home, BookOpen, Bot, Wrench, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const navItems: { to: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { to: "/", icon: Home, labelKey: "nav.home" },
  { to: "/knowledge", icon: BookOpen, labelKey: "nav.knowledge" },
  { to: "/troubleshoot", icon: Bot, labelKey: "nav.aiHelp" },
  { to: "/tools", icon: Wrench, labelKey: "nav.tools" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
];

export function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-xs",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
